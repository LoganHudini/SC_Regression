export interface IDiningOrdersDrawerProps {
  ordersDrawer: boolean;
  closeOrdersDrawer: () => void;
  ordersData?: unknown[];
}

export interface IPaymentType {
  id: string;
  name: string;
  message: string;
}

export interface ITipType {
  id: string;
  value: number;
}
