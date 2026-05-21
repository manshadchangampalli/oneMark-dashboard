export const ROUTES = {
  LOGIN:     '/login',
  DASHBOARD: '/',
  QUESTIONS: '/questions',
  USERS:     '/users',
  EXAMS:     '/exams',
  SUBJECTS:  '/subjects',
  TOPICS:    '/topics',
} as const;

export const ROUTE_PATTERN = {
  QUESTION_DETAIL: (id: string) => `/questions/${id}`,
  USER_DETAIL:     (id: string) => `/users/${id}`,
};
