// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { GraduationCap, Users, BookOpen, DollarSign, TrendingUp, Bell } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import { getStudents, getTeachers, getClasses, getPayments, getAnnouncements } from '@/lib/firestore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, revenue: 0 })
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [students, teachers, classes, payments, anns] = await Promise.all([
        getStudents(), getTeachers(), getClasses(), getPayments(), getAnnouncements()
      ])
      const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      setStats({ students: students.length, teachers: teachers.length, classes: classes.length, revenue })
      setAnnouncements(anns.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  const enrollmentData = MONTHS.slice(0, 8).map((m, i) => ({
    month: m, students: Math.floor(Math.random() * 30) + 70
  }))

  const revenueData = MONTHS.slice(0, 6).map((m) => ({
    month: m, amount: Math.floor(Math.random() * 20000) + 30000
  }))

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your school's performance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={GraduationCap} label="Total Students" value={stats.students} color="primary" trend="Enrolled this year" />
        <StatCard icon={Users}         label="Total Teachers"  value={stats.teachers}  color="blue"    trend="Active staff" />
        <StatCard icon={BookOpen}      label="Classes"         value={stats.classes}   color="amber"   trend="Running sessions" />
        <StatCard icon={DollarSign}    label="Revenue"         value={formatCurrency(stats.revenue)} color="green" trend="Total collected" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-display font-bold text-surface-800 mb-5">Student Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-display font-bold text-surface-800 mb-5">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary-500" />
          <h3 className="font-display font-bold text-surface-800">Recent Announcements</h3>
        </div>
        {announcements.length === 0 ? (
          <p className="text-sm text-surface-400 py-6 text-center">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50">
                <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-800">{a.title}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{formatDate(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
