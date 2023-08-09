import cx from 'classnames';
import React, { useCallback } from 'react';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './IMAGE_LARGE_W_TITLE_SUBTITLE_BODY.module.scss';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useRouter } from 'next/router';

interface IHeroBannerProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const IMAGE_LARGE_W_TITLE_SUBTITLE_BODY: React.FC<IHeroBannerProps> = ({
  config,
  paths,
}) => {
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
    <div className={styles.container}>
      <h1 className={styles.imageTitle}>{config.titleH1}</h1>
      <div className={styles.imageAndTextWrapper} style={{ background: config.backgroundColor }}>
        <StableImage
          className={cx(styles.imageImage, { [styles.shadowedImage]: config.shadowOverlay })}
          src={config.imgURL ? `${ASSETS_URL}/${config.imgURL}` : undefined}
        />

        <h3 className={styles.imageTitleSmall}>{config.titleH3}</h3>
        <p className={styles.imageBody}>{config.body}</p>
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
