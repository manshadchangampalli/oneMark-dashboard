export const ROUTES = {
  LOGIN:          '/login',
  DASHBOARD:      '/',
  QUESTIONS:      '/questions',
  USERS:          '/users',
  EXAMS:          '/exams',
  SUBJECTS:       '/subjects',
  TOPICS:         '/topics',
} as const;

export function examDetailRoute(id: string) { return `/exams/${id}` }
export function subjectDetailRoute(id: string) { return `/subjects/${id}` }
export function topicDetailRoute(id: string) { return `/topics/${id}` }
export function questionDetailRoute(id: string) { return `/questions/${id}` }
export const QUESTION_NEW_ROUTE = '/questions/new';
export function userDetailRoute(id: string) { return `/users/${id}` }

// Keep legacy pattern for backward compat
export const ROUTE_PATTERN = {
  QUESTION_DETAIL: (id: string) => `/questions/${id}`,
  USER_DETAIL:     (id: string) => `/users/${id}`,
};
