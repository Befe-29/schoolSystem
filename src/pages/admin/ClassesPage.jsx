// src/pages/admin/ClassesPage.jsx
import { useState, useEffect } from 'react'
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { getClasses, createClass, updateClass, deleteClass, getTeachers, getStudents } from '@/lib/firestore'

const EMPTY = { name: '', grade: '', section: '', teacherId: '', room: '', capacity: '' }

export default function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [studentCounts, setStudentCounts] = useState({})
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [cls, tch, stu] = await Promise.all([getClasses(), getTeachers(), getStudents()])
    const counts = {}
    stu.forEach(s => { if (s.classId) counts[s.classId] = (counts[s.classId] || 0) + 1 })
    setClasses(cls); setTeachers(tch); setStudentCounts(counts); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      editing ? await updateClass(editing.id, form) : await createClass(form)
      await load(); setModal(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true); await deleteClass(confirm.id)
    await load(); setConfirm(null); setSaving(false)
  }

  const f = (field) => ({ value: form[field] || '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })
  const teacherName = (id) => { const t = teachers.find(t => t.id === id); return t ? `${t.firstName} ${t.lastName}` : '—' }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Classes</h1><p className="page-subtitle">{classes.length} classes</p></div>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Class</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-surface-400 col-span-3 text-center py-12">Loading…</p>
        ) : classes.length === 0 ? (
          <div className="col-span-3">
            <EmptyState icon={BookOpen} title="No classes yet" description="Create your first class to get started" action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />Add Class</button>} />
          </div>
        ) : classes.map(c => (
          <div key={c.id} className="card hover:shadow-elevated transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-surface-900 text-lg">{c.name}</h3>
                <p className="text-sm text-surface-400">Grade {c.grade}{c.section ? ` · Section ${c.section}` : ''}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="btn-ghost p-1.5"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => setConfirm(c)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">Teacher</span>
                <span className="font-medium text-surface-700">{teacherName(c.teacherId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Students</span>
                <span className="font-medium text-surface-700">{studentCounts[c.id] || 0} / {c.capacity || '∞'}</span>
              </div>
              {c.room && <div className="flex justify-between">
                <span className="text-surface-400">Room</span>
                <span className="font-medium text-surface-700">{c.room}</span>
              </div>}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Class Name</label><input className="input" placeholder="e.g. Grade 10A" {...f('name')} required /></div>
          <div><label className="label">Grade</label><input className="input" placeholder="e.g. 10" {...f('grade')} /></div>
          <div><label className="label">Section</label><input className="input" placeholder="e.g. A" {...f('section')} /></div>
          <div>
            <label className="label">Class Teacher</label>
            <select className="input" {...f('teacherId')}>
              <option value="">Assign later</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div><label className="label">Room</label><input className="input" placeholder="e.g. Room 12" {...f('room')} /></div>
          <div className="col-span-2"><label className="label">Capacity</label><input type="number" className="input" placeholder="Max students" {...f('capacity')} /></div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Class'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} loading={saving}
        title={`Delete class "${confirm?.name}"?`} message="All timetable entries for this class will also be removed." />
    </div>
  )
}
