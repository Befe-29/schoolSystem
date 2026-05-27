// src/pages/admin/GradesPage.jsx
import { useState, useEffect } from 'react'
import { BarChart2, Plus, Trash2, Search } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import { getClasses, getStudents, getClassGrades, createGrade, deleteGrade } from '@/lib/firestore'

const GRADE_COLOR = (g) => {
  if (g >= 90) return 'bg-emerald-100 text-emerald-700'
  if (g >= 75) return 'bg-blue-100 text-blue-700'
  if (g >= 60) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-600'
}

const TERMS = ['Term 1','Term 2','Term 3','Midterm','Final','Quiz 1','Quiz 2','Assignment 1','Assignment 2']

export default function GradesPage() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ studentId: '', subject: '', term: '', score: '', maxScore: '100', remarks: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const cls = await getClasses()
    setClasses(cls)
    if (selectedClass) {
      const [stu, grd] = await Promise.all([getStudents(), getClassGrades(selectedClass)])
      setStudents(stu.filter(s => s.classId === selectedClass))
      setGrades(grd)
    }
  }
  useEffect(() => { load() }, [selectedClass])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createGrade({ ...form, classId: selectedClass, score: Number(form.score), maxScore: Number(form.maxScore) })
      await load(); setModal(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await deleteGrade(id); await load()
  }

  const f = (field) => ({ value: form[field] || '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })
  const studentName = (id) => { const s = students.find(s => s.id === id); return s ? `${s.firstName} ${s.lastName}` : '—' }

  const filtered = grades.filter(g =>
    studentName(g.studentId).toLowerCase().includes(search.toLowerCase()) ||
    (g.subject || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Grades</h1><p className="page-subtitle">Manage student assessments</p></div>
        {selectedClass && <button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Grade</button>}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="label">Class</label>
          <select className="input min-w-[200px]" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">Select class…</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selectedClass && (
          <div className="flex-1 max-w-xs">
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input className="input pl-9" placeholder="Student or subject…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {!selectedClass ? (
        <EmptyState icon={BarChart2} title="Select a class" description="Choose a class to view and manage grades" />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Student</th><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th><th>Remarks</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={BarChart2} title="No grades yet" /></td></tr>
              ) : filtered.map(g => {
                const pct = Math.round((g.score / g.maxScore) * 100)
                return (
                  <tr key={g.id}>
                    <td className="font-medium">{studentName(g.studentId)}</td>
                    <td>{g.subject}</td>
                    <td>{g.term}</td>
                    <td>{g.score}/{g.maxScore}</td>
                    <td><span className={`badge ${GRADE_COLOR(pct)}`}>{pct}%</span></td>
                    <td className="text-surface-400 text-xs">{g.remarks || '—'}</td>
                    <td>
                      <button onClick={() => handleDelete(g.id)} className="btn-ghost p-1.5 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Grade">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Student</label>
            <select className="input" {...f('studentId')} required>
              <option value="">Select student…</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <input className="input" placeholder="e.g. Mathematics" {...f('subject')} required />
            </div>
            <div>
              <label className="label">Term / Assessment</label>
              <select className="input" {...f('term')} required>
                <option value="">Select…</option>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Score</label><input type="number" className="input" {...f('score')} required /></div>
            <div><label className="label">Max Score</label><input type="number" className="input" {...f('maxScore')} /></div>
          </div>
          <div><label className="label">Remarks</label><input className="input" placeholder="Optional comments" {...f('remarks')} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Grade'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
