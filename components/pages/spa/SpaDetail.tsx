import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { PhoneEmail } from 'components/shared/PhoneEmail/PhoneEmail';
import CustomCarousel from 'components/shared/CustomCarousel/CustomCarousel';
import ClockIcon from '@icons/clockIcon.svg';
import LocationIcon from '@icons/location.svg';
import styles from '@styles/spa/spa.module.scss';
import cx from 'classnames';
import { toggleDetailsDrawer } from 'storage/home.storage';
import { analyticsEvent } from 'utils/gtag';
import { availablePaths } from 'utils/availablePaths';
import { BOOKING_URL, EXTERNAL_URL, S3, WEBURL2 } from 'utils/constants';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { loaderVar } from 'storage/spa.storage';

interface SpaDetailsProps {
  spaInfoDetails: any;
  spaTreatments: any[];
  setspaBooking: any;
  setMenu: any;
  setmenuLink: any;
  time: any;
}
const SpaDetails: React.FC<SpaDetailsProps> = ({
  spaInfoDetails,
  spaTreatments,
  setspaBooking,
  setMenu,
  setmenuLink,
  time,
}) => {
  const navigate = useLocalizedRouter();
  const { t } = useTranslation(['spa']);

  const onCtaClick = () => {
    toggleDetailsDrawer(false);
    if (spaTreatments?.length > 0) {
      loaderVar(true);
      navigate(availablePaths?.SPA);
    } else if (cta?.redirectOption === EXTERNAL_URL || cta?.redirectOption === BOOKING_URL) {
      setspaBooking(true);
      analyticsEvent({ action: 'spa_redirect', category: 'Spa', title: spaInfoDetails?.name });
    }
  };

  const onViewMenu = () => {
    setMenu(true);
    let link = null;
    const menuType = spaInfoDetails?.treatmentsMenu
      ?.split('type=')[1]
      ?.split('}')[0]
      ?.split(',')[0];
    if (menuType === WEBURL2) {
      link = spaInfoDetails?.treatmentsMenu?.split('=')[1]?.split(',')[0];
    }

    if (menuType === S3) {
      link = `${ASSETS_URL}/${spaInfoDetails?.treatmentsMenu?.split('=')[1]?.split(',')[0]}`;
    }
    setmenuLink(link);
  };

  const cta = spaInfoDetails?.cta;

  const isCtaActive =
    typeof cta?.status === 'boolean'
      ? cta.status
      : String(cta?.status || '').toLowerCase() === 'active';

  const hasCtaDest = Boolean(
    (cta?.redirectOption === EXTERNAL_URL && cta?.redirectUrl) ||
      (cta?.redirectOption === BOOKING_URL && cta?.redirectUrl),
  );

  return (
    <div
      className={cx({
        [styles.listComponentMargin]:
          spaTreatments?.length > 0 || spaInfoDetails?.cta?.status === 'ACTIVE',
      })}
    >
      {spaInfoDetails?.images?.length > 0 && <CustomCarousel imageData={spaInfoDetails} />}

      <div className={styles.wrapper}>
        {spaInfoDetails?.name && (
          <h2 className={styles.detailComponentTitle}>{t(`${spaInfoDetails?.name}`)}</h2>
        )}

        {spaInfoDetails?.location.addressLine1 && (
          <div className={styles.location}>
            <LocationIcon className={styles.locationicon} />
            <p>{spaInfoDetails?.location.addressLine1}</p>
          </div>
        )}

        {time?.value && (
          <div className={styles.DetailscuisineRowTime}>
            <ClockIcon className={styles.cuisineIcon} />
            <p>{time?.value}</p>
          </div>
        )}

        {spaInfoDetails?.treatmentsMenu &&
          spaInfoDetails?.treatmentsMenu !== '{}' &&
          spaInfoDetails?.treatmentsMenu?.split('=')[1].split(',')[0] && (
            <StyledButton variant='outlined' onClick={onViewMenu} className={styles.buttonView}>
              {t('View Menu')}
            </StyledButton>
          )}

        {spaInfoDetails?.description && (
          <p className={styles.detailComponentDescription}>{t(`${spaInfoDetails?.description}`)}</p>
        )}

        {(spaInfoDetails?.contact?.phone ||
          spaInfoDetails?.contact?.email ||
          spaInfoDetails?.contact?.information?.some((e: any) => e?.type === BOOKING_URL)) && (
          <PhoneEmail
            phone={spaInfoDetails?.contact?.phone}
            email={spaInfoDetails?.contact?.email}
            url={spaInfoDetails?.contact?.information?.url}
            urlTitle={spaInfoDetails?.contact?.information?.reviewerTitle}
            urlDisplayTitle={spaInfoDetails?.contact?.information?.displayTitle}
          />
        )}
      </div>
      {spaTreatments?.length > 0 ? (
        <>
          <div style={{ position: 'fixed' }}>
            <StyledButton
              variant='contained'
              onClick={onCtaClick}
              className={cx(styles.button, 'globals-actionCtaWrapper')}
            >
              {t('View Treatments')}
            </StyledButton>
          </div>
        </>
      ) : (
        isCtaActive &&
        hasCtaDest && (
          <StyledButton
            variant='contained'
            onClick={onCtaClick}
            className={cx(styles.button, 'globals-actionCtaWrapper')}
            style={{ position: 'static', width: '100%', marginTop: 12 }}
          >
            {spaInfoDetails?.cta?.ctaTitle || t('Book Now')}
          </StyledButton>
        )
      )}
    </div>
  );
};

export default SpaDetails;
