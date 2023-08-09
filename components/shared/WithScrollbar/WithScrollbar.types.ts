import { CarouselProps } from 'react-multi-carousel';

export type IWithScrollbarProps = {
  children: React.ReactNode;
} & Partial<CarouselProps>;
