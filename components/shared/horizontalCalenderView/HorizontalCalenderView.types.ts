import { CarouselProps } from 'react-multi-carousel';

export type IHorizontalCalenderView = {
  children: React.ReactNode;
} & Partial<CarouselProps>;
