// src/pages/student/StudentDashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { BarChart2, ClipboardList, Calendar, Bell } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import { getGrades, getStudentAttendance, getAnnouncements, getStudents } from '@/lib/firestore'
import { formatDate } from '@/lib/utils'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [grades, setGrades] = useState([])
  const [attendance, setAttendance] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [studentId, setStudentId] = useState(null)

  useEffect(() => {
    const load = async () => {
      // Find the student record linked to this user
      const students = await getStudents()
      const student = students.find(s => s.email === profile?.email)
      if (student) {
        setStudentId(student.id)
        const [g, a, anns] = await Promise.all([
          getGrades(student.id),
          getStudentAttendance(student.id),
          getAnnouncements('student'),
        ])
        setGrades(g)
        setAttendance(a)
        setAnnouncements(anns.slice(0, 4))
      }
    }
    if (profile) load()
  }, [profile])

  const attendanceRate = attendance.length
    ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
    : null

  const avgScore = grades.length
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)
    : null

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Hello, {profile?.firstName}!</h1>
        <p className="page-subtitle">Here's your academic overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={BarChart2}    label="Average Score"    value={avgScore !== null ? `${avgScore}%` : '—'} color="primary" />
        <StatCard icon={ClipboardList} label="Attendance Rate" value={attendanceRate !== null ? `${attendanceRate}%` : '—'} color="green" />
        <StatCard icon={Calendar}     label="Assessments"      value={grades.length} color="blue" />
      </div>

      {/* Recent grades */}
      <div className="card mb-6">
        <h3 className="font-display font-bold text-surface-800 mb-4">Recent Grades</h3>
        {grades.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">No grades recorded yet.</p>
        ) : grades.slice(0, 5).map(g => {
          const pct = Math.round((g.score / g.maxScore) * 100)
          return (
            <div key={g.id} className="flex justify-between items-center py-2.5 border-b border-surface-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-surface-800">{g.subject} — {g.term}</p>
                <p className="text-xs text-surface-400">{formatDate(g.createdAt)}</p>
              </div>
              <span className={`font-bold text-sm ${pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                {g.score}/{g.maxScore}
              </span>
            </div>
          )
        })}
      </div>

      {/* Announcements */}
      <div className="card">
        <h3 className="font-display font-bold text-surface-800 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-500" /> Announcements
        </h3>
        {announcements.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">No announcements.</p>
        ) : announcements.map(a => (
          <div key={a.id} className="py-3 border-b border-surface-50 last:border-0">
            <p className="font-semibold text-sm text-surface-800">{a.title}</p>
            <p className="text-xs text-surface-500 mt-0.5">{a.content}</p>
            <p className="text-xs text-surface-300 mt-1">{formatDate(a.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
