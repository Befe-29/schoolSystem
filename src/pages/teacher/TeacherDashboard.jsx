// src/pages/teacher/TeacherDashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { GraduationCap, ClipboardList, BarChart2, Calendar, BookOpen } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import { getClasses, getStudents, getAnnouncements } from '@/lib/firestore'
import { formatDate } from '@/lib/utils'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ classes: 0, students: 0 })
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const load = async () => {
      const [classes, students, anns] = await Promise.all([
        getClasses(), getStudents(), getAnnouncements('teacher')
      ])
      const myClasses = classes.filter(c => c.teacherId === profile?.uid)
      const myStudents = students.filter(s => myClasses.some(c => c.id === s.classId))
      setStats({ classes: myClasses.length, students: myStudents.length })
      setAnnouncements(anns.slice(0, 4))
    }
    if (profile) load()
  }, [profile])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {profile?.firstName}!</h1>
        <p className="page-subtitle">Here's your teaching overview for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
<StatCard icon={BookOpen} label="My Classes" value={stats.classes} color="blue" />

        <StatCard icon={GraduationCap} label="My Students" value={stats.students} color="primary" />
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-surface-800 mb-4">School Announcements</h3>
        {announcements.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">No announcements.</p>
        ) : announcements.map(a => (
          <div key={a.id} className="py-3 border-b border-surface-50 last:border-0">
            <p className="font-semibold text-surface-800 text-sm">{a.title}</p>
            <p className="text-xs text-surface-500 mt-0.5">{a.content}</p>
            <p className="text-xs text-surface-300 mt-1">{formatDate(a.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
