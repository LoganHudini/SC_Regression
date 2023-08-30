export interface IDiningMenuFilterProps {
  selectedMenu?: string | null;
  categories?: any;
  ordersData?: unknown[];
  scroll: boolean;
  setScroll: React.Dispatch<React.SetStateAction<boolean>>;
  setScrollHide: React.Dispatch<React.SetStateAction<boolean>>;
}
