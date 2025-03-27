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
  email: string;
  emails: Email[];
  onRefresh: () => void;
  onNewEmail: () => void;
  onDeleteEmail: (id: string) => void;
  onReadEmail: (id: string) => void;
}

// Alias para manter compatibilidade com o novo componente EmailContainer
export type EmailContainerProps = EmailBoxProps; 