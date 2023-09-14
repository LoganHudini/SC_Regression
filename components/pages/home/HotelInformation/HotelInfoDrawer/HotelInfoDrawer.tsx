import React, { useState } from 'react';
import styles from './HotelInfoDrawer.module.scss';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_HOTEL_INFORMATION } from 'core/graphql/queries/GET_HOTEL_INFORMATION';
import Carousel from 'react-material-ui-carousel';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { useTranslation } from 'react-i18next';
import Phone from '@icons/telephone.svg';
import Mail from '@icons/mail.svg';
import Link from '@icons/link.svg';
import Map from '@icons/map.svg';
import cx from 'classnames';
import Location from 'components/shared/Location/Location';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { EMAILCAPS, PHONECAPS, URL } from 'utils/constants';
import { DetailDrawer } from 'components/shared/DetailDrawer/DetailDrawer';
import { toggleHotelInfoDrawer } from 'storage/home.storage';

const HotelInfoDrawer = () => {
  const { t } = useTranslation('common');
  const [showMap, setShowMap] = useState(true);
  const hotelInfoDetailsDrawerStatus = useReactiveVar(toggleHotelInfoDrawer);

  const { data } = useQuery(GET_HOTEL_INFORMATION, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
  });

  const hotelInfo = data?.getPropertyDetailsByHotelId?.hotel;
  const phoneData = hotelInfo?.information?.find((x: any) => x?.type === PHONECAPS);
  const mailData = hotelInfo?.information?.find((x: any) => x?.type === EMAILCAPS);
  const webData = hotelInfo?.information?.find((x: any) => x?.type === URL);

  const handleClose = () => {
    if (showMap) {
      toggleHotelInfoDrawer(false);
      setShowMap(true);
    } else {
      setShowMap(true);
    }
  };

  const handleClick = () => {
    setShowMap(false);
  };

  const hotelInfoDetails = () => (
    <>
      {showMap && (
        <div className={styles.wrapper}>
          <div className={styles.drawerNotch}></div>
          <div className={styles.serviceDetailWrapper}>
            <div className={styles.carouselWrapper}>
              <div className={styles.contentWrapper}>
                <Carousel
                  navButtonsAlwaysInvisible
                  indicatorContainerProps={{ className: styles.indicatorIconContainer }}
                  indicatorIconButtonProps={{ style: { opacity: 0.5 } }}
                  activeIndicatorIconButtonProps={{
                    className: styles.activeIndicatorIcon,
                  }}
                  IndicatorIcon={<div className={styles.indicatorIcon} />}
                  indicators={(hotelInfo?.images?.length || 0) > 1}
                  height={'250px'}
                >
                  {hotelInfo?.images?.map((image: any, i: any) => (
                    <StableImage
                      className={styles.bannerImage}
                      key={i}
                      src={`${ASSETS_URL}/${image?.master}`}
                    />
                  ))}
                </Carousel>
              </div>

              <div className={styles.phoneEmailCtaWrapper}>
                {phoneData && (
                  <div className={cx(styles.border, styles.align)}>
                    <a
                      aria-label={`${t('Phone')}`}
                      href={`tel:${phoneData?.value}`}
                      target='_blank'
                      rel='noreferrer'
                      className={styles.phoneText}
                    >
                      <Phone className={styles.phoneIcon} />
                    </a>
                  </div>
                )}

                <div className={styles.verticalline}></div>

                {webData && (
                  <div className={styles.border}>
                    <a
                      aria-label={`${t('Link')}`}
                      href={webData?.value}
                      className={styles.urlText}
                      target='_blank'
                      rel='noreferrer'
                    >
                      <Link className={styles.linkIcon} />
                    </a>
                  </div>
                )}

                <div className={styles.verticalline}></div>

                <div className={styles.border}>
                  <Map onClick={() => handleClick()} />
                </div>

                <div className={styles.verticalline}></div>

                {mailData && (
                  <div className={styles.mailWrapper}>
                    <a
                      href={`mailto:${mailData?.value}`}
                      aria-label={`${t('Email')}`}
                      className={styles.emailText}
                    >
                      <Mail className={styles.emailIcon} />
                    </a>
                  </div>
                )}
              </div>
            </div>
            <h2 className={styles.title}>{t(`${hotelInfo?.name}`)}</h2>
            <div className={styles.body}>{t(`${hotelInfo?.description}`)}</div>
          </div>
        </div>
      )}

      {!showMap && (
        <div className={styles.wrapper}>
          <div className={styles.drawerNotch}></div>

          <div className={styles.locationWrapper}>
            <Location
              lat={hotelInfo && hotelInfo?.location?.latitude}
              lng={hotelInfo && hotelInfo?.location?.longitude}
            />
            <div className={styles.buttonWrapper}>
              <a
                target='_blank'
                rel='noreferrer'
                className={styles.url}
                href={`https://maps.google.com/?q=${hotelInfo?.location?.latitude},${hotelInfo?.location?.longitude}`}
              >
                <StyledButton className={styles.botton}>{t('GET HERE')}</StyledButton>
              </a>
            </div>
          </div>

          <div className={styles.addressWrapper}>
            <div>{hotelInfo?.location?.addressLine1}</div>
            <div>{hotelInfo?.location?.addressLine2}</div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <DetailDrawer
      open={hotelInfoDetailsDrawerStatus}
      onClose={handleClose}
      content={hotelInfoDetails()}
    />
  );
};

export default HotelInfoDrawer;
