// src/pages/admin/StudentsPage.jsx
import { useState, useEffect } from 'react'
import { GraduationCap, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { getStudents, createStudent, updateStudent, deleteStudent, getClasses } from '@/lib/firestore'
import { formatDate, getInitials } from '@/lib/utils'

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', classId: '', address: '', gender: '' }

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [s, c] = await Promise.all([getStudents(), getClasses()])
    setStudents(s); setClasses(c); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (s) => { setEditing(s); setForm({ ...s }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) { await updateStudent(editing.id, form) }
      else { await createStudent(form) }
      await load()
      setModal(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    await deleteStudent(confirm.id)
    await load()
    setConfirm(null)
    setSaving(false)
  }

  const f = (field) => ({ value: form[field] || '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const className = (id) => classes.find(c => c.id === id)?.name || '—'

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{students.length} enrolled students</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input className="input pl-9" placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Contact</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-surface-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <EmptyState icon={GraduationCap} title="No students found" description="Add your first student to get started" />
              </td></tr>
            ) : filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                      {getInitials(`${s.firstName} ${s.lastName}`)}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-surface-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td>{className(s.classId)}</td>
                <td className="capitalize">{s.gender || '—'}</td>
                <td>{formatDate(s.dateOfBirth)}</td>
                <td>{s.phone || '—'}</td>
                <td>
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(s)} className="btn-ghost p-1.5"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setConfirm(s)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div><label className="label">First Name</label><input className="input" {...f('firstName')} required /></div>
          <div><label className="label">Last Name</label><input className="input" {...f('lastName')} required /></div>
          <div><label className="label">Email</label><input type="email" className="input" {...f('email')} /></div>
          <div><label className="label">Phone</label><input className="input" {...f('phone')} /></div>
          <div><label className="label">Date of Birth</label><input type="date" className="input" {...f('dateOfBirth')} /></div>
          <div>
            <label className="label">Gender</label>
            <select className="input" {...f('gender')}>
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Class</label>
            <select className="input" {...f('classId')}>
              <option value="">No class assigned</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="label">Address</label><input className="input" {...f('address')} /></div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Student'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        loading={saving}
        title={`Delete ${confirm?.firstName} ${confirm?.lastName}?`}
        message="This will permanently delete the student and all associated records."
      />
    </div>
  )
}
