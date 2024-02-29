import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './ServiceRequestCarousel.module.scss';
import { housekeepingOptions, serviceRequestOptionsArray } from 'storage/housekeeping.storage';
import { CAROUSEL_RESPONSIVE, HouseKeeping } from 'utils/constants';
import { availablePaths } from 'utils/availablePaths';
import cx from 'classnames';
import { CustomReadMore } from 'components/shared/CustomReadMore/CustomReadMore';
import { activeItems, serviceRequestArray } from 'utils/functions';
import { useReactiveVar } from '@apollo/client';

interface ICarouselProps {
  data: any;
  loading?: any;
  error?: any;
}
interface ICarouselSlideProps {
  slide: any;
  slideStyle?: any;
}

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ slide, slideStyle }) => {
  const { t } = useTranslation(['common']);
  const navigate = useLocalizedRouter();
  const serviceRequestOptions: any = useReactiveVar(serviceRequestOptionsArray);

  const handleClick = () => {
    const selectedData = serviceRequestOptions?.find(
      (data: any) => data.carouselLabel === slide?.__typename,
    );
    housekeepingOptions(selectedData);
    navigate(availablePaths.HOUSEKEEPING);
  };
  return (
    <div
      className={cx(styles.carouselSlideWrapper, 'globals-carouselSlideWrapperServiceRequest')}
      onClick={handleClick}
    >
      <StableImage
        src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
        className={cx(styles.carouselSlideImage, 'globals-carouselSlideImage', {
          [styles.carouselWrapperSingleImage]: slideStyle,
        })}
      />
      <div
        className={cx(styles.carouselSlideDetailsWrapper, 'globals-carouselSlideDetailsWrapper', {
          [(styles.detailPosition, 'globals-detailPosition')]: slideStyle,
        })}
      >
        <h3 className={cx(styles.carouselSlideTitle, 'globals-carouselSlideTitle')}>
          {slide?.__typename === HouseKeeping
            ? t('Housekeeping')
            : slide?.__typename === 'Concierge' && t('Maintenance')}
        </h3>
        <CustomReadMore text={t('READ MORE') as string} />
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
      const houseKeeping = activeItems(selectedServiceRequests?.houseKeeping);
      const concierge = activeItems(selectedServiceRequests?.concierge);
      serviceRequestArray(data?.getServiceRequestDetails);
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
            <CarouselSlide
              key={slide?.name}
              slide={slide}
              slideStyle={showServiceRequest?.length === 1}
            />
          ))}
        </WithScrollbar>
      </div>
    )
  );
};
