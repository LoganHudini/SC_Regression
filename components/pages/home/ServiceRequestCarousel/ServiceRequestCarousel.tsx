import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './ServiceRequestCarousel.module.scss';
import { housekeepingOptions } from 'storage/housekeeping.storage';
import { CAROUSEL_RESPONSIVE, HouseKeeping, SERVICE_REQUEST_OPTIONS } from 'utils/constants';
import { availablePaths } from 'utils/availablePaths';
import cx from 'classnames';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';

interface ICarouselProps {
  data: any;
  loading?: any;
  error?: any;
}
interface ICarouselSlideProps {
  slide: any;
}

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide }) => {
  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();

  const handleClick = () => {
    const selectedData = SERVICE_REQUEST_OPTIONS.find(
      (data: any) => data.carouselLabel === slide?.__typename,
    );
    housekeepingOptions(selectedData);
    navigate(availablePaths.HOUSEKEEPING);
  };
  return (
    <div className={styles.carouselSlideWrapper} onClick={handleClick}>
      <StableImage
        className={styles.carouselSlideImage}
        src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
      />
      <div className={styles.carouselSlideDetailsWrapper}>
        <h3 className={styles.carouselSlideTitle}>
          {slide?.__typename === HouseKeeping
            ? t('Housekeeping')
            : slide?.__typename === 'Concierge' && 'Maintenance'}
        </h3>
        <CustomReadMore text={'READ MORE'} />
      </div>
    </div>
  );
};

export const ServiceRequestCarousel: React.FC<ICarouselProps> = ({ data, loading }) => {
  const { t } = useTranslation(['common']);

  const [showServiceRequest, setShowServiceRequest] = useState([]);

  useEffect(() => {
    if (data) {
      const selectedServiceRequests: any = data?.getServiceRequestDetails;
      const houseKeeping = selectedServiceRequests?.houseKeeping?.filter((el: any) => el?.isActive);
      const concierge = selectedServiceRequests?.concierge?.filter((el: any) => el?.isActive);
      const combinedServiceRequestArray: any = [
        houseKeeping?.length > 0 && houseKeeping[0],
        concierge?.length > 0 && concierge[0],
      ];
      setShowServiceRequest(combinedServiceRequestArray?.filter((data: any) => data));
    }
  }, [data]);

  return (
    showServiceRequest?.length > 0 && (
      <div className={styles.ServiceRequestCarouselWrapper}>
        <p className={styles.servicesCarouselTitle}>{t('Services')}</p>
        <WithScrollbar
          responsive={CAROUSEL_RESPONSIVE}
          className={cx(styles.carouselWrapper, {
            [styles.carouselWrapperSingleImage]: showServiceRequest?.length === 1,
          })}
        >
          {showServiceRequest?.map((slide: any) => (
            <CarouselSlide key={slide?.name} slide={slide} />
          ))}
        </WithScrollbar>
      </div>
    )
  );
};
