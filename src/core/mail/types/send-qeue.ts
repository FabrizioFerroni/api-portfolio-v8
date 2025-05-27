export type SendQueue<T> = {
  message: T;
  queue: string;
  action: string;
  key: string | null;
};
