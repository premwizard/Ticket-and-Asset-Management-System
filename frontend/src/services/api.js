import { supabase } from './supabase'

const getToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.access_token) {
    throw new Error('Not authenticated — please login')
  }
  return session.access_token
}

export const apiCall = async (url, options = {}) => {
  console.log(`[API] ▶ ${options.method || 'GET'} ${url}`)
  
  const token = await getToken()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeout || 10000)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
    clearTimeout(timer)

    console.log(`[API] ◀ ${res.status} ${url}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      if (body.debug) {
        console.error(`[API DEBUG INFO from ${url}]:`, body.debug)
      }
      throw new Error(
        body.message || body.error || `HTTP ${res.status} on ${url}`
      )
    }
    return res.json()
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      throw new Error(`Timeout: ${url} — backend down?`)
    }
    throw err
  }
}

export const projectsApi = {
  getAll:  ()       => apiCall('/api/projects'),
  getOne:  (id)     => apiCall(`/api/projects/${id}`),
  create:  (data)   => apiCall('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, d)  => apiCall(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  delete:  (id)     => apiCall(`/api/projects/${id}`, { method: 'DELETE' }),
}

export const ticketsApi = {
  getAll:  (pid)    => apiCall(`/api/tickets${pid ? `?project_id=${pid}` : ''}`),
  getOne:  (id)     => apiCall(`/api/tickets/${id}`),
  create:  (data)   => apiCall('/api/tickets', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, d)  => apiCall(`/api/tickets/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  delete:  (id)     => apiCall(`/api/tickets/${id}`, { method: 'DELETE' }),
}

export const assetsApi = {
  getAll:  ()       => apiCall('/api/assets'),
  getOne:  (id)     => apiCall(`/api/assets/${id}`),
  create:  (data)   => apiCall('/api/assets', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, d)  => apiCall(`/api/assets/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  delete:  (id)     => apiCall(`/api/assets/${id}`, { method: 'DELETE' }),
}

export const attachmentsApi = {
  upload: async (ticketId, file) => {
    const token = await getToken()
    const formData = new FormData()
    formData.append('file', file)

    console.log(`[UPLOAD] ${file.name} → ticket ${ticketId}`)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 60000) // 60s for large files

    try {
      const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`
          // ⚠️ NO Content-Type header — browser must set multipart boundary
        },
        body: formData
      })
      clearTimeout(timer)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || body.message || `Upload failed: ${res.status}`)
      }
      return res.json()
    } catch (err) {
      clearTimeout(timer)
      if (err.name === 'AbortError') {
        throw new Error('Upload timed out after 60s')
      }
      throw err
    }
  },
  getAll: (ticketId) => apiCall(`/api/tickets/${ticketId}/attachments`),
  download: (ticketId, attId) => apiCall(`/api/tickets/${ticketId}/attachments/${attId}/download`),
  delete: (ticketId, attId) => apiCall(`/api/tickets/${ticketId}/attachments/${attId}`, { method: 'DELETE' })
}
