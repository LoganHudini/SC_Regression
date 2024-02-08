import { openLinknewTab } from 'utils/functions';

interface IFrameProps {
  src: string;
  handledrawerState: any;
  name: string;
}

export const IframeComponent: React.FC<IFrameProps> = ({ src, handledrawerState }) => {
  handledrawerState(false);
  openLinknewTab(src);
  return null;
};
