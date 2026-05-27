// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROLES } from '@/lib/utils'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import StudentsPage from '@/pages/admin/StudentsPage'
import TeachersPage from '@/pages/admin/TeachersPage'
import ClassesPage from '@/pages/admin/ClassesPage'
import TimetablePage from '@/pages/admin/TimetablePage'
import AttendancePage from '@/pages/admin/AttendancePage'
import GradesPage from '@/pages/admin/GradesPage'
import FinancePage from '@/pages/admin/FinancePage'
import AnnouncementsPage from '@/pages/admin/AnnouncementsPage'
import UsersPage from '@/pages/admin/UsersPage'

// Teacher pages
import TeacherDashboard from '@/pages/teacher/TeacherDashboard'
import TeacherAttendance from '@/pages/teacher/TeacherAttendance'
import TeacherGrades from '@/pages/teacher/TeacherGrades'
import TeacherTimetable from '@/pages/teacher/TeacherTimetable'

// Parent pages
import ParentDashboard from '@/pages/parent/ParentDashboard'
import ParentChildProgress from '@/pages/parent/ParentChildProgress'
import ParentFees from '@/pages/parent/ParentFees'

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard'
import StudentGrades from '@/pages/student/StudentGrades'
import StudentTimetable from '@/pages/student/StudentTimetable'
import StudentAttendance from '@/pages/student/StudentAttendance'

// Loading spinner
import LoadingScreen from '@/components/shared/LoadingScreen'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return children
}

function RoleRedirect() {
  const { profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  switch (profile?.role) {
    case ROLES.ADMIN:   return <Navigate to="/admin" replace />
    case ROLES.TEACHER: return <Navigate to="/teacher" replace />
    case ROLES.PARENT:  return <Navigate to="/parent" replace />
    case ROLES.STUDENT: return <Navigate to="/student" replace />
    default:            return <Navigate to="/login" replace />
  }
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Role redirect from root */}
      <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <DashboardLayout role={ROLES.ADMIN} />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* Teacher routes */}
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
          <DashboardLayout role={ROLES.TEACHER} />
        </ProtectedRoute>
      }>
        <Route index element={<TeacherDashboard />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="grades" element={<TeacherGrades />} />
        <Route path="timetable" element={<TeacherTimetable />} />
      </Route>

      {/* Parent routes */}
      <Route path="/parent" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
          <DashboardLayout role={ROLES.PARENT} />
        </ProtectedRoute>
      }>
        <Route index element={<ParentDashboard />} />
        <Route path="progress" element={<ParentChildProgress />} />
        <Route path="fees" element={<ParentFees />} />
      </Route>

      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
          <DashboardLayout role={ROLES.STUDENT} />
        </ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="attendance" element={<StudentAttendance />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
