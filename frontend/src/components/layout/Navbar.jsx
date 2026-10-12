import { useEffect, useRef, useState } from 'react'
import { Bell, Check, CheckCheck, AlertTriangle, Package, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { notificationService } from '../../services/notificationService.js'
import Logo from '../ui/Logo.jsx'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const dropdownRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data.data || [])
      setUnreadCount(data.unread_count || 0)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const toggleOpen = () => {
    if (!open) fetchNotifications()
    setOpen(!open)
  }

  const handleMarkRead = async (n) => {
    if (n.read_at) return
    await notificationService.markAsRead(n.id)
    fetchNotifications()
  }

  const handleMarkAll = async () => {
    setBusy(true)
    try {
      await notificationService.markAllAsRead()
      fetchNotifications()
    } finally {
      setBusy(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={20} className="pointer-events-none" />
          </button>
          <Logo size={22} className="text-slate-700" />
          <p className="text-sm font-medium text-slate-500">
            <span className="hidden sm:inline">Inventra</span>
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleOpen}
              className={`relative rounded-xl p-2.5 transition-all duration-200 ${
                open
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  key={unreadCount}
                  className="animate-pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className="animate-fade-in-down absolute right-0 top-full z-50 mt-2 w-[22rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAll}
                      disabled={busy}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
                    >
                      <CheckCheck size={14} />
                      {busy ? 'Marking...' : 'Mark all read'}
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Package size={22} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">All caught up</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        You'll see low-stock alerts here
                      </p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !n.read_at
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleMarkRead(n)}
                          className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-0 ${
                            isUnread ? 'bg-white hover:bg-blue-50/50' : 'bg-slate-50/50 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isUnread ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <AlertTriangle size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800">{n.data.item_name}</p>
                            <p className="text-xs text-slate-500">
                              {n.data.sku} · {n.data.quantity} left, reorder at {n.data.reorder_level}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                          </div>
                          {isUnread && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                          {n.read_at && (
                            <Check size={14} className="mt-1 shrink-0 text-slate-300" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {initials(user?.name)}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-[11px] text-slate-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}