import React, { useCallback } from 'react';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import cx from 'classnames';
import styles from './IMAGE_LARGE.module.scss';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useRouter } from 'next/router';

interface IHeroBannerProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const IMAGE_LARGE: React.FC<IHeroBannerProps> = ({ config, paths }) => {
  const router = useRouter();
  const redirectUrl = getRedirectLink(paths, config.redirectLink?.linkId);

  const onImageClick = useCallback(() => {
    if (redirectUrl) {
      const LINK = {
        IN_APP: `${router.query.locale ? `/${router.query.locale}` : ''}/${redirectUrl}`,
        EXTERNAL: redirectUrl,
      };

      router.push(LINK[config.redirectLink?.connection as keyof typeof LINK] as string);
    }
  }, [redirectUrl, config.redirectLink?.connection, router]);

  return (
    <div className={styles.imageWrapper}>
      <StableImage
        onClick={onImageClick}
        className={cx(styles.imageImage, {
          [styles.imageImageLink]: Boolean(redirectUrl),
          [styles.shadowedImage]: config.shadowOverlay,
        })}
        src={config.imgURL ? `${ASSETS_URL}/${config.imgURL}` : undefined}
      />
    </div>
  );
};
