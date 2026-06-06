export const MAX_PAGE_SIZE = 100;
export const MAX_PAGE_NUMBER = 25;

export const DefaultPageSize = {
  USERS: 10,
  ROLES: 10,
  CONTACTS: 10,
  SUBSCRIBERS: 10,
  AUDITS: 10,
  EXPERIENCES: 10,
  PROJECTS: 10,
} as const satisfies Record<string, number>;
