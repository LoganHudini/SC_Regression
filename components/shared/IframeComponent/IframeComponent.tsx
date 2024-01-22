import styles from './IframeComponent.module.scss';
import cx from 'classnames';
import { useRef, useEffect, useState } from 'react';
import { openLinknewTab } from 'utils/functions';
import CloseButton from '@icons/closeButton.svg';

interface IFrameProps {
  src: string;
  handledrawerState: any;
  name: string;
}

export const IframeComponent: React.FC<IFrameProps> = ({ src, handledrawerState, name }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { hostname } = new URL(src);

  useEffect(() => {
    if (loaded) {
      const iframe = iframeRef.current && iframeRef.current.contentWindow;
      !iframe?.length && (handledrawerState(false), openLinknewTab(src));
    }
  }, [loaded, src, handledrawerState]);

  return (
    <div className={cx(styles.iframeWrapper)}>
      <div className={cx(styles.navbar)}>
        <button
          type='button'
          onClick={() => {
            handledrawerState(false);
          }}
          className={cx(styles.closeButton)}
        >
          <CloseButton />
        </button>
        <div className={cx(styles.linkDisplay)}>
          <p className={cx(styles.title)}>{name}</p>
          <p className={cx(styles.hostName)}>{hostname}</p>
        </div>
      </div>
      <iframe
        src={src}
        frameBorder='0'
        className={cx(styles.iframe)}
        onLoad={() => setLoaded(true)}
        ref={iframeRef}
      ></iframe>
    </div>
  );
};
