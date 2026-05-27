// src/lib/firestore.js
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, serverTimestamp, setDoc
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Generic helpers ──────────────────────────────────────────────────────────

export const getAll = async (col, ...constraints) => {
  const q = constraints.length ? query(collection(db, col), ...constraints) : collection(db, col)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getOne = async (col, id) => {
  const snap = await getDoc(doc(db, col, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const create = async (col, data) => {
  const ref = await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export const update = async (col, id, data) => {
  await updateDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() })
}

export const remove = async (col, id) => {
  await deleteDoc(doc(db, col, id))
}

export const upsert = async (col, id, data) => {
  await setDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

// ─── Users / Profiles ─────────────────────────────────────────────────────────

export const createUserProfile = (uid, data) => upsert('users', uid, data)
export const getUserProfile = (uid) => getOne('users', uid)
export const updateUserProfile = (uid, data) => update('users', uid, data)
export const getAllUsers = (role) =>
  role ? getAll('users', where('role', '==', role)) : getAll('users')

// ─── Students ─────────────────────────────────────────────────────────────────

export const getStudents = () => getAll('students', orderBy('lastName'))
export const getStudent = (id) => getOne('students', id)
export const createStudent = (data) => create('students', data)
export const updateStudent = (id, data) => update('students', id, data)
export const deleteStudent = (id) => remove('students', id)

// ─── Teachers ─────────────────────────────────────────────────────────────────

export const getTeachers = () => getAll('teachers', orderBy('lastName'))
export const getTeacher = (id) => getOne('teachers', id)
export const createTeacher = (data) => create('teachers', data)
export const updateTeacher = (id, data) => update('teachers', id, data)
export const deleteTeacher = (id) => remove('teachers', id)

// ─── Classes ──────────────────────────────────────────────────────────────────

export const getClasses = () => getAll('classes', orderBy('name'))
export const getClass = (id) => getOne('classes', id)
export const createClass = (data) => create('classes', data)
export const updateClass = (id, data) => update('classes', id, data)
export const deleteClass = (id) => remove('classes', id)

// ─── Timetable ────────────────────────────────────────────────────────────────

export const getTimetable = (classId) =>
  classId
    ? getAll('timetable', where('classId', '==', classId), orderBy('dayOfWeek'))
    : getAll('timetable', orderBy('dayOfWeek'))
export const createTimetableEntry = (data) => create('timetable', data)
export const updateTimetableEntry = (id, data) => update('timetable', id, data)
export const deleteTimetableEntry = (id) => remove('timetable', id)

// ─── Attendance ───────────────────────────────────────────────────────────────

export const getAttendance = (classId, date) =>
  getAll('attendance', where('classId', '==', classId), where('date', '==', date))
export const getStudentAttendance = (studentId) =>
  getAll('attendance', where('studentId', '==', studentId), orderBy('date', 'desc'))
export const saveAttendance = (id, data) => upsert('attendance', id, data)

// ─── Grades ───────────────────────────────────────────────────────────────────

export const getGrades = (studentId) =>
  getAll('grades', where('studentId', '==', studentId), orderBy('createdAt', 'desc'))
export const getClassGrades = (classId) =>
  getAll('grades', where('classId', '==', classId))
export const createGrade = (data) => create('grades', data)
export const updateGrade = (id, data) => update('grades', id, data)
export const deleteGrade = (id) => remove('grades', id)

// ─── Finance ──────────────────────────────────────────────────────────────────

export const getFeeStructures = () => getAll('feeStructures')
export const createFeeStructure = (data) => create('feeStructures', data)
export const updateFeeStructure = (id, data) => update('feeStructures', id, data)

export const getPayments = (studentId) =>
  studentId
    ? getAll('payments', where('studentId', '==', studentId), orderBy('createdAt', 'desc'))
    : getAll('payments', orderBy('createdAt', 'desc'))
export const createPayment = (data) => create('payments', data)
export const updatePayment = (id, data) => update('payments', id, data)

// ─── Announcements ────────────────────────────────────────────────────────────

export const getAnnouncements = (audience) =>
  audience
    ? getAll('announcements', where('audience', 'array-contains', audience), orderBy('createdAt', 'desc'))
    : getAll('announcements', orderBy('createdAt', 'desc'))
export const createAnnouncement = (data) => create('announcements', data)
export const deleteAnnouncement = (id) => remove('announcements', id)
