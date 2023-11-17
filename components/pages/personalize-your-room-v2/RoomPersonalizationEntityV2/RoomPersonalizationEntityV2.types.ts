export interface IRoomPersonalizationEntityProps {
  title: string;
  description: string;
  type: 'PER_DAY' | 'PER_STAY';
  price: string;
  currency: string;
  id: string;
  maxQuantity: any;
  setNotificationState: any;
}
