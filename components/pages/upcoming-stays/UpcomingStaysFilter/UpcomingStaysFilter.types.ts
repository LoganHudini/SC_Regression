export interface IUpcomingStaysFilterProps {
  setSelectedFilter: React.Dispatch<React.SetStateAction<TimeFilter | null>>;
  selectedFilter: TimeFilter | null;
}

export enum TimeFilter {
  Current = 'Current',
  Upcoming = 'Upcoming',
  Past = 'Past',
}
