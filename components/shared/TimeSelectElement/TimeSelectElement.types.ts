export interface ITimeSelectElementProps {
  selected?: boolean;
  value: string;
  label: string;
  onSelectTime: (time: string | undefined) => void;
}
