import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './SpaCarousel.module.scss';
import { activeItems } from 'utils/functions';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { spaInformationStorage } from 'storage/spa.storage';
import { availablePaths } from 'utils/availablePaths';

interface ICarouselProps {
  details: any;
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
        <StyledButton className={styles.carouselSlideViewMore}>{t('Explore')}</StyledButton>
      </div>
    </div>
  );
};

export const SpaCarousel: React.FC<ICarouselProps> = ({ details }) => {
  const { t } = useTranslation(['common']);

  const spaInfoList = activeItems(details?.getSpaDetails?.spa);

  return (
    <>
      {spaInfoList?.length > 0 && (
        <div className={styles.spaCarouselWrapper}>
          <p className={styles.spaTitle}>{t('Spa')}</p>
          <WithScrollbar className={styles.carouselWrapper} itemClass={styles.carouselItem}>
            {spaInfoList?.map((slide: any) => (
              <CarouselSlide key={slide?.name} slide={slide} />
            ))}
          </WithScrollbar>
        </div>
      )}
    </>
  );
};
