import React, { useCallback } from 'react';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import cx from 'classnames';
import styles from './IMAGE_LARGE_W_TITLE_BODY.module.scss';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

interface IHeroBannerProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const IMAGE_LARGE_W_TITLE_BODY: React.FC<IHeroBannerProps> = ({ config, paths }) => {
  const { t } = useTranslation('common');
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
      <h1 className={styles.imageTitle}>{t(`${config.titleH1}`)}</h1>
      <div className={styles.imageWrapper} style={{ background: config.backgroundColor }}>
        <StableImage
          className={cx(styles.imageImage, { [styles.shadowedImage]: config.shadowOverlay })}
          src={config.imgURL ? `${ASSETS_URL}/${config.imgURL}` : undefined}
        />
      </div>
      <p className={styles.imagesBody}> {t(`${config?.body}`)}</p>
      <div className={styles.buttonWrapper}>
        {config.cta?.isActive && (
          <StyledButton
            className={styles.ctaButton}
            onClick={onCtaClick}
            disableRipple
            variant='text'
          >
            {t(`${config?.cta?.title}`)}
          </StyledButton>
        )}
      </div>
    </div>
  );
};
