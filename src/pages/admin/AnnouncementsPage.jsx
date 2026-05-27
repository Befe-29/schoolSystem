// src/pages/admin/AnnouncementsPage.jsx
import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2 } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/firestore'
import { formatDate, ROLES } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const AUDIENCE_OPTIONS = [
  { value: ROLES.ADMIN,   label: 'Admins' },
  { value: ROLES.TEACHER, label: 'Teachers' },
  { value: ROLES.PARENT,  label: 'Parents' },
  { value: ROLES.STUDENT, label: 'Students' },
]

export default function AnnouncementsPage() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', audience: [] })
  const [saving, setSaving] = useState(false)

  const load = async () => { setAnnouncements(await getAnnouncements()) }
  useEffect(() => { load() }, [])

  const toggleAudience = (val) => {
    setForm(f => ({
      ...f,
      audience: f.audience.includes(val) ? f.audience.filter(v => v !== val) : [...f.audience, val]
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createAnnouncement({ ...form, authorId: profile?.uid, authorName: `${profile?.firstName} ${profile?.lastName}` })
      await load(); setModal(false); setForm({ title: '', content: '', audience: [] })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true); await deleteAnnouncement(confirm.id)
    await load(); setConfirm(null); setSaving(false)
  }

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1 className="page-title">Announcements</h1><p className="page-subtitle">Broadcast messages to your community</p></div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Announcement</button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon={Bell} title="No announcements" description="Post your first announcement to notify your school community." action={<button onClick={() => setModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Announcement</button>} />
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-surface-900">{a.title}</h3>
                    <p className="text-sm text-surface-600 mt-1">{a.content}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(a.audience || []).map(role => (
                        <span key={role} className="badge bg-primary-50 text-primary-600 capitalize">{role}s</span>
                      ))}
                    </div>
                    <p className="text-xs text-surface-400 mt-2">By {a.authorName || 'Admin'} · {formatDate(a.createdAt)}</p>
                  </div>
                </div>
                <button onClick={() => setConfirm(a)} className="btn-ghost p-1.5 hover:text-red-500 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="label">Title</label><input className="input" placeholder="Announcement title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
          <div>
            <label className="label">Message</label>
            <textarea className="input min-h-[100px] resize-none" placeholder="Write your message here…" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Audience</label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value} type="button"
                  onClick={() => toggleAudience(value)}
                  className={`badge cursor-pointer transition-all ${form.audience.includes(value) ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving || form.audience.length === 0} className="btn-primary">{saving ? 'Posting…' : 'Post Announcement'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete} loading={saving}
        title="Delete announcement?" message="This will remove the announcement for all users." />
    </div>
  )
}
