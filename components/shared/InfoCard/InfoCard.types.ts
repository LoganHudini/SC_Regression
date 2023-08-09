export interface IInfoCardProps {
  icon: string;
  title: string;
  details: string;
  status: boolean;
  isCardOpened?: boolean;
  children: React.ReactNode;
}
