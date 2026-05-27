// src/pages/parent/ParentChildProgress.jsx
import { useState, useEffect } from 'react'
import { getStudents, getGrades, getStudentAttendance } from '@/lib/firestore'
import { formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const GRADE_COLOR = (g) => {
  if (g >= 90) return 'text-emerald-600'
  if (g >= 75) return 'text-blue-600'
  if (g >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export default function ParentChildProgress() {
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState('')
  const [grades, setGrades] = useState([])
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    getStudents().then(s => { setChildren(s.slice(0, 3)) })
  }, [])

  useEffect(() => {
    if (!selectedChild) return
    Promise.all([getGrades(selectedChild), getStudentAttendance(selectedChild)]).then(([g, a]) => {
      setGrades(g); setAttendance(a)
    })
  }, [selectedChild])

  const chartData = grades.map(g => ({
    name: g.subject?.slice(0, 8),
    score: Math.round((g.score / g.maxScore) * 100)
  }))

  const attendanceRate = attendance.length
    ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
    : null

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Child Progress</h1>
        <p className="page-subtitle">View grades and attendance for your children</p>
      </div>

      <div className="mb-6 max-w-xs">
        <label className="label">Select Child</label>
        <select className="input" value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
          <option value="">Choose…</option>
          {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
      </div>

      {selectedChild && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="card">
              <p className="label">Attendance Rate</p>
              <p className={`text-3xl font-display font-bold ${attendanceRate !== null ? GRADE_COLOR(attendanceRate) : 'text-surface-400'}`}>
                {attendanceRate !== null ? `${attendanceRate}%` : 'N/A'}
              </p>
              <p className="text-xs text-surface-400 mt-1">{attendance.length} records</p>
            </div>
            <div className="card">
              <p className="label">Assessments</p>
              <p className="text-3xl font-display font-bold text-surface-900">{grades.length}</p>
              <p className="text-xs text-surface-400 mt-1">recorded grades</p>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="card mb-6">
              <h3 className="font-display font-bold text-surface-800 mb-4">Grades by Subject</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => `${v}%`} />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card">
            <h3 className="font-display font-bold text-surface-800 mb-4">Recent Grades</h3>
            {grades.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-6">No grades yet.</p>
            ) : grades.slice(0, 10).map(g => (
              <div key={g.id} className="flex justify-between items-center py-2.5 border-b border-surface-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-surface-800">{g.subject} — {g.term}</p>
                  <p className="text-xs text-surface-400">{formatDate(g.createdAt)}</p>
                </div>
                <p className={`font-bold text-sm ${GRADE_COLOR(Math.round((g.score/g.maxScore)*100))}`}>
                  {g.score}/{g.maxScore}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
