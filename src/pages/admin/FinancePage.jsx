// src/pages/admin/FinancePage.jsx
import { useState, useEffect } from 'react'
import { DollarSign, Plus, CheckCircle, Clock, XCircle } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import StatCard from '@/components/shared/StatCard'
import { getPayments, createPayment, getStudents, getFeeStructures, createFeeStructure } from '@/lib/firestore'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_COLORS = {
  paid:    'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-600',
}

export default function FinancePage() {
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [tab, setTab] = useState('payments')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ studentId: '', description: '', amount: '', dueDate: '', status: 'pending' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [p, s] = await Promise.all([getPayments(), getStudents()])
    setPayments(p); setStudents(s)
  }
  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createPayment({ ...form, amount: Number(form.amount) })
      await load(); setModal(false)
    } finally { setSaving(false) }
  }

  const f = (field) => ({ value: form[field] || '', onChange: e => setForm(p => ({ ...p, [field]: e.target.value })) })
  const studentName = (id) => { const s = students.find(s => s.id === id); return s ? `${s.firstName} ${s.lastName}` : '—' }

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)
  const totalPending   = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0)
  const totalOverdue   = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Finance</h1><p className="page-subtitle">Fees and payment management</p></div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Invoice</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={CheckCircle} label="Collected"  value={formatCurrency(totalCollected)} color="green" />
        <StatCard icon={Clock}       label="Pending"    value={formatCurrency(totalPending)}   color="amber" />
        <StatCard icon={XCircle}     label="Overdue"    value={formatCurrency(totalOverdue)}   color="red"   />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Student</th><th>Description</th><th>Amount</th><th>Due Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-surface-400">No invoices yet.</td></tr>
            ) : payments.map(p => (
              <tr key={p.id}>
                <td className="font-medium">{studentName(p.studentId)}</td>
                <td>{p.description || '—'}</td>
                <td className="font-mono">{formatCurrency(p.amount)}</td>
                <td>{formatDate(p.dueDate)}</td>
                <td><span className={`badge ${STATUS_COLORS[p.status] || STATUS_COLORS.pending}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Invoice">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Student</label>
            <select className="input" {...f('studentId')} required>
              <option value="">Select student…</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <div><label className="label">Description</label><input className="input" placeholder="e.g. Tuition Fee - Term 1" {...f('description')} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Amount ($)</label><input type="number" step="0.01" className="input" {...f('amount')} required /></div>
            <div><label className="label">Due Date</label><input type="date" className="input" {...f('dueDate')} /></div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" {...f('status')}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Invoice'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
