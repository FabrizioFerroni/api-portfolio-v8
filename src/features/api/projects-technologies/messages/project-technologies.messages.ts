export enum TechnologiesError {
  TECHNOLOGIES_NOT_FOUND = 'Technology not found',
  TECHNOLOGIES_ERROR = 'Oops... There were problems creating or editing the technology. Please try again later',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
  TECHNOLOGIES_ALREADY_EXIST = 'Not possible run operation, technlogy already exist',
}

export enum TechnologiesOk {
  TECHNOLOGY_CREATED = 'Technology created successfully',
  TECHNOLOGY_UPDATED = 'Technology updated successfully',
  TECHNOLOGY_REMOVED = 'Technology removed successfully',
}
