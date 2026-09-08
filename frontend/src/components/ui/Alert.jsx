import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const config = {
  error: {
    icon: AlertCircle,
    classes: 'border-red-200 bg-red-50 text-red-800',
    iconClass: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'border-amber-200 bg-amber-50 text-amber-800',
    iconClass: 'text-amber-500',
  },
  success: {
    icon: CheckCircle2,
    classes: 'border-green-200 bg-green-50 text-green-800',
    iconClass: 'text-green-500',
  },
  info: {
    icon: Info,
    classes: 'border-blue-200 bg-blue-50 text-blue-800',
    iconClass: 'text-blue-500',
  },
}

export default function Alert({ variant = 'info', title, children, className = '' }) {
  const { icon: Icon, classes, iconClass } = config[variant] || config.info

  return (
    <div
      role="alert"
      className={`animate-fade-in flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${classes} ${className}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconClass}`} />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
    </div>
  )
}