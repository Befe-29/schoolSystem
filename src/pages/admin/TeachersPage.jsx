// src/pages/admin/TeachersPage.jsx
import { useState, useEffect } from 'react'
import { Users, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '@/lib/firestore'
import { getInitials } from '@/lib/utils'

const SUBJECTS = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Art','Music','Physical Education','Computer Science','Economics','French','Spanish']
const EMPTY = { firstName: '', lastName: '', email: '', phone: '', subject: '', qualification: '', address: '', gender: '' }

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => { setTeachers(await getTeachers()); setLoading(false) }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (t) => { setEditing(t); setForm({ ...t }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      editing ? await updateTeacher(editing.id, form) : await createTeacher(form)
      await load(); setModal(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    await deleteTeacher(confirm.id)
    await load(); setConfirm(null); setSaving(false)
  }

  const f = (field) => ({ value: form[field] || '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  const filtered = teachers.filter(t =>
    `${t.firstName} ${t.lastName} ${t.subject}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Teachers</h1>
          <p className="page-subtitle">{teachers.length} staff members</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Teacher</button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input className="input pl-9" placeholder="Search teachers…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Teacher</th><th>Subject</th><th>Qualification</th><th>Phone</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-surface-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}><EmptyState icon={Users} title="No teachers found" /></td></tr>
            ) : filtered.map(t => (
              <tr key={t.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                      {getInitials(`${t.firstName} ${t.lastName}`)}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">{t.firstName} {t.lastName}</p>
                      <p className="text-xs text-surface-400">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td>{t.subject || '—'}</td>
                <td>{t.qualification || '—'}</td>
                <td>{t.phone || '—'}</td>
                <td>
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(t)} className="btn-ghost p-1.5"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setConfirm(t)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div><label className="label">First Name</label><input className="input" {...f('firstName')} required /></div>
          <div><label className="label">Last Name</label><input className="input" {...f('lastName')} required /></div>
          <div><label className="label">Email</label><input type="email" className="input" {...f('email')} /></div>
          <div><label className="label">Phone</label><input className="input" {...f('phone')} /></div>
          <div>
            <label className="label">Subject</label>
            <select className="input" {...f('subject')}>
              <option value="">Select subject…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Qualification</label><input className="input" placeholder="e.g. B.Ed, M.Sc" {...f('qualification')} /></div>
          <div>
            <label className="label">Gender</label>
            <select className="input" {...f('gender')}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div><label className="label">Address</label><input className="input" {...f('address')} /></div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Teacher'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} loading={saving}
        title={`Delete ${confirm?.firstName} ${confirm?.lastName}?`}
        message="This action cannot be undone."
      />
    </div>
  )
}
