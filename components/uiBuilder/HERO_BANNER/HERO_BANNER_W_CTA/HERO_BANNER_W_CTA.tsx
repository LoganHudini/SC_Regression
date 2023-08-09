import { StableImage } from 'components/shared/StableImage/StableImage';
import React, { useCallback, useEffect } from 'react';
import Carousel from 'react-material-ui-carousel';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './HERO_BANNER_W_CTA.module.scss';
import { useRouter } from 'next/router';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useCheckedIn } from 'storage/check-in.storage';
import { availablePaths } from 'utils/availablePaths';
import { getRoomStatus } from 'utils/getRoomStatus';
import { useQuery } from '@apollo/client';
import {
  GET_RESERVATION_NO_LAST_NAME,
  IGetReservationApiResponse,
} from 'core/graphql/queries/GET_RESERVATION';

interface IHeroBannerProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

interface IHeroBannerItemProps {
  config: IConfig;
  paths: {
    path: string;
    id: string;
  }[];
}

const HeroBannerItem: React.FC<IHeroBannerItemProps> = ({ config, paths }) => {
  const redirectUrl = getRedirectLink(paths, config.redirectLink?.linkId);

  const router = useRouter();

  const onCtaClick = useCallback(() => {
    if (redirectUrl) {
      const LINK = {
        IN_APP: `${router.query.locale ? `/${router.query.locale}` : ''}/${redirectUrl}`,
        EXTERNAL: redirectUrl,
      };

      router.push(LINK[config.redirectLink?.connection as keyof typeof LINK] as string);
    }
  }, [config.redirectLink?.connection, redirectUrl, router]);

  return (
    <div className={styles.bannerWrapper}>
      <StableImage className={styles.bannerImage} src={`${ASSETS_URL}/${config.imgURL}`} />

      <div className={styles.pageTitle}>
        {config.titleH1 && <h1>{config.titleH1}</h1>}
        {config.cta?.isActive && (
          <StyledButton
            className={styles.heroBannerButton}
            onClick={onCtaClick}
            disableRipple
            variant='text'
          >
            {config.cta.title}
          </StyledButton>
        )}
      </div>
    </div>
  );
};

export const HERO_BANNER_W_CTA: React.FC<IHeroBannerProps> = ({ config, paths }) => {
  const router = useRouter();
  const checkinData = useCheckedIn();
  const navigate = useLocalizedRouter();
  const {
    data: reservationData,
    loading: reservationLoading,
    error: reservationError,
  } = useQuery<IGetReservationApiResponse>(GET_RESERVATION_NO_LAST_NAME, {
    context: { clientName: 'rest' },
    variables: {
      confirmationNumber: checkinData.reservationId,
    },
  });

  useEffect(() => {
    if (!checkinData.checkedIn) {
      // navigate(availablePaths.CHECK_IN);
    }
  }, [checkinData.checkedIn, navigate]);
  return (
    <div className={styles.carouselWrapper}>
      <Carousel
        navButtonsAlwaysInvisible
        indicatorContainerProps={{ className: styles.indicatorIconContainer }}
        indicatorIconButtonProps={{ style: { opacity: 0.5 } }}
        activeIndicatorIconButtonProps={{
          className: styles.activeIndicatorIcon,
        }}
        IndicatorIcon={<div className={styles.indicatorIcon} />}
        indicators={(config.slides?.length || 0) > 1}
        className={styles.carousel}
        height={'calc(100vh - 58px)'}
      >
        {config.slides?.map((item, i) => (
          <HeroBannerItem key={i} config={item} paths={paths} />
        ))}
      </Carousel>
    </div>
  );
};
