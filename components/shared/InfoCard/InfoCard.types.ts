export interface IInfoCardProps {
  icon: string;
  title: string;
  details?: string;
  status: boolean;
  completedCheck?: boolean;
  isCardOpened?: boolean;
  children: React.ReactNode;
  paymentType?: string;
}
