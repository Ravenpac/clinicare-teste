export type NoticePriority = 'urgent' | 'important' | 'info';

export interface Notice {
  id: string;
  title: string;
  message: string;
  priority: NoticePriority;
  author: string;
  createdAt: string;
  expiresAt?: string;
  readBy?: string[];
  active: boolean;
}

export const NOTICE_PRIORITY_LABELS: Record<NoticePriority, string> = {
  urgent: 'Urgente',
  important: 'Importante',
  info: 'Informativo',
};
