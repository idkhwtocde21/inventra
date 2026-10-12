import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { toast } from 'sonner'
import { itemService } from '../services/itemService.js'
import { categoryService } from '../services/categoryService.js'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import Alert from '../components/ui/Alert.jsx'

const emptyForm = {
  name: '',
  category_id: '',
  quantity: 0,
  unit_price: '',
  reorder_level: 0,
}

export default function Inventory() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState([])

  const [deleteItem, setDeleteItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await itemService.getItems({ page, search, per_page: 10 })
      setItems(data.data || [])
      setLastPage(data.last_page || 1)
      setTotal(data.total || 0)
    } catch {
      toast.error('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [page, search])

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormErrors([])
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name,
      category_id: item.category_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      reorder_level: item.reorder_level,
    })
    setFormErrors([])
    setModalOpen(true)
  }

  const validateForm = () => {
    const errs = []
    if (!form.name.trim()) errs.push('Name is required')
    if (!form.category_id) errs.push('Please select a category')
    const num = (v) => (v === '' || v === null || Number.isNaN(Number(v)))
    if (num(form.quantity)) errs.push('Quantity must be a number')
    else if (Number(form.quantity) < 0) errs.push('Quantity cannot be negative')
    if (num(form.unit_price)) errs.push('Unit price must be a number')
    else if (Number(form.unit_price) < 0) errs.push('Unit price cannot be negative')
    if (num(form.reorder_level)) errs.push('Reorder level must be a number')
    else if (Number(form.reorder_level) < 0) errs.push('Reorder level cannot be negative')
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (validationErrors.length) {
      setFormErrors(validationErrors)
      return
    }
    setSaving(true)
    setFormErrors([])
    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        reorder_level: Number(form.reorder_level),
      }
      if (editing) {
        await itemService.updateItem(editing.id, payload)
        toast.success('Item updated successfully')
      } else {
        await itemService.createItem(payload)
        toast.success('Item added successfully')
      }
      setModalOpen(false)
      loadItems()
    } catch (err) {
      const errors = err.response?.data?.errors
      setFormErrors(errors ? Object.values(errors).flat() : [])
      if (!errors) {
        toast.error(err.response?.data?.message || 'Failed to save item')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await itemService.deleteItem(deleteItem.id)
      toast.success('Item deleted successfully')
      setDeleteItem(null)
      loadItems()
    } catch {
      toast.error('Failed to delete item')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="animate-fade-in-up mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your stock, pricing, and reorder levels</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Add Item
        </Button>
      </div>

      <div
        className="animate-fade-in-up mb-4 flex flex-wrap items-center gap-3"
        style={{ animationDelay: '0.05s' }}
      >
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name or SKU..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-600">
          {total} item{total === 1 ? '' : 's'}
        </span>
      </div>

      <div
        className="animate-fade-in-up overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
        style={{ animationDelay: '0.1s' }}
      >
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Quantity</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Reorder Level</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-3 w-32 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-12 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-12 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="ml-auto h-6 w-16 rounded bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Package size={22} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">No items found</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {search ? 'Try a different search term' : 'Add your first item to get started'}
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item, i) => {
                const isLow = item.quantity <= item.reorder_level
                return (
                  <tr
                    key={item.id}
                    className={`animate-fade-in-up transition-colors hover:bg-slate-50 ${
                      isLow ? 'bg-amber-50/60' : ''
                    }`}
                    style={{ animationDelay: `${Math.min(0.08 * i, 0.4)}s` }}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.sku}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.category ? (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {item.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <Badge variant="warning">
                          <AlertTriangle size={12} />
                          {item.quantity}
                        </Badge>
                      ) : (
                        <span className="font-medium text-slate-700">{item.quantity}</span>
                      )}
                      {isLow && (
                        <span className="ml-1.5 text-[11px] font-medium text-amber-600">low</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {Number(item.unit_price).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.reorder_level}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-2 text-slate-400 transition-all duration-150 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="rounded-lg p-2 text-slate-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div
          className="animate-fade-in-up mt-4 flex items-center justify-end gap-2"
          style={{ animationDelay: '0.15s' }}
        >
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="px-2 text-sm text-slate-600">
            Page <span className="font-semibold text-slate-800">{page}</span> of {lastPage}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className="px-3 py-1.5"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Item'}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formErrors.length > 0 && (
            <Alert variant="warning" title="Please fix the following">
              <ul className="list-inside list-disc space-y-1 text-sm">
                {formErrors.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </Alert>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {editing ? 'SKU is fixed once an item is created.' : 'SKU is generated automatically from the category (e.g. ELEC-001).'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Unit Price</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Reorder Level</label>
            <input
              type="number"
              required
              min="0"
              value={form.reorder_level}
              onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Item"
        maxWidth="max-w-xs"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Delete <span className="font-semibold text-slate-800">{deleteItem?.name}</span>? This can't be undone.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteItem(null)} className="px-3 py-1.5">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting} className="px-3 py-1.5">
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}