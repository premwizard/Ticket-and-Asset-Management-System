/**
 * src/components/Layout.jsx
 *
 * Professional SaaS Layout (Monochrome)
 * Clean, minimal, and enterprise-grade.
 */

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Ticket, 
  Monitor, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Search,
  Moon,
  Sun,
  Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import { Button, cn } from './ui';

const NAV_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Ticket,          label: 'Tickets',   to: '/tickets'   },
  { icon: Monitor,         label: 'Assets',    to: '/assets'    },
  { icon: User,            label: 'Profile',   to: '/profile'   },
];

export default function Layout({ children }) {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navLinks = [...NAV_LINKS];

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans">
      
      {/* ── Desktop Sidebar (Professional Black) ─────────────────────────── */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-300 z-40 bg-neutral-950 dark:bg-neutral-900 border-r border-neutral-800",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center px-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black">
              <Command size={18} />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight text-white">TicKas<span className="font-light opacity-60">App</span></span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.label}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative",
                  isActive 
                    ? "bg-neutral-800 text-white" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                )}
              >
                <link.icon size={18} className={cn(isActive ? "text-white" : "group-hover:text-white")} />
                {!isSidebarCollapsed && <span>{link.label}</span>}
                {isActive && !isSidebarCollapsed && (
                   <div className="absolute right-3 w-1 h-4 rounded-full bg-white/20" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-4">
           <div className={cn("flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50", isSidebarCollapsed && "justify-center")}>
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xs font-bold border border-neutral-700">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
                   <p className="text-[10px] text-neutral-500 font-medium truncate uppercase tracking-wider">{isAdmin ? 'Admin' : 'Staff'}</p>
                </div>
              )}
           </div>
           
           <button 
              onClick={handleLogout}
              className={cn("w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors text-sm font-medium", isSidebarCollapsed && "justify-center")}
           >
             <LogOut size={18} />
             {!isSidebarCollapsed && <span>Sign Out</span>}
           </button>
        </div>
      </aside>

      {/* ── Main Canvas ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Minimal Navbar */}
        <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-30 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-neutral-500 hover:text-black dark:hover:text-white"><Menu size={20} /></button>
             <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-400">
                <span className="hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer">Workspace</span>
                <ChevronRight size={12} />
                <span className="text-neutral-900 dark:text-neutral-50 font-bold uppercase tracking-wider">
                  {navLinks.find(l => l.to === location.pathname)?.label || 'System'}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center px-3 h-9 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus-within:border-black dark:focus-within:border-white transition-all">
                <Search size={14} className="text-neutral-400" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none px-2 text-xs font-medium w-40 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500" />
                <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-1.5 font-mono text-[10px] font-medium text-neutral-500">
                   <span className="text-xs">⌘</span>K
                </kbd>
             </div>

             <div className="flex items-center gap-1">
                <button 
                   onClick={toggleTheme}
                   className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 transition-colors"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <NotificationDropdown />
                <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-2" />
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex w-9 h-9 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 transition-colors"
                >
                  <Menu size={18} />
                </button>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
           <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 4 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -4 }}
               transition={{ duration: 0.2 }}
               className="fade-in"
             >
               {children}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile Sidebar Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[2px] z-[100] lg:hidden" 
            />
            <motion.aside 
              initial={{ x: -280 }} 
              animate={{ x: 0 }} 
              exit={{ x: -280 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-neutral-950 dark:bg-neutral-900 z-[101] p-6 lg:hidden flex flex-col"
            >
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black"><Command size={18} /></div>
                    <span className="font-bold text-lg text-white">TicKas</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-neutral-400 hover:text-white"><X size={20} /></button>
               </div>
               <nav className="flex-1 space-y-2">
                 {navLinks.map(link => (
                    <NavLink 
                      key={link.label} 
                      to={link.to} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        location.pathname === link.to ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                      )}
                    >
                       <link.icon size={20} />
                       {link.label}
                    </NavLink>
                 ))}
               </nav>
               <Button variant="outline" onClick={handleLogout} className="mt-auto w-full border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900">Sign Out</Button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
