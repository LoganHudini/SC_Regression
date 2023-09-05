import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import styles from './ServiceRequestCarousel.module.scss';
import { useQuery } from '@apollo/client';
import {
  GET_HOUSEKEEPING,
  IGetHousekeepingApiResponse,
} from 'core/graphql/queries/GET_HOUSEKEEPING';
import { housekeepingOptions } from 'storage/housekeeping.storage';
import { HouseKeeping, SERVICE_REQUEST_OPTIONS } from 'utils/constants';
import { availablePaths } from 'utils/availablePaths';

interface ICarouselSlideProps {
  slide: any;
}

const carousalResponsive = {
  desktop: {
    breakpoint: { max: 100000, min: 701 },
    items: 2.5,
  },
  tablet: {
    breakpoint: { max: 700, min: 551 },
    items: 2,
  },
  mobileLarge: {
    breakpoint: { max: 550, min: 491 },
    items: 1.7,
  },
  mobile: {
    breakpoint: { max: 490, min: 361 },
    items: 1.3,
  },
  mobileSmall: {
    breakpoint: { max: 360, min: 0 },
    items: 1,
  },
};

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
    <div className={styles.carouselSlideWrapper} onClick={() => handleClick()}>
      <StableImage
        className={styles.carouselSlideImage}
        src={`${ASSETS_URL}/${slide?.images[0]?.master}`}
      />
      <div className={styles.carouselSlideDetailsWrapper}>
        <h3 className={styles.carouselSlideTitle}>
          {slide?.__typename === HouseKeeping ? t('Housekeeping') : slide?.__typename}
        </h3>
        <p className={styles.carouselSlideViewMore}>{t('view more')}</p>
      </div>
    </div>
  );
};

export const ServiceRequestCarousel = () => {
  const locale = useLocale();
  const { t } = useTranslation(['common']);

  const [showServiceRequest, setShowServiceRequest] = useState([]);

  const { data } = useQuery<IGetHousekeepingApiResponse>(GET_HOUSEKEEPING, {
    context: { clientName: 'host_v1' },
    variables: {
      lang: locale === 'en' ? '' : locale,
    },
  });

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
    <div className={styles.ServiceRequestCarouselWrapper}>
      <WithScrollbar responsive={carousalResponsive} className={styles.carouselWrapper}>
        {showServiceRequest &&
          showServiceRequest?.length > 0 &&
          showServiceRequest?.map((slide: any) => (
            <CarouselSlide key={slide?.name} slide={slide} />
          ))}
      </WithScrollbar>
    </div>
  );
};
