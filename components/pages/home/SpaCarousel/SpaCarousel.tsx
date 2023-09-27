import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './SpaCarousel.module.scss';
import { activeItems, buttonArrow } from 'utils/functions';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { spaInformationStorage } from 'storage/spa.storage';
import { availablePaths } from 'utils/availablePaths';
import { CarouselLoader } from 'components/shared/Loaders/Loaders';
import cx from 'classnames';

interface ICarouselProps {
  data: any;
  loading?: boolean;
}
interface ICarouselSlideProps {
  slide: any;
}

export const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide }) => {
  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();

  const handleClick = () => {
    spaInformationStorage({
      selectedSpaInfoName: slide?.name,
      selectedSpaInfoId: slide?.id,
    });
    navigate(availablePaths?.SPA);
  };
  return (
    <div className={styles.carouselSlideWrapper} onClick={handleClick}>
      <StableImage
        className={styles.carouselSlideImage}
        src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
      />
      <div className={styles.carouselSlideDetailsWrapper}>
        {slide?.name && <h3 className={styles.carouselSlideTitle}>{slide?.name}</h3>}
        {slide?.description && (
          <p className={styles.carouselSlideDescription}> {slide?.description}</p>
        )}
        <StyledButton className={styles.carouselSlideViewMore} arrow={buttonArrow}>
          {t('Explore')}
        </StyledButton>
      </div>
    </div>
  );
};

export const SpaCarousel: React.FC<ICarouselProps> = ({ data, loading }) => {
  const { t } = useTranslation(['common']);

  const spaInfoList = activeItems(data?.getSpaDetails?.spa);

  return (
    <>
      <div className={styles.spaCarouselWrapper}>
        <p className={styles.spaTitle}>{t('Spa')}</p>
        {loading ? (
          <CarouselLoader />
        ) : (
          <WithScrollbar
            className={cx(styles.carouselWrapper, {
              [styles.carouselWrapperSingleImage]: spaInfoList?.length === 1,
            })}
            itemClass={styles.carouselItem}
          >
            {spaInfoList?.map((slide: any) => (
              <CarouselSlide key={slide?.name} slide={slide} />
            ))}
          </WithScrollbar>
        )}
      </div>
    </>
  );
};
