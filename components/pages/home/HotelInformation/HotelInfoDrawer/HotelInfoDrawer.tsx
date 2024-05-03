import React from 'react';
import styles from './HotelInfoDrawer.module.scss';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import Phone from '@icons/telephone.svg';
import Mail from '@icons/mail.svg';
import Link from '@icons/link.svg';
import Map from '@icons/map.svg';
import cx from 'classnames';
import Location from 'components/shared/Location/Location';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { EMAILCAPS, PHONECAPS, URL, WEBSITE } from 'utils/constants';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import {
  hotelInfoStorage,
  toggleCheckInDetailsDrawer,
  toggleHotelInfoDrawer,
  toggleMapState,
} from 'storage/home.storage';
import { isEmpty } from 'lodash';
import { groupBy, openLinknewTab } from 'utils/functions';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';

const HotelInfoDrawer = () => {
  const { t } = useTranslation('common');
  const hotelInfoDetailsDrawerStatus = useReactiveVar(toggleHotelInfoDrawer);
  const checkInDetailsDrawerStatus = useReactiveVar(toggleCheckInDetailsDrawer);
  const showMap = useReactiveVar(toggleMapState);
  const data = useReactiveVar(hotelInfoStorage);

  const hotelInfo = data?.getPropertyDetailsByHotelId?.hotel;
  const phoneData = hotelInfo?.information?.find((x: any) => x?.type === PHONECAPS);
  const mailData = hotelInfo?.information?.find((x: any) => x?.type === EMAILCAPS);
  const webData = hotelInfo?.information?.find((x: any) => x?.type === URL);
  const webLinkList = hotelInfo?.information?.filter(
    (item: any) => item?.type === URL && item?.field?.trim() !== WEBSITE,
  );

  const groupedwebLinkList: any = webLinkList?.length > 0 && groupBy(webLinkList, 'field');

  const handleClose = () => {
    toggleHotelInfoDrawer(false);
  };

  const handleClick = () => {
    toggleMapState(false);
  };

  const hotelInfoDetails = () => (
    <>
      {showMap ? (
        <div className={styles.serviceDetailWrapper}>
          <div className={styles.carouselWrapper}>
            <div className={styles.contentWrapper}>
              {hotelInfo?.images?.length > 0 && <CustomCarousel imageData={hotelInfo} />}
            </div>

            {(phoneData || webData || mailData || hotelInfo?.location?.addressLine1) && (
              <div className={cx(styles.phoneEmailCtaWrapper, 'globals-actionCtaWrapper')}>
                {phoneData && (
                  <>
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
                    <div className={styles.verticalline}></div>
                  </>
                )}
                {webData && (
                  <>
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
                    <div className={styles.verticalline}></div>
                  </>
                )}

                <>
                  <div className={styles.border}>
                    <Map onClick={() => handleClick()} />
                  </div>
                </>

                {mailData && (
                  <>
                    <div className={styles.verticalline}></div>
                    <div className={styles.mailWrapper}>
                      <a
                        href={`mailto:${mailData?.value}`}
                        aria-label={`${t('Email')}`}
                        className={styles.emailText}
                      >
                        <Mail className={styles.emailIcon} />
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className={styles.wrapper}>
            <h2 className={styles.title}>{t(`${hotelInfo?.name}`)}</h2>
            <div className={styles.body}>{t(`${hotelInfo?.description}`)}</div>
            {!isEmpty(groupedwebLinkList) &&
              Object.keys(groupedwebLinkList)?.map((language, index) => (
                <div key={index}>
                  {language && <p className={styles.languageTitle}>{language}</p>}
                  {groupedwebLinkList[language]?.map((item: any, itemIndex: any) => (
                    <div key={itemIndex + item?.value}>
                      <p
                        className={styles.informationList}
                        onClick={() => openLinknewTab(item?.value)}
                      >
                        {`${t(item?.displayTitle)}`}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className={styles.locationWrapper}>
          <Location
            lat={hotelInfo && hotelInfo?.location?.latitude}
            lng={hotelInfo && hotelInfo?.location?.longitude}
          />
          <div className={styles.wrapper}>
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
            <div>{`${hotelInfo?.location?.city}, ${hotelInfo?.location?.state} ${hotelInfo?.location?.postalCode}, ${hotelInfo?.location?.country}`}</div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <CustomDrawer
      open={hotelInfoDetailsDrawerStatus && !checkInDetailsDrawerStatus}
      onClose={handleClose}
      content={hotelInfoDetails()}
    />
  );
};

export default HotelInfoDrawer;
