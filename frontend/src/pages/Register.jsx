import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Alert from '../components/ui/Alert.jsx'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState([])
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const errs = []
    if (!name.trim()) errs.push('Name is required')
    if (!email.trim()) errs.push('Email is required')
    else if (!emailRe.test(email)) errs.push('Enter a valid email address')
    if (!password) errs.push('Password is required')
    else if (password.length < 8) errs.push('Password must be at least 8 characters')
    if (!passwordConfirmation) errs.push('Please confirm your password')
    else if (password !== passwordConfirmation) errs.push('Passwords do not match')
    if (errs.length) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setError('')
    setErrors([])
    try {
      await register(name, email, password, passwordConfirmation)
      toast.success('Account created successfully')
      navigate('/dashboard')
    } catch (err) {
      const serverErrors = err.response?.data?.errors
      setErrors(serverErrors ? Object.values(serverErrors).flat() : [])
      if (!serverErrors) {
        const msg = err.response?.data?.message || 'Registration failed'
        setError(msg)
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const iconInput = (Icon, type, placeholder, id, value, onChange, extra = {}) => (
    <div className="relative">
      <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        type={type}
        required
        autoComplete={extra.autoComplete}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your inventory in minutes"
      footer={
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
            Sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-5">
          <Alert variant="error" title="Registration failed">
            {error}
          </Alert>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-5">
          <Alert variant="warning" title="Please fix the following">
            <ul className="list-inside list-disc space-y-1 text-sm">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </label>
          {iconInput(User, 'text', 'Your name', 'name', name, (e) => setName(e.target.value), {
            autoComplete: 'name',
          })}
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          {iconInput(Mail, 'email', 'you@example.com', 'email', email, (e) => setEmail(e.target.value), {
            autoComplete: 'email',
          })}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="password_confirmation" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:shadow-none"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  )
}