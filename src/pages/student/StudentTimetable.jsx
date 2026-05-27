// src/pages/student/StudentTimetable.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Calendar } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { getStudents, getTimetable, getTeachers } from '@/lib/firestore'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_MAP = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 }
const PERIODS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00']

const SUBJECT_COLORS = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-emerald-50 border-emerald-200 text-emerald-800',
  'bg-amber-50 border-amber-200 text-amber-800',
  'bg-rose-50 border-rose-200 text-rose-800',
  'bg-cyan-50 border-cyan-200 text-cyan-800',
  'bg-indigo-50 border-indigo-200 text-indigo-800',
  'bg-orange-50 border-orange-200 text-orange-800',
]

export default function StudentTimetable() {
  const { profile } = useAuth()
  const [entries, setEntries] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [subjectColorMap, setSubjectColorMap] = useState({})

  useEffect(() => {
    const load = async () => {
      const [students, tch] = await Promise.all([getStudents(), getTeachers()])
      setTeachers(tch)
      const student = students.find(s => s.email === profile?.email)
      if (student?.classId) {
        const t = await getTimetable(student.classId)
        setEntries(t)
        // Assign colors to subjects
        const subjects = [...new Set(t.map(e => e.subject))]
        const colorMap = {}
        subjects.forEach((s, i) => { colorMap[s] = SUBJECT_COLORS[i % SUBJECT_COLORS.length] })
        setSubjectColorMap(colorMap)
      }
      setLoading(false)
    }
    if (profile) load()
  }, [profile])

  const grid = {}
  entries.forEach(e => { grid[`${e.dayOfWeek}-${e.startTime}`] = e })

  const teacherName = (id) => {
    const t = teachers.find(t => t.id === id)
    return t ? `${t.firstName} ${t.lastName}` : ''
  }

  const today = new Date().getDay() // 0=Sun, 1=Mon...
  const todayEntries = entries.filter(e => e.dayOfWeek === today)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Timetable</h1>
        <p className="page-subtitle">Weekly class schedule</p>
      </div>

      {loading ? (
        <p className="text-surface-400 text-center py-12">Loading…</p>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No timetable yet"
          description="Your class schedule will appear here once it's been set up by the admin."
        />
      ) : (
        <>
          {/* Today's classes */}
          {todayEntries.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display font-bold text-surface-700 text-sm uppercase tracking-wider mb-3">Today's Classes</h2>
              <div className="flex flex-wrap gap-3">
                {todayEntries
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(e => (
                    <div key={e.id} className={`card border flex items-center gap-3 ${subjectColorMap[e.subject] || SUBJECT_COLORS[0]}`}>
                      <div>
                        <p className="font-semibold text-sm">{e.subject}</p>
                        <p className="text-xs opacity-70">{e.startTime} – {e.endTime} {e.room ? `· ${e.room}` : ''}</p>
                        {teacherName(e.teacherId) && <p className="text-xs opacity-60">{teacherName(e.teacherId)}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Full week grid */}
          <div className="overflow-x-auto">
            <table className="table min-w-[700px]">
              <thead>
                <tr>
                  <th className="w-20">Time</th>
                  {DAYS.map(d => (
                    <th key={d} className={today === DAY_MAP[d] ? 'text-primary-600' : ''}>
                      {d}
                      {today === DAY_MAP[d] && <span className="ml-1 badge bg-primary-100 text-primary-600 text-xs">Today</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.slice(0, -1).map((time) => (
                  <tr key={time}>
                    <td className="text-xs font-mono text-surface-400">{time}</td>
                    {DAYS.map(day => {
                      const entry = grid[`${DAY_MAP[day]}-${time}`]
                      return (
                        <td key={day} className="p-1.5">
                          {entry ? (
                            <div className={`rounded-xl border p-2 ${subjectColorMap[entry.subject] || SUBJECT_COLORS[0]}`}>
                              <p className="text-xs font-semibold">{entry.subject}</p>
                              {teacherName(entry.teacherId) && (
                                <p className="text-xs opacity-60">{teacherName(entry.teacherId)}</p>
                              )}
                              {entry.room && <p className="text-xs opacity-50">{entry.room}</p>}
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
        </>
      )}
    </div>
  )
}
