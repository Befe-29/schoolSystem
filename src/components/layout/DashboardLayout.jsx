// src/components/layout/DashboardLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROLES, getInitials, ROLE_COLORS } from '@/lib/utils'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  ClipboardList, BarChart2, DollarSign, Bell, LogOut, School,
  UserCog, ChevronRight, TrendingUp, BookMarked
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const NAV = {
  [ROLES.ADMIN]: [
    { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
    { to: '/admin/students',     label: 'Students',      icon: GraduationCap },
    { to: '/admin/teachers',     label: 'Teachers',      icon: Users },
    { to: '/admin/classes',      label: 'Classes',       icon: BookOpen },
    { to: '/admin/timetable',    label: 'Timetable',     icon: Calendar },
    { to: '/admin/attendance',   label: 'Attendance',    icon: ClipboardList },
    { to: '/admin/grades',       label: 'Grades',        icon: BarChart2 },
    { to: '/admin/finance',      label: 'Finance',       icon: DollarSign },
    { to: '/admin/announcements',label: 'Announcements', icon: Bell },
    { to: '/admin/users',        label: 'User Accounts', icon: UserCog },
  ],
  [ROLES.TEACHER]: [
    { to: '/teacher',            label: 'Dashboard',     icon: LayoutDashboard, end: true },
    { to: '/teacher/attendance', label: 'Attendance',    icon: ClipboardList },
    { to: '/teacher/grades',     label: 'Grades',        icon: BarChart2 },
    { to: '/teacher/timetable',  label: 'Timetable',     icon: Calendar },
  ],
  [ROLES.PARENT]: [
    { to: '/parent',             label: 'Dashboard',     icon: LayoutDashboard, end: true },
    { to: '/parent/progress',    label: 'Child Progress', icon: TrendingUp },
    { to: '/parent/fees',        label: 'Fees & Payments', icon: DollarSign },
  ],
  [ROLES.STUDENT]: [
    { to: '/student',            label: 'Dashboard',     icon: LayoutDashboard, end: true },
    { to: '/student/grades',     label: 'My Grades',     icon: BarChart2 },
    { to: '/student/timetable',  label: 'Timetable',     icon: Calendar },
    { to: '/student/attendance', label: 'Attendance',    icon: ClipboardList },
  ],
}

const ROLE_BG = {
  admin:   'from-primary-600 to-primary-800',
  teacher: 'from-blue-600 to-blue-800',
  parent:  'from-emerald-600 to-emerald-800',
  student: 'from-amber-500 to-orange-600',
}

export default function DashboardLayout({ role }) {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = NAV[role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col bg-white border-r border-surface-100 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-surface-100',
          collapsed && 'justify-center px-2'
        )}>
          <div className={cn('w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', ROLE_BG[role])}>
            <School className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-surface-900 text-lg leading-tight">EduCore</span>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto p-1 rounded-lg hover:bg-surface-100 text-surface-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center p-3 hover:bg-surface-100 text-surface-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn('sidebar-link', isActive && 'active', collapsed && 'justify-center px-2')
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-surface-100 p-3">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className={cn(
              'w-8 h-8 rounded-full bg-gradient-to-br text-white text-xs font-bold flex items-center justify-center flex-shrink-0',
              ROLE_BG[role]
            )}>
              {getInitials(`${profile?.firstName} ${profile?.lastName}`)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-800 truncate">
                  {profile?.firstName} {profile?.lastName}
                </p>
                <p className="text-xs text-surface-400 capitalize">{role}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center p-2 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
