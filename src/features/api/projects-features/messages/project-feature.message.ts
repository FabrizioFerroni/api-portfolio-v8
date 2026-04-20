export enum FeatureError {
  FEATURE_NOT_FOUND = 'Feature not found',
  FEATURE_ERROR = 'Oops... There were problems creating or editing the feature. Please try again later',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
  FEATURE_ALREADY_EXIST = 'Not possible run operation, feature already exist',
}

export enum FeaturesOk {
  FEATURE_CREATED = 'Feature created successfully',
  FEATURE_UPDATED = 'Feature updated successfully',
  FEATURE_REMOVED = 'Feature removed successfully',
}
