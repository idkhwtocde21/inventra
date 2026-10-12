import { ShieldCheck, BellRing, BarChart3 } from 'lucide-react'
import Logo from '../ui/Logo.jsx'

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure access',
    text: 'Cookie-based sessions with Laravel Sanctum',
  },
  {
    icon: BellRing,
    title: 'Low-stock alerts',
    text: 'Get notified before you run out of stock',
  },
  {
    icon: BarChart3,
    title: 'Live overview',
    text: 'Track value, quantities, and categories at a glance',
  },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <Logo size={44} className="text-slate-300" />
          <span className="text-xl font-semibold text-white">Inventra</span>
        </div>

        <div className="relative">
          <h1 className="animate-fade-in-up text-4xl font-bold leading-tight text-white">
            Manage your stock,
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
              effortlessly.
            </span>
          </h1>
          <p className="animate-fade-in-up mt-4 max-w-md text-slate-400" style={{ animationDelay: '0.1s' }}>
            A simple, local-first inventory manager for tracking items, categories, and stock levels.
          </p>

          <ul className="mt-10 space-y-5">
            {features.map(({ icon: Icon, title: fTitle, text }, i) => (
              <li
                key={fTitle}
                className="animate-fade-in-up flex items-start gap-4"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Icon size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{fTitle}</p>
                  <p className="text-sm text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-600">Local project · Laravel + React</p>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-8 sm:p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Logo size={52} className="mb-4 text-slate-700" />
            <span className="text-lg font-semibold text-slate-800 sm:text-xl">Inventra</span>
          </div>

          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="animate-fade-in-up mt-8" style={{ animationDelay: '0.1s' }}>
            {children}
          </div>

          {footer && (
            <div className="animate-fade-in-up mt-6" style={{ animationDelay: '0.2s' }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}