export enum ContactError {
  CONTACT_NOT_FOUND = 'Contact not found',
  CONTACT_ERROR = 'Oops... There were problems sending the mail contact. Please try again later',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
}

export enum ContactOk {
  CONTACT_CREATED = 'Contact created successfully',
  CONTACT_SEND = 'Send successfully mail to contact',
  CONTACT_UPDATED = 'Contact updated successfully',
  CONTACT_REMOVED = 'Contact removed successfully',
}
