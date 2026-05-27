// src/pages/parent/ParentDashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { GraduationCap, BarChart2, DollarSign, Bell } from 'lucide-react'
import { getStudents, getPayments, getAnnouncements } from '@/lib/firestore'
import { formatDate, formatCurrency } from '@/lib/utils'

export default function ParentDashboard() {
  const { profile } = useAuth()
  const [children, setChildren] = useState([])
  const [payments, setPayments] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const load = async () => {
      const [students, pays, anns] = await Promise.all([
        getStudents(), getPayments(), getAnnouncements('parent')
      ])
      // In a real app, parent would have a list of child IDs
      setChildren(students.slice(0, 2))
      setPayments(pays.slice(0, 3))
      setAnnouncements(anns.slice(0, 3))
    }
    load()
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Parent Portal</h1>
        <p className="page-subtitle">Welcome, {profile?.firstName}! Track your children's progress.</p>
      </div>

      {/* Children cards */}
      {children.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-bold text-surface-700 text-base mb-3">My Children</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children.map(c => (
              <div key={c.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                  {c.firstName?.[0]}{c.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-surface-900">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-surface-400">{c.grade ? `Grade ${c.grade}` : 'Student'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent payments */}
      <div className="card mb-6">
        <h3 className="font-display font-bold text-surface-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" /> Recent Payments
        </h3>
        {payments.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-4">No payment records.</p>
        ) : payments.map(p => (
          <div key={p.id} className="flex justify-between items-center py-3 border-b border-surface-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-surface-800">{p.description}</p>
              <p className="text-xs text-surface-400">{formatDate(p.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-surface-900">{formatCurrency(p.amount)}</p>
              <span className={`badge text-xs ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <div className="card">
        <h3 className="font-display font-bold text-surface-800 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-500" /> Announcements
        </h3>
        {announcements.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-4">No announcements.</p>
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
