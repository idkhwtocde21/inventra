export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed enabled:active:scale-[0.98]'

  const variants = {
    primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  }

  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}