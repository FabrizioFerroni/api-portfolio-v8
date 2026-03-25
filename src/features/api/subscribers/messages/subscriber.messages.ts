export enum SubscriberError {
  SUBSCRIBER_NOT_FOUND = 'Subscriber not found',
  SUBSCRIBER_ERROR = 'Oops... There were problems sending the mail to the subscriber. Please try again later',
  INTERNAL_SERVER_ERROR = 'Internal server error. Contact with the administrator',
  SUBSCRIBER_ALREADY_EXIST = 'Subscriber already exists',
  SUBSCRIBER_ALREADY_UNSUB = 'Subscriber already unsubscribed',
  SUBSCRIBER_ALREADY_SUB = 'Subscriber already subscribed',
}

export enum SubscriberOk {
  SUBSCRIBER_CREATED = 'You have successfully subscribed to my newsletter. Thank you for joining our community.',
  SUBSCRIBER_UPDATED = 'You have successfully updated your subscription. Thank you for your support.',
  SUBSCRIBER_DELETED = 'You have successfully deleted your subscription. We are sorry to see you go.',
  SUBSCRIBER_UNSUBSCRIBED = 'You have unsubscribed from the newsletter. Thank you for your time and support.',
}
