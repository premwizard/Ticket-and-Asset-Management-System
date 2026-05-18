import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import axios from 'axios'

const TICKET_SERVICE_URL = import.meta.env.VITE_TICKET_API_URL || 'http://localhost:5001'

const AuthContext = createContext(null)

const extractRole = (user) => {
  if (!user) return 'user'
  const role = (
    user.user_metadata?.role ||
    user.app_metadata?.role ||
    'user'
  )
  console.log('[ROLE]', role)
  return role
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('user')

  useEffect(() => {
    let mounted = true

    // Step 1: Get existing session immediately
    supabase.auth.getSession().then(({ data: { session }}) => {
      if (!mounted) return
      console.log('[AUTH] Got session:', !!session)
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setRole(extractRole(currentUser))
      setLoading(false)
    }).catch((err) => {
      console.error('[AUTH] getSession error:', err)
      if (mounted) setLoading(false)
    })

    // Step 2: Listen for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      console.log('[AUTH] Change:', event)
      // DO NOT call any supabase methods here
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setRole(extractRole(currentUser))
      setLoading(false)

      // Sync with backend if logged in
      if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
        axios.post(`${TICKET_SERVICE_URL}/auth/sync`, {}, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).catch(err => console.error('[AUTH] Sync failed:', err))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // EMPTY array — runs once only

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signUp = useCallback(async (email, password, roleInput = 'user') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: roleInput } }
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    if (session?.access_token) {
      axios.post(`${TICKET_SERVICE_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      }).catch(err => console.error('[AUTH] Logout sync failed:', err))
    }
    await supabase.auth.signOut()
  }, [session])

  return (
    <AuthContext.Provider value={{
      user, session, loading, role,
      isAdmin: role === 'admin',
      signIn, signUp, signOut,
      // Aliases for compatibility
      login: signIn, signup: signUp, logout: signOut, isAuthenticated: !!user
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
