import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomCarousel.module.scss';
import { StableImage } from '../StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import cx from 'classnames';

type CustomCarouselProps = {
  imageData: any;
  slider?: boolean;
  indicatorStyle?: React.CSSProperties;
};

const CustomCarousel: React.FC<CustomCarouselProps> = (props) => {
  const { imageData, slider = false, indicatorStyle } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndRef.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartRef.current !== null && touchEndRef.current !== null) {
      const distance = touchStartRef.current - touchEndRef.current;
      if (distance > 50) {
        handleNext();
      } else if (distance < -50) {
        handlePrev();
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageData.images.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + imageData.images.length) % imageData.images.length,
    );
  };

  useEffect(() => {
    if (slider) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageData.images.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [slider, imageData.images.length]);

  return (
    <>
      {imageData?.images?.length === 1 ? (
        <StableImage
          className={styles.bannerImage}
          src={`${ASSETS_URL}/${imageData?.images[0]?.ratio16to9}`}
        />
      ) : (
        <div
          className={styles.Carousel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <StableImage
            className={styles.bannerImage}
            src={`${ASSETS_URL}/${imageData?.images[currentIndex]?.ratio16to9}`}
          />
          <div className={styles.indicatorIconContainer} style={indicatorStyle}>
            {imageData?.images?.length > 0 &&
              imageData?.images?.map((image: any, index: any) => (
                <div
                  key={index}
                  className={cx(
                    styles.indicatorIcon,
                    currentIndex === index ? styles.activeIndicator : styles.inactiveIndicator,
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomCarousel;
