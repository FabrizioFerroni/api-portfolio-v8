export enum UserError {
  USER_ALREADY_EXIST = 'Not possible run operation, user already exist',
  USER_IS_NOT_ACTIVE = 'User disabled',
  USER_NOT_FOUND = 'User not found',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
  USER_ERROR = 'Oops... There were problems creating or editing the user. Please try again later',
  USER_PASSWORD_NOT_STRONG = 'Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special symbol.',
  USER_PASSWORD_NOT_MATCH = 'Password and password_verify does not match',
}

export enum UserMessages {
  USER_CREATED = 'User created successfully',
  USER_UPDATED = 'User updated successfully',
  USER_REMOVED = 'User removed successfully',
}
