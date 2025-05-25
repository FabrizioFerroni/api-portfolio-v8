export enum AuditError {
  AUDIT_NOT_FOUND = 'Audit not found',
  AUDIT_ERROR = 'Oops... There were problems creating the audit. Please try again later',
  AUDIT_NOT_MODULE = 'Not module charged for audit',
  AUDIT_NOT_IP = 'Not ip address charged for audit',
  AUDIT_IP_ERROR = 'Audit ip error',
  AUDIT_ACTION_ERROR = 'Audit action error',
  AUDIT_DETAILS_ERROR = 'Audit details error',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
}

export enum AuditOk {
  AUDIT_CREATED = 'Audit created successfully',
  AUDIT_UPDATED = 'Audit updated successfully',
  AUDIT_REMOVED = 'Audit removed successfully',
}
