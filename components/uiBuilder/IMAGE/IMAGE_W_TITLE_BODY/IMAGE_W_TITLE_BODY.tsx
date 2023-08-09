import React, { useCallback } from 'react';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import cx from 'classnames';
import styles from './IMAGE_W_TITLE_BODY.module.scss';
import { WithScrollbar } from 'components/shared/WithScrollbar/WithScrollbar';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useRouter } from 'next/router';

interface IHeroBannerProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

interface ImageItemProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const IMAGE_W_TITLE_BODY: React.FC<IHeroBannerProps> = ({ config, paths }) => {
  return (
    <>
      <h1 className={styles.imagesTitle}>{config.titleH1}</h1>
      <p className={styles.imagesBody}>{config.body}</p>
      <WithScrollbar autoPlay={false} infinite={false}>
        {config?.slides?.map((slide, index) => {
          return <ImageItem key={index} config={slide} paths={paths} />;
        })}
      </WithScrollbar>
    </>
  );
};

const ImageItem: React.FC<ImageItemProps> = ({ config, paths }) => {
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
    <div className={styles.imageImageWrapper}>
      <StableImage
        className={cx(styles.imageImage, {
          [styles.imageImageWrapperLink]: Boolean(redirectUrl),
          [styles.shadowedImage]: config.shadowOverlay,
        })}
        onClick={onImageClick}
        src={config.imgURL ? `${ASSETS_URL}/${config.imgURL}` : undefined}
      />
      <div className={styles.imageTitleContainer}>
        <h3 className={styles.imageTitle}>{config.titleH3}</h3>
      </div>
    </div>
  );
};
