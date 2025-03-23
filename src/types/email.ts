export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  content: string;
}

export interface EmailBoxProps {
  email: Email;
  onDelete: () => void;
  onRead: () => void;
} 