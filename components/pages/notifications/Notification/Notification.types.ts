export interface INotificationProps {
  title: string;
  description: string;
  date: string;
  id: string;
  handleDelete?: () => void;
}
