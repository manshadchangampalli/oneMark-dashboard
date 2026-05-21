export const ApiRoute = {
  LOGIN:     '/admin/auth/login',
  LOGOUT:    '/admin/auth/logout',
  REFRESH:   '/admin/auth/refresh',
  ME:        '/admin/auth/me',

  QUESTIONS: '/admin/questions',
  USERS:     '/admin/users',
  EXAMS:     '/admin/exams',
  SUBJECTS:  '/admin/subjects',
  TOPICS:    '/admin/topics',
} as const;

export type ApiRoute = typeof ApiRoute[keyof typeof ApiRoute];
