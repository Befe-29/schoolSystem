// src/pages/admin/UsersPage.jsx
import { useState, useEffect } from 'react'
import { UserCog, Search } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { getAllUsers, updateUserProfile } from '@/lib/firestore'
import { getInitials, ROLE_COLORS, ROLE_LABELS, ROLES, formatDate } from '@/lib/utils'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const load = async () => {
    setUsers(await getAllUsers())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const handleRoleChange = async (uid, newRole) => {
    setUpdatingId(uid)
    await updateUserProfile(uid, { role: newRole })
    await load()
    setUpdatingId(null)
  }

  const filtered = users.filter(u => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Accounts</h1>
        <p className="page-subtitle">{users.length} registered users</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input className="input pl-9" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Joined</th><th>Change Role</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-surface-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4}><EmptyState icon={UserCog} title="No users found" /></td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-200 text-surface-600 text-xs font-bold flex items-center justify-center">
                      {getInitials(`${u.firstName} ${u.lastName}`)}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-surface-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td><span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                <td className="text-surface-400 text-sm">{formatDate(u.createdAt)}</td>
                <td>
                  <select
                    value={u.role || ''}
                    disabled={updatingId === u.id}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="input w-auto text-sm py-1.5"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
