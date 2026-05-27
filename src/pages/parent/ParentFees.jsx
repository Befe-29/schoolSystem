// src/pages/parent/ParentFees.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getPayments } from '@/lib/firestore'
import { formatDate, formatCurrency } from '@/lib/utils'
import StatCard from '@/components/shared/StatCard'
import { DollarSign, CheckCircle, Clock } from 'lucide-react'

export default function ParentFees() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState([])

  useEffect(() => { getPayments().then(p => setPayments(p.slice(0, 20))) }, [])

  const paid    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fees & Payments</h1>
        <p className="page-subtitle">View and track your fee payment history</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon={CheckCircle} label="Total Paid"    value={formatCurrency(paid)}    color="green" />
        <StatCard icon={Clock}       label="Outstanding"   value={formatCurrency(pending)}  color="amber" />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Description</th><th>Amount</th><th>Due Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-surface-400">No payment records.</td></tr>
            ) : payments.map(p => (
              <tr key={p.id}>
                <td className="font-medium">{p.description || '—'}</td>
                <td className="font-mono">{formatCurrency(p.amount)}</td>
                <td>{formatDate(p.dueDate)}</td>
                <td>
                  <span className={`badge ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : p.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
