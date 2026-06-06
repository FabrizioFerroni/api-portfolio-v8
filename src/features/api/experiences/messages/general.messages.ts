export enum ExperienceError {
  EXPERIENCE_ALREADY_EXIST = 'Not possible run operation, experience already exist',
  EXPERIENCE_NOT_FOUND = 'Experience not found',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
  EXPERIENCE_ERROR = 'Oops... There were problems creating or editing the experience. Please try again later',
  EXPERIENCE_ALREADY_AT_TOP = 'Experience is already at the top',
  EXPERIENCE_ALREADY_AT_BOTTOM = 'Experience is already at the bottom',
  EXPERIENCE_ONLY_ONE = 'There is only one experience, cannot move',
}

export enum ExperienceMessages {
  EXPERIENCE_CREATED = 'Experience created successfully',
  EXPERIENCE_UPDATED = 'Experience updated successfully',
  EXPERIENCE_REMOVED = 'Experience removed successfully',
  EXPERIENCE_MOVED_UP = 'Experience moved up successfully',
  EXPERIENCE_MOVED_DOWN = 'Experience moved down successfully',
}
