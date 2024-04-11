import React from 'react';
import Carousel from 'react-material-ui-carousel';
import styles from './CustomCarousel.module.scss';
import { StableImage } from '../StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';

const CustomCarousel = (props: any) => {
  const { imageData } = props;

  return (
    <>
      {imageData?.images?.length === 1 ? (
        <StableImage
          className={styles.bannerImage}
          src={`${ASSETS_URL}/${imageData?.images[0]?.ratio16to9}`}
        />
      ) : (
        <Carousel
          navButtonsAlwaysInvisible
          indicatorContainerProps={{ className: styles.indicatorIconContainer }}
          indicatorIconButtonProps={{ style: { opacity: 0.5 } }}
          activeIndicatorIconButtonProps={{
            className: styles.activeIndicatorIcon,
          }}
          IndicatorIcon={<div className={styles.indicatorIcon} />}
          indicators={(imageData?.images?.length || 0) > 1}
          className={styles.Carousel}
          autoPlay={false}
          animation={'slide'}
        >
          {imageData?.images?.map((image: any, index: number) => (
            <StableImage
              className={styles.bannerImage}
              key={index}
              src={`${ASSETS_URL}/${image?.ratio16to9}`}
            />
          ))}
        </Carousel>
      )}
    </>
  );
};

export default CustomCarousel;
