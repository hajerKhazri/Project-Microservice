export interface Messagerie {
  id?: number;
  idSender: number;
  idReceiver: number;
  content: string;
  sentAt?: string;
}
