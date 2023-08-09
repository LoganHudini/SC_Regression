export interface IDateSelectElementProps {
  selected?: boolean;
  value?: string;
  label?: string;
  onSelectDate: (date: string | undefined) => void;
}
