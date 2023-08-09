import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import cx from 'classnames';
import React, { useCallback } from 'react';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './CAROUSEL_SOCIAL.module.scss';
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
  tablet: {
    breakpoint: { max: 100000, min: 731 },
    items: 4,
  },
  mobileLarge: {
    breakpoint: { max: 730, min: 491 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 490, min: 341 },
    items: 2,
  },
  mobileSmall: {
    breakpoint: { max: 340, min: 0 },
    items: 1,
  },
};

export const CAROUSEL_SOCIAL: React.FC<ICarouselProps> = ({ config, paths }) => {
  const navigate = useLocalizedRouter();
  const viewAllUrl = getRedirectLink(paths, config.viewAll?.linkId);

  const { t } = useTranslation(['ui-builder']);

  const onViewAllClick = useCallback(() => {
    if (viewAllUrl) {
      navigate(viewAllUrl);
    }
  }, [navigate, viewAllUrl]);

  return (
    <>
      <h2 className={styles.carouselTitle}>{config.titleH2}</h2>
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

const CarouselSlide: React.FC<ICarouselSlideProps> = ({ config }) => {
  const router = useRouter();

  const onSlideClick = useCallback(() => {
    if (config.redirectLinkUri?.length) {
      router.push(config.redirectLinkUri);
    }
  }, [router, config.redirectLinkUri]);

  return (
    <div className={styles.carouselSlideWrapper}>
      <div
        className={cx(styles.imgWrapper, {
          [styles.imgWrapperClickable]: Boolean(config.redirectLinkUri),
        })}
        onClick={onSlideClick}
      >
        <StableImage className={styles.carouselSlideImage} src={`${ASSETS_URL}/${config.imgURL}`} />
      </div>
    </div>
  );
};
