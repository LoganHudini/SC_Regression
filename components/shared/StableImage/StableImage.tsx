/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useState } from 'react';
import PlaceholderIcon from '@icons/imagePlaceholder.svg';
import styles from './StableImage.module.scss';
import cx from 'classnames';

export const StableImage: React.FC<
  React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
> = (props) => {
  const [loading, setLoading] = useState(props.src ? true : false);
  const [error, setError] = useState(props.src ? false : true);

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imgElement = imageRef.current;

    if (imgElement) {
      if (imgElement.complete) {
        setLoading(false);

        const error = imgElement.naturalWidth === 0;
        if (error) {
          setError(true);
        }
      } else {
        imgElement.onload = () => {
          setLoading(false);
        };

        imgElement.onerror = () => {
          setError(true);
        };
      }
    }

    return () => {
      if (imgElement) {
        imgElement.onload = null;
        imgElement.onerror = null;
      }
    };
  }, []);

  return (
    <>
      {error && (
        <div className={cx(props.className, styles.imagePlaceholder)}>
          <PlaceholderIcon viewBox='0 0 85.272 62.533' />
        </div>
      )}
      {loading && !error && <div className={cx(props.className, styles.animation)} />}
      <img
        {...props}
        className={cx(
          props.className,
          { [styles.fade]: !error },
          { [styles.hidden]: loading || error },
        )}
        ref={imageRef}
      />
    </>
  );
};
