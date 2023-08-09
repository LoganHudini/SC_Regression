import React, { useCallback, useState } from 'react';
import Carousel from 'react-material-ui-carousel';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import LocalPhoneIcon from '@icons/LocalPhone.svg';
import AlternateEmailIcon from '@icons/AlternateEmail.svg';
import styles from './SERVICE_DETAIL_COMPONENT.module.scss';
import { useTranslation } from 'react-i18next';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { useRouter } from 'next/router';
import { flowPathMap } from 'utils/flowPathMap';
import cx from 'classnames';

interface IServiceDetailComponentProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const SERVICE_DETAIL_COMPONENT: React.FC<IServiceDetailComponentProps> = ({
  config,
  paths,
}) => {
  const redirectUrl = getRedirectLink(paths, config.redirectLink?.linkId);

  const { t } = useTranslation('ui-builder');

  const router = useRouter();

  const [moreDescription, setmoreDescription] = useState(false);

  const HandleDescription = useCallback(() => {
    setmoreDescription(true);
  }, []);

  const onCtaClick = useCallback(() => {
    if (redirectUrl) {
      const LINK = {
        IN_APP: `${router.query.locale ? `/${router.query.locale}` : ''}/${redirectUrl}`,
        EXTERNAL: redirectUrl,
        FLOW: `${router.query.locale ? `/${router.query.locale}` : ''}${
          flowPathMap[config.redirectLink?.linkId as keyof typeof flowPathMap]
        }`,
      };

      router.push(LINK[config.redirectLink?.connection as keyof typeof LINK] as string);
    }
  }, [config.redirectLink?.connection, config.redirectLink?.linkId, redirectUrl, router]);

  return (
    <div className={styles.serviceDetailWrapper}>
      <div className={styles.carouselWrapper}>
        <Carousel
          navButtonsAlwaysInvisible
          indicatorContainerProps={{ className: styles.indicatorIconContainer }}
          indicatorIconButtonProps={{ style: { opacity: 0.5 } }}
          activeIndicatorIconButtonProps={{
            className: styles.activeIndicatorIcon,
          }}
          IndicatorIcon={<div className={styles.indicatorIcon} />}
          indicators={(config.images?.length || 0) > 1}
          height={'250px'}
        >
          {config.images?.map((image, i) => (
            <StableImage
              className={styles.bannerImage}
              key={i}
              src={`${ASSETS_URL}/${image.imgURL}`}
            />
          ))}
        </Carousel>
      </div>
      {config.isTitleActive && <h2 className={styles.title}>{t(`${config.titleH2}`)}</h2>}
      <p
        className={cx(styles.body, {
          [styles.TextExpanded]: moreDescription,
        })}
      >
        {t(`${config.body}`)}
      </p>
      {config.body && !moreDescription && (
        <button onClick={HandleDescription} className={styles.readMore}>
          {t('Read More')}
        </button>
      )}

      {config.highLights?.isActive && (
        <div className={styles.highlights}>
          {config.highLights.highLightList.map((el, index) => (
            <p key={`${el}-${index}`} className={styles.highlight}>
              {el.highLight}
            </p>
          ))}
        </div>
      )}

      <div className={styles.phoneEmailCtaWrapper}>
        {config.phone?.isActive && (
          <div className={styles.phone}>
            <a href={`tel:${config.phone.number}`} className={styles.phoneText}>
              <LocalPhoneIcon className={styles.phoneIcon} />
              {t('Call')}
            </a>
          </div>
        )}

        {config.email?.isActive && (
          <div className={styles.email}>
            <a href={`mailto:${config.email?.address}`} className={styles.emailText}>
              <AlternateEmailIcon className={styles.emailIcon} /> {t('Email')}
            </a>
          </div>
        )}

        {config.cta?.isActive && (
          <StyledButton className={styles.button} onClick={onCtaClick} variant='outlined'>
            {t(`${config.cta.title}`)}
          </StyledButton>
        )}
      </div>
    </div>
  );
};
