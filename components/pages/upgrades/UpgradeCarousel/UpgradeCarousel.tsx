import React from 'react';
import Carousel from 'react-material-ui-carousel';
import KeyboardArrowRightIcon from '@icons/ArrowRight.svg';
import styles from './UpgradeCarousel.module.scss';
import { IUpgradeCarouselProps } from './UpgradeCarousel.types';
import { StableImage } from 'components/shared/StableImage/StableImage';

export const UpgradeCarousel: React.FC<IUpgradeCarouselProps> = ({ images }) => {
  return (
    <div className={styles.carouselWrapper}>
      <Carousel
        height={'169px'}
        indicators={false}
        navButtonsProps={{
          style: { background: 'none', margin: 0, padding: 0, opacity: 1 },
        }}
        PrevIcon={<KeyboardArrowRightIcon className={styles.prevIcon} />}
        NextIcon={<KeyboardArrowRightIcon className={styles.nextIcon} />}
        navButtonsAlwaysInvisible={images.length <= 1}
      >
        {images.length > 0 ? (
          images.map((url, index) => (
            <StableImage className={styles.upgradeCarouselImage} key={`${url}${index}`} src={url} />
          ))
        ) : (
          <StableImage className={styles.upgradeCarouselImage} />
        )}
      </Carousel>
    </div>
  );
};
