import { StableImage } from 'components/shared/StableImage/StableImage';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './CAROUSEL_LANDSCAPE_W_BODY_CTA.module.scss';
import { useRouter } from 'next/router';

interface ICarouselProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

interface ICarouselSlideProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
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

export const CAROUSEL_LANDSCAPE_W_BODY_CTA: React.FC<ICarouselProps> = ({ config, paths }) => {
  const navigate = useLocalizedRouter();
  const viewAllUrl = getRedirectLink(paths, config.viewAll?.linkId);

  const { t } = useTranslation(['ui-builder']);

  const onViewAllClick = useCallback(() => {
    if (viewAllUrl) {
      navigate(viewAllUrl);
    }
  }, [navigate, viewAllUrl]);

  return (
    <WithScrollbar responsive={carousalResponsive} className={styles.carouselWrapper}>
      {config.slides?.map((slide) => (
        <CarouselSlide key={`${slide.imgURL}${slide.titleH3}`} config={slide} paths={paths} />
      ))}

      {config.viewAll?.isActive && (
        <div className={styles.viewAll}>
          <StyledButton
            onClick={onViewAllClick}
            disableRipple
            variant='text'
            className={styles.viewAllBtn}
          >
            {t('View All')}
          </StyledButton>
        </div>
      )}
    </WithScrollbar>
  );
};

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ config, paths }) => {
  const router = useRouter();
  const redirectUrl = getRedirectLink(paths, config.redirectLink?.linkId);

  const onCtaClick = useCallback(() => {
    if (redirectUrl) {
      const LINK = {
        IN_APP: `${router.query.locale ? `/${router.query.locale}` : ''}/${redirectUrl}`,
        EXTERNAL: redirectUrl,
      };

      router.push(LINK[config.redirectLink?.connection as keyof typeof LINK] as string);
    }
  }, [redirectUrl, config.redirectLink?.connection, router]);

  return (
    <div className={styles.carouselSlideWrapper}>
      <div className={styles.imageWrapper}>
        <h3 className={styles.carouselSlideTitle}>{config.titleH3}</h3>
        <StableImage className={styles.carouselSlideImage} src={`${ASSETS_URL}/${config.imgURL}`} />
        <p className={styles.carouselSlideBody}>{config.body}</p>
        {config.cta?.isActive && (
          <StyledButton
            className={styles.ctaButton}
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
