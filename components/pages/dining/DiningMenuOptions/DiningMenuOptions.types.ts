export interface IDiningMenuOptionsProps {
  selectMenu: (category: string, name?: any, hours?: any) => void;
  image: string | null;
  name: string;
  categoryId: string;
  hours: {
    close: string;
    day: string;
    open: string;
  }[];
}
