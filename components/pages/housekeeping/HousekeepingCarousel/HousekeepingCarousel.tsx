import React, { useCallback } from 'react';
import Carousel from 'react-material-ui-carousel';
import cx from 'classnames';
import styles from './HousekeepingCarousel.module.scss';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useRouter } from 'next/router';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { IConfig } from 'types/UIConfiguration.types';
import { getRedirectLink } from 'utils/getRedirectLink';

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

  const onBannerClick = useCallback(() => {
    if (redirectUrl) {
      const LINK = {
        IN_APP: `${router.query.locale ? `/${router.query.locale}` : ''}/${redirectUrl}`,
        EXTERNAL: redirectUrl,
      };

      router.push(LINK[config.redirectLink?.connection as keyof typeof LINK] as string);
    }
  }, [config.redirectLink?.connection, redirectUrl, router]);

  return (
    <div
      onClick={onBannerClick}
      className={cx(styles.bannerWrapper, { [styles.bannerWrapperLink]: Boolean(redirectUrl) })}
    >
      <StableImage className={styles.bannerImage} src={`${ASSETS_URL}/${config.imgURL}`} />

      <div className={styles.pageTitle}>{config.titleH2 && <h2>{config.titleH2}</h2>}</div>
    </div>
  );
};

export const HousekeepingCarousel: React.FC<IHeroBannerProps> = ({ config, paths }) => {
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
        height={'312px'}
      >
        {config.slides?.map((item, i) => (
          <HeroBannerItem key={i} config={item} paths={paths} />
        ))}
      </Carousel>
    </div>
  );
};
