import { useEffect, useState } from 'react'
import { Plus, Trash2, Tag, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { categoryService } from '../services/categoryService.js'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Alert from '../components/ui/Alert.jsx'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [formErrors, setFormErrors] = useState([])
  const [deleteCategory, setDeleteCategory] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setCategories(await categoryService.getCategories())
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) {
      setFormErrors(['Category name is required'])
      return
    }
    setCreating(true)
    setFormErrors([])
    try {
      await categoryService.createCategory(newName.trim())
      toast.success('Category added successfully')
      setNewName('')
      setShowCreate(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      setFormErrors(errors ? Object.values(errors).flat() : [])
      if (!errors) {
        toast.error(err.response?.data?.message || 'Failed to add category')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await categoryService.deleteCategory(deleteCategory.id)
      toast.success('Category deleted successfully')
      setDeleteCategory(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="animate-fade-in-up mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Organize your items into categories</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setFormErrors([]) }}>
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      <div
        className="animate-fade-in-up overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
        style={{ animationDelay: '0.05s' }}
      >
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-3 w-40 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-10 rounded bg-slate-200" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="ml-auto h-6 w-16 rounded bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-14 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Tag size={22} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">No categories yet</p>
                  <p className="mt-0.5 text-xs text-slate-400">Create your first category</p>
                </td>
              </tr>
            ) : (
              categories.map((c, i) => (
                <tr
                  key={c.id}
                  className="animate-fade-in-up transition-colors hover:bg-slate-50"
                  style={{ animationDelay: `${Math.min(0.06 * i, 0.3)}s` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Tag size={15} />
                      </div>
                      <span className="font-medium text-slate-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.items_count > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.items_count} item{c.items_count === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteCategory(c)}
                      className="rounded-lg p-2 text-slate-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Category">
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
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
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Category name"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        title="Delete Category"
        maxWidth="max-w-xs"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Delete <span className="font-semibold text-slate-800">{deleteCategory?.name}</span>? Items using it can't be reassigned.
          </p>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteCategory(null)} className="px-3 py-1.5">
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