export enum ProjectError {
  PROJECT_NOT_FOUND = 'Project not found',
  PROJECT_ERROR = 'Oops... There were problems creating or editing the project. Please try again later',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
  PROJECT_ERROR_SLUG = 'Oops... There is slug already is taken',
}

export enum ProjectOk {
  PROJECT_CREATED = 'Project created successfully',
  PROJECT_UPDATED = 'Project updated successfully',
  PROJECT_REMOVED = 'Project removed successfully',
}
