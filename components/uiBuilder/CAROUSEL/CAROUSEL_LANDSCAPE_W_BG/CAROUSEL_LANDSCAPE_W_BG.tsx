import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import cx from 'classnames';
import React, { useCallback } from 'react';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './CAROUSEL_LANDSCAPE_W_BG.module.scss';
import { useTranslation } from 'react-i18next';
import { StableImage } from 'components/shared/StableImage/StableImage';
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

export const CAROUSEL_LANDSCAPE_W_BG: React.FC<ICarouselProps> = ({ config, paths }) => {
  const navigate = useLocalizedRouter();
  const viewAllUrl = getRedirectLink(paths, config.viewAll?.linkId);

  const { t } = useTranslation(['ui-builder', 'common']);

  const onViewAllClick = useCallback(() => {
    if (viewAllUrl) {
      navigate(viewAllUrl);
    }
  }, [navigate, viewAllUrl]);

  return (
    <>
      <h2 className={styles.carouselTitle}>{t(`${config.titleH2}`)}</h2>
      <div
        className={styles.carouselWrapper}
        style={{ background: config.backgroundColor as string }}
      >
        <WithScrollbar responsive={carousalResponsive} className={styles.imagesWrapper}>
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
      </div>
    </>
  );
};

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ config, paths }) => {
  const { t } = useTranslation(['ui-builder', 'common']);
  const router = useRouter();
  const redirectUrl = getRedirectLink(paths, config.redirectLink?.linkId);

  const onSlideClick = useCallback(() => {
    if (redirectUrl) {
      const LINK = {
        IN_APP: `${router.query.locale ? `/${router.query.locale}` : ''}/${redirectUrl}`,
        EXTERNAL: redirectUrl,
      };

      router.push(LINK[config.redirectLink?.connection as keyof typeof LINK] as string);
    }
  }, [config.redirectLink?.connection, redirectUrl, router]);

  return (
    <div className={styles.carouselSlideWrapper}>
      <div
        className={cx(styles.imgWrapper, {
          [styles.imgWrapperClickable]: Boolean(redirectUrl),
        })}
        onClick={onSlideClick}
      >
        <StableImage className={styles.carouselSlideImage} src={`${ASSETS_URL}/${config.imgURL}`} />

        <h3 className={styles.carouselSlideTitle}>
          <span className={styles.text}>{t(`${config.titleH3}`)}</span>
        </h3>
      </div>
    </div>
  );
};
