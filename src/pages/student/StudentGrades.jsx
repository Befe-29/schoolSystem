// src/pages/student/StudentGrades.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { BarChart2 } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { getGrades, getStudents } from '@/lib/firestore'
import { formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const GRADE_COLOR = (pct) => {
  if (pct >= 90) return 'bg-emerald-100 text-emerald-700'
  if (pct >= 75) return 'bg-blue-100 text-blue-700'
  if (pct >= 60) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-600'
}

export default function StudentGrades() {
  const { profile } = useAuth()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const students = await getStudents()
      const student = students.find(s => s.email === profile?.email)
      if (student) {
        const g = await getGrades(student.id)
        setGrades(g)
      }
      setLoading(false)
    }
    if (profile) load()
  }, [profile])

  const chartData = grades.reduce((acc, g) => {
    const existing = acc.find(a => a.subject === g.subject)
    const pct = Math.round((g.score / g.maxScore) * 100)
    if (existing) {
      existing.score = Math.round((existing.score + pct) / 2)
    } else {
      acc.push({ subject: g.subject?.slice(0, 8), score: pct })
    }
    return acc
  }, [])

  const avg = grades.length
    ? Math.round(grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / grades.length)
    : null

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Grades</h1>
        <p className="page-subtitle">
          {avg !== null ? `Overall average: ${avg}%` : 'Your academic performance'}
        </p>
      </div>

      {chartData.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-display font-bold text-surface-800 mb-4">Performance by Subject</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Subject</th><th>Term</th><th>Score</th><th>Grade</th><th>Remarks</th><th>Date</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-surface-400">Loading…</td></tr>
            ) : grades.length === 0 ? (
              <tr><td colSpan={6}><EmptyState icon={BarChart2} title="No grades yet" description="Your grades will appear here once teachers record them." /></td></tr>
            ) : grades.map(g => {
              const pct = Math.round((g.score / g.maxScore) * 100)
              return (
                <tr key={g.id}>
                  <td className="font-medium">{g.subject}</td>
                  <td>{g.term}</td>
                  <td className="font-mono">{g.score}/{g.maxScore}</td>
                  <td><span className={`badge ${GRADE_COLOR(pct)}`}>{pct}%</span></td>
                  <td className="text-surface-400 text-xs">{g.remarks || '—'}</td>
                  <td className="text-surface-400 text-sm">{formatDate(g.createdAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
