export interface ICardProps {
  children: React.ReactNode;
  displayShowMoreBtn?: boolean;
  onClickShowMore?: () => void;
  displayEditBtn?: boolean;
  onClickEdit?: () => void;
  isCardOpened?: boolean;
}
