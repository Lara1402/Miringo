import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RegisterPage } from './features/auth/RegisterPage';
import { LoginPage } from './features/auth/LoginPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { AccessDeniedPage } from './features/auth/AccessDeniedPage';
import { StudentDashboard } from './features/student/StudentDashboard';
import { StudentProfilePage } from './features/student/StudentProfilePage';
import { FacultyDashboard } from './features/faculty/FacultyDashboard';
import { FacultyPending } from './features/faculty/FacultyPending';
import { AdminUsers } from './features/admin/AdminUsers';
import { SyllabusPage } from './features/syllabus/SyllabusPage';
import { QuestSolvingPage } from './features/quest/QuestSolvingPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/access-denied',
    element: <AccessDeniedPage />,
  },

  // Protected: Student Dashboard
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },

  // Protected: Student Profile & Dossier (/student & /profile)
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
        <StudentProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
        <StudentProfilePage />
      </ProtectedRoute>
    ),
  },

  // Protected: Syllabus Map (Los Santos GPS)
  {
    path: '/syllabus',
    element: (
      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
        <SyllabusPage />
      </ProtectedRoute>
    ),
  },

  // Protected: Quest / Question Solving & Faculty Curriculum Editor
  {
    path: '/quest',
    element: (
      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
        <QuestSolvingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quest/:nodeId',
    element: (
      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
        <QuestSolvingPage />
      </ProtectedRoute>
    ),
  },

  // Protected: Faculty Routes
  {
    path: '/faculty/pending',
    element: (
      <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
        <FacultyPending />
      </ProtectedRoute>
    ),
  },
  {
    path: '/faculty/dashboard',
    element: (
      <ProtectedRoute
        allowedRoles={['faculty', 'admin']}
        requiredApproval={['approved']}
      >
        <FacultyDashboard />
      </ProtectedRoute>
    ),
  },

  // Protected: Admin Routes
  {
    path: '/admin',
    element: <Navigate to="/admin/users" replace />,
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminUsers />
      </ProtectedRoute>
    ),
  },

  // Default redirect
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
