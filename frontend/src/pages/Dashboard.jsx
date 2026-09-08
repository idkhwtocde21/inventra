import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Tag,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { useCountUp } from '../hooks/useCountUp.js'
import { itemService } from '../services/itemService.js'
import { categoryService } from '../services/categoryService.js'
import Badge from '../components/ui/Badge.jsx'

function StatCard({ label, value, icon: Icon, tone, delay, prefix }) {
  const count = useCountUp(value, { duration: 800 })

  const tones = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    red: 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white',
    green: 'bg-green-50 text-green-500 group-hover:bg-green-500 group-hover:text-white',
    violet: 'bg-violet-50 text-violet-500 group-hover:bg-violet-500 group-hover:text-white',
  }

  return (
    <Link
      to={label === 'Low Stock' ? '/inventory' : label === 'Categories' ? '/categories' : '/'}
      className="animate-fade-in-up group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">
            {prefix}{count.toLocaleString()}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 ${tones[tone]}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </Link>
  )
}

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
          style={{ animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  )
}

function getGreeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, totalCategories: 0, totalValue: 0 })
  const [lowStockItems, setLowStockItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [allData, catsData, lowData] = await Promise.all([
          itemService.getItems({ per_page: 1 }),
          categoryService.getCategories(),
          itemService.getItems({ per_page: 100, low_stock: true }),
        ])

        const items = lowData.data || []
        setLowStockItems(items)
        const totalValue = items.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0), 0)

        setStats({
          totalItems: allData.total || 0,
          lowStock: items.length,
          totalCategories: catsData.length || 0,
          totalValue,
        })
        setCategories(catsData)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categoriesWithStock = useMemo(
    () =>
      categories
        .map((c) => ({
          ...c,
          pct: stats.totalItems ? Math.round(((c.items_count || 0) / stats.totalItems) * 100) : 0,
        }))
        .sort((a, b) => b.items_count - a.items_count),
    [categories, stats.totalItems],
  )

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const cards = [
    { label: 'Total Items', value: stats.totalItems, icon: Package, tone: 'blue', delay: 0.05 },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, tone: 'red', delay: 0.1 },
    { label: 'Categories', value: stats.totalCategories, icon: Tag, tone: 'green', delay: 0.15 },
    { label: 'Low Stock Value', value: stats.totalValue, icon: DollarSign, tone: 'violet', delay: 0.2, prefix: '$' },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="animate-fade-in-up mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
            {getGreeting(new Date().getHours())}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{date}</p>
        </div>
        {user?.role === 'admin' && (
          <Badge variant="info">
            <span className="font-semibold uppercase tracking-wide">Admin</span>
          </Badge>
        )}
      </div>

      {loading ? (
        <Skeleton />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>

          {stats.lowStock > 0 && (
            <div
              className="animate-fade-in-up mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center"
              style={{ animationDelay: '0.25s' }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <AlertTriangle size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    {stats.lowStock} item{stats.lowStock > 1 ? 's are' : ' is'} running low on stock
                  </p>
                  <p className="text-sm text-amber-700">
                    Quantity has dropped to or below the reorder level. Restock soon to avoid shortage.
                  </p>
                </div>
              </div>
              <Link
                to="/inventory"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
              >
                View items
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div
              className="animate-fade-in-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-800">Low Stock Items</h2>
                <Link
                  to="/inventory"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  See all <ChevronRight size={14} />
                </Link>
              </div>
              <ul className="divide-y divide-slate-100">
                {lowStockItems.length === 0 ? (
                  <li className="px-5 py-10 text-center text-sm text-slate-400">
                    All items are well stocked
                  </li>
                ) : (
                  lowStockItems.slice(0, 5).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {item.sku} · {item.category?.name || 'Uncategorized'}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-red-600">{item.quantity} left</p>
                        <p className="text-xs text-slate-400">reorder at {item.reorder_level}</p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div
              className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              style={{ animationDelay: '0.35s' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Categories</h2>
                <span className="text-xs text-slate-400">{stats.totalCategories} total</span>
              </div>
              {categoriesWithStock.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No categories yet</p>
              ) : (
                <div className="space-y-3">
                  {categoriesWithStock.map((c) => (
                    <div key={c.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{c.name}</span>
                        <span className="text-slate-400">{c.items_count} items</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-700"
                          style={{ width: `${Math.max(c.pct, 3)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}