// src/pages/admin/TimetablePage.jsx
import { useState, useEffect } from 'react'
import { Calendar, Plus, Trash2 } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import { getTimetable, createTimetableEntry, deleteTimetableEntry, getClasses, getTeachers } from '@/lib/firestore'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday']
const PERIODS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']
const DAY_MAP = { Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5 }
const SUBJECTS = ['Mathematics','English','Science','History','Geography','Physics','Chemistry','Biology','Art','Music','Physical Education','Computer Science']

export default function TimetablePage() {
  const [entries, setEntries] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: '', endTime: '', subject: '', teacherId: '', room: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [tch, cls] = await Promise.all([getTeachers(), getClasses()])
    setTeachers(tch); setClasses(cls)
    if (selectedClass) {
      const t = await getTimetable(selectedClass)
      setEntries(t)
    }
  }
  useEffect(() => { load() }, [selectedClass])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createTimetableEntry({ ...form, classId: selectedClass })
      const t = await getTimetable(selectedClass); setEntries(t)
      setModal(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await deleteTimetableEntry(id)
    const t = await getTimetable(selectedClass); setEntries(t)
  }

  const f = (field) => ({ value: form[field] || '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })
  const teacherName = (id) => { const t = teachers.find(t => t.id === id); return t ? `${t.firstName} ${t.lastName}` : '' }

  const grid = {}
  entries.forEach(e => {
    const key = `${e.dayOfWeek}-${e.startTime}`
    grid[key] = e
  })

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Timetable</h1><p className="page-subtitle">Weekly schedule by class</p></div>
        {selectedClass && (
          <button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Period</button>
        )}
      </div>

      {/* Class selector */}
      <div className="mb-6 max-w-xs">
        <label className="label">Select Class</label>
        <select className="input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">Choose a class…</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!selectedClass ? (
        <EmptyState icon={Calendar} title="Select a class" description="Choose a class above to view and manage its timetable" />
      ) : (
        <div className="overflow-x-auto">
          <table className="table min-w-[700px]">
            <thead>
              <tr>
                <th className="w-20">Time</th>
                {DAYS.map(d => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.slice(0, -1).map((time, i) => (
                <tr key={time}>
                  <td className="text-xs font-mono text-surface-400">{time}</td>
                  {DAYS.map(day => {
                    const entry = grid[`${DAY_MAP[day]}-${time}`]
                    return (
                      <td key={day} className="p-1.5">
                        {entry ? (
                          <div className="bg-primary-50 border border-primary-100 rounded-xl p-2 group relative">
                            <p className="text-xs font-semibold text-primary-800">{entry.subject}</p>
                            <p className="text-xs text-primary-500">{teacherName(entry.teacherId)}</p>
                            {entry.room && <p className="text-xs text-primary-400">{entry.room}</p>}
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-red-400 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="h-14 rounded-xl border-2 border-dashed border-surface-100" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Period">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Day</label>
            <select className="input" value={form.dayOfWeek} onChange={e => setForm(p => ({ ...p, dayOfWeek: Number(e.target.value) }))}>
              {DAYS.map((d, i) => <option key={d} value={i+1}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Time</label>
              <select className="input" {...f('startTime')} required>
                <option value="">Select…</option>
                {PERIODS.slice(0,-1).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">End Time</label>
              <select className="input" {...f('endTime')} required>
                <option value="">Select…</option>
                {PERIODS.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Subject</label>
            <select className="input" {...f('subject')} required>
              <option value="">Select subject…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Teacher</label>
            <select className="input" {...f('teacherId')}>
              <option value="">Assign later</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div><label className="label">Room</label><input className="input" placeholder="e.g. Lab 3" {...f('room')} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Add Period'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
