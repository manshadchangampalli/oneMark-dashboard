import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AdminLayout } from './layouts/AdminLayout';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}

function PublicRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
}

const Login           = lazy(() => import('@/screens/login/Login'));
const Dashboard       = lazy(() => import('@/screens/dashboard/Dashboard'));
const Questions       = lazy(() => import('@/screens/questions/Questions'));
const QuestionDetail  = lazy(() => import('@/screens/questions/QuestionDetail'));
const Users           = lazy(() => import('@/screens/users/Users'));
const UserDetail      = lazy(() => import('@/screens/users/UserDetail'));
const Exams           = lazy(() => import('@/screens/exams/Exams'));
const ExamDetail      = lazy(() => import('@/screens/exams/ExamDetail'));
const Subjects        = lazy(() => import('@/screens/subjects/Subjects'));
const SubjectDetail   = lazy(() => import('@/screens/subjects/SubjectDetail'));
const Topics          = lazy(() => import('@/screens/topics/Topics'));
const TopicDetail     = lazy(() => import('@/screens/topics/TopicDetail'));

function Loading() {
  return <div className="min-h-svh flex items-center justify-center text-sm text-app-muted">Loading…</div>;
}

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: ROUTES.DASHBOARD,    element: <Suspense fallback={<Loading />}><Dashboard /></Suspense> },
          { path: ROUTES.QUESTIONS,    element: <Suspense fallback={<Loading />}><Questions /></Suspense> },
          { path: 'questions/:id',     element: <Suspense fallback={<Loading />}><QuestionDetail /></Suspense> },
          { path: ROUTES.USERS,        element: <Suspense fallback={<Loading />}><Users /></Suspense> },
          { path: 'users/:id',         element: <Suspense fallback={<Loading />}><UserDetail /></Suspense> },
          { path: ROUTES.EXAMS,        element: <Suspense fallback={<Loading />}><Exams /></Suspense> },
          { path: 'exams/:id',         element: <Suspense fallback={<Loading />}><ExamDetail /></Suspense> },
          { path: ROUTES.SUBJECTS,     element: <Suspense fallback={<Loading />}><Subjects /></Suspense> },
          { path: 'subjects/:id',      element: <Suspense fallback={<Loading />}><SubjectDetail /></Suspense> },
          { path: ROUTES.TOPICS,       element: <Suspense fallback={<Loading />}><Topics /></Suspense> },
          { path: 'topics/:id',        element: <Suspense fallback={<Loading />}><TopicDetail /></Suspense> },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      { path: ROUTES.LOGIN, element: <Suspense fallback={<Loading />}><Login /></Suspense> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
]);
