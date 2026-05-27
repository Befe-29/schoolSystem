// src/pages/student/StudentAttendance.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import StatCard from '@/components/shared/StatCard'
import { getStudents, getStudentAttendance } from '@/lib/firestore'
import { formatDate } from '@/lib/utils'

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  absent:  { label: 'Absent',  color: 'bg-red-100 text-red-600',         icon: XCircle },
  late:    { label: 'Late',    color: 'bg-amber-100 text-amber-700',      icon: Clock },
}

export default function StudentAttendance() {
  const { profile } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const students = await getStudents()
      const student = students.find(s => s.email === profile?.email)
      if (student) {
        const a = await getStudentAttendance(student.id)
        setAttendance(a)
      }
      setLoading(false)
    }
    if (profile) load()
  }, [profile])

  const total   = attendance.length
  const present = attendance.filter(a => a.status === 'present').length
  const absent  = attendance.filter(a => a.status === 'absent').length
  const late    = attendance.filter(a => a.status === 'late').length
  const rate    = total ? Math.round((present / total) * 100) : null

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">
          {rate !== null ? `Attendance rate: ${rate}%` : 'Your attendance record'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardList} label="Total Days"  value={total}   color="primary" />
        <StatCard icon={CheckCircle}   label="Present"     value={present} color="green" />
        <StatCard icon={XCircle}       label="Absent"      value={absent}  color="red" />
        <StatCard icon={Clock}         label="Late"        value={late}    color="amber" />
      </div>

      {/* Attendance rate bar */}
      {rate !== null && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-surface-700">Overall Attendance</span>
            <span className={`font-bold text-sm ${rate >= 75 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
              {rate}%
            </span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${rate >= 75 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
              style={{ width: `${rate}%` }}
            />
          </div>
          {rate < 75 && (
            <p className="text-xs text-amber-600 mt-2">⚠ Attendance below 75%. Please improve your attendance.</p>
          )}
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="text-center py-10 text-surface-400">Loading…</td></tr>
            ) : attendance.length === 0 ? (
              <tr><td colSpan={2}>
                <EmptyState icon={ClipboardList} title="No attendance records" description="Your attendance will appear here once it's been marked." />
              </td></tr>
            ) : attendance.map((a, i) => {
              const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.absent
              const Icon = cfg.icon
              return (
                <tr key={i}>
                  <td className="font-medium">{a.date || formatDate(a.createdAt)}</td>
                  <td>
                    <span className={`badge gap-1.5 ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
