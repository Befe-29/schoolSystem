// src/pages/admin/AttendancePage.jsx
import { useState, useEffect } from 'react'
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { getClasses, getStudents, saveAttendance, getAttendance } from '@/lib/firestore'

const STATUS = {
  present: { label: 'Present', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  absent:  { label: 'Absent',  color: 'bg-red-100 text-red-600',         icon: XCircle },
  late:    { label: 'Late',    color: 'bg-amber-100 text-amber-700',      icon: Clock },
}

export default function AttendancePage() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({}) // studentId -> status
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getClasses().then(setClasses)
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    const load = async () => {
      const stu = await getStudents()
      setStudents(stu.filter(s => s.classId === selectedClass))
      const existing = await getAttendance(selectedClass, date)
      const map = {}
      existing.forEach(e => { map[e.studentId] = e.status })
      setAttendance(map)
    }
    load()
  }, [selectedClass, date])

  const setStatus = (studentId, status) => {
    setAttendance(a => ({ ...a, [studentId]: status }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(students.map(s => {
        const id = `${selectedClass}_${date}_${s.id}`
        return saveAttendance(id, {
          classId: selectedClass, date, studentId: s.id,
          status: attendance[s.id] || 'absent'
        })
      }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  const counts = {
    present: students.filter(s => attendance[s.id] === 'present').length,
    absent:  students.filter(s => attendance[s.id] === 'absent' || !attendance[s.id]).length,
    late:    students.filter(s => attendance[s.id] === 'late').length,
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Mark daily attendance by class</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="label">Class</label>
          <select className="input min-w-[200px]" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">Select class…</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {!selectedClass ? (
        <EmptyState icon={ClipboardList} title="Select a class" description="Choose a class and date to mark attendance" />
      ) : (
        <>
          {/* Summary */}
          <div className="flex gap-3 mb-5 flex-wrap">
            {Object.entries(counts).map(([k, v]) => (
              <div key={k} className={`badge ${STATUS[k].color} text-sm px-3 py-1`}>
                {STATUS[k].label}: {v}
              </div>
            ))}
          </div>

          <div className="card mb-5">
            <div className="space-y-2">
              {students.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-8">No students in this class.</p>
              ) : students.map(s => {
                const current = attendance[s.id] || 'absent'
                return (
                  <div key={s.id} className="flex items-center gap-4 py-2.5 border-b border-surface-50 last:border-0">
                    <div className="flex-1 font-medium text-surface-800">{s.firstName} {s.lastName}</div>
                    <div className="flex gap-2">
                      {Object.entries(STATUS).map(([key, { label, color }]) => (
                        <button
                          key={key}
                          onClick={() => setStatus(s.id, key)}
                          className={`badge cursor-pointer transition-all ${current === key ? color : 'bg-surface-100 text-surface-400'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || students.length === 0} className="btn-primary">
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Attendance'}
          </button>
        </>
      )}
    </div>
  )
}
