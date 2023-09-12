import React, { useCallback, useState } from 'react';
import styles from './BottomMenu.module.scss';
import { motion } from 'framer-motion';
import HamburgerIcon from '@icons/hamburger.svg';
import DownArrowIcon from '@icons/downArrow.svg';
import CloseHamburgerIcon from '@icons/closeHamburger.svg';

import { MenuItem, ModuleOptionsDrawer } from 'components/shared/BottomMenu/MenuItem/MenuItem';
import { useTranslation } from 'react-i18next';
import { StyledButton } from '../StyledButton/StyledButton';
import { ApolloError, useQuery, useReactiveVar } from '@apollo/client';
import {
  diningOptions,
  toggleCheckInDrawer,
  toggleHamburgerMenuDrawer,
  toggleModuleOptionsDrawer,
} from 'storage/home.storage';
import {
  GET_HAMBURGER_MENU,
  IGetHamburgerMenuDetailsApiResponse,
} from 'core/graphql/queries/GET_HAMBURGER_MENU';
import { hamburgerIconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { availablePaths } from 'utils/availablePaths';
import { useRouter } from 'next/router';
import { HEADERS } from 'utils/constants';
import { housekeepingOptions } from 'storage/housekeeping.storage';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import GetReservation from 'components/pages/check-in/CheckInDrawer';
import { useCheckedIn } from 'storage/check-in.storage';
import { DetailDrawer } from '../DetailDrawer/DetailDrawer';
import { PageWrapper } from '../PageWrapper/PageWrapper';
import { StyledInput } from '../StyledInput/StyledInput';
import { IGetPrecheckinReservationData } from 'types/get-reservation.types';
import { client } from 'core/graphql/client';
import { GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { useFormik } from 'formik';
import { processError } from 'utils/processError';
import { getReservationValidation } from 'validation/get-reservation.validation';
import { RestaurantDetailDrawerStatus } from 'storage/table-reservation.storage';

export const BottomMenu = () => {
  const router = useRouter();
  const hamburgerMenuStatus = useReactiveVar(toggleHamburgerMenuDrawer);
  const houseKeepingOptionSelected = useReactiveVar(housekeepingOptions);
  const diningOptionSelected = useReactiveVar(diningOptions);
  const isCheckedIn = useCheckedIn();
  const homeActive = router.pathname === '/[locale]';
  const [loading, setLoading] = useState(false);

  const arrowActive = homeActive && !isCheckedIn ? false : true;
  const irdActive =
    router.pathname.includes(availablePaths?.DINING) ||
    router.pathname.includes(availablePaths?.RESTAURANTS_BARS);
  const restaurantActive = router.pathname.includes(HEADERS[0]);
  const housekeepingActive = router.pathname.includes(availablePaths.HOUSEKEEPING);
  const navigate = useLocalizedRouter();

  const { data } = useQuery<IGetHamburgerMenuDetailsApiResponse>(GET_HAMBURGER_MENU, {
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
  });
  const hamburger = data?.getUiBuilderHamburgerMenuDetails;

  const { t } = useTranslation(['common']);

  const openModuleOptionsDrawer = () => {
    if (isCheckedIn) {
      toggleModuleOptionsDrawer(true);
      toggleHamburgerMenuDrawer(false);
    } else {
      toggleCheckInDrawer(true);
    }
  };

  const openHamburgerMenuDrawer = () => {
    toggleHamburgerMenuDrawer(true);
    toggleModuleOptionsDrawer(false);
  };

  const closeHamburgerMenuDrawer = () => {
    toggleHamburgerMenuDrawer(false);
  };

  const closeDrawer = () => {
    RestaurantDetailDrawerStatus(false);
  };

  const goToTheNextStep = useCallback(
    async (values: IGetPrecheckinReservationData) => {
      await getReservation(values.confirmationNumber, values.lastName);
    },
    [navigate, t],
  );

  const getReservation = async (confirmationNumber: any, lastName: any) => {
    try {
      setLoading(true);
      const { data } = await client.query({
        query: GET_RESERVATION,
        context: { clientName: 'rest' },
        variables: {
          confirmationNumber: confirmationNumber,
          lastName: lastName,
        },
        fetchPolicy: 'no-cache',
      });

      if (data) {
        client.writeQuery({
          query: GET_RESERVATION,
          data,
        });

        // if (
        //   data.getReservation.data.reservationStatus === 'CANCELED' ||
        //   data.getReservation.data.reservationStatus === 'CHKOUT' ||
        //   data.getReservation.data.reservationStatus === 'CHECKEDOUT'
        // ) {
        //   toast(t('No Reservation Found'), { type: 'error' });
        //   checkinStorage({
        //     reservationId: data.getReservation.data.confirmationId as string,
        //     checkedIn: false,
        //     preCheckedIn: false,
        //   });
        //   setLoading(false);
        // } else if (data.getReservation.data.reservationStatus === 'INHOUSE') {
        //   toast(t('Checked In Successfully'), { type: 'success' });
        //   checkinStorage({
        //     reservationId: data.getReservation.data.confirmationId as string,
        //     checkedIn: true,
        //     preCheckedIn: true,
        //     bookingId: data.getReservation.data.reservationId,
        //   });
        //   navigate(availablePaths?.HOME);
        // } else {
        toggleCheckInDrawer(false);
        navigate(availablePaths?.GUEST_INFORMATION_INPUT);
        // }
      }
    } catch (error) {
      processError(t, error as ApolloError);
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      confirmationNumber: '',
      lastName: '',
    },
    validationSchema: getReservationValidation,
    onSubmit: goToTheNextStep,
  });

  const checkInDrawerContent = () => (
    <PageWrapper className={styles.pageWrapper}>
      <p className={styles.pageTitle}>
        {t('Please enter the details to start your check-in process')}
      </p>
      <div className={styles.reservationInputs}>
        <StyledInput
          autoComplete='off'
          required
          className={styles.reservationInput}
          label={t('Last Name')}
          variant='standard'
          name='lastName'
          id='lastName'
          value={formik.values.lastName}
          onChange={formik.handleChange}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched?.lastName && formik.errors.lastName}
        />
        <StyledInput
          autoComplete='off'
          required
          className={styles.reservationInput}
          label={t('Reservation ID')}
          variant='standard'
          name='confirmationNumber'
          id='confirmationNumber'
          type={'number'}
          value={formik.values.confirmationNumber}
          onChange={formik.handleChange}
          error={formik.touched.confirmationNumber && Boolean(formik.errors.confirmationNumber)}
          helperText={formik.touched?.confirmationNumber && formik.errors.confirmationNumber}
        />
      </div>
      <StyledButton
        loading={loading}
        disabled={loading}
        className={styles.findMyBookingBtn}
        onClick={formik.submitForm}
      >
        {t('NEXT')}
      </StyledButton>
    </PageWrapper>
  );

  return (
    <>
      <div className={styles.bottomMenuWrapper}>
        <motion.div whileTap={{ scale: 0.8 }} className={styles.bottomMenuButton}>
          <StyledButton variant='contained' onClick={openModuleOptionsDrawer}>
            {homeActive && (isCheckedIn ? t('Room 401') : t('CHECK-IN'))}
            {irdActive && diningOptionSelected?.title}
            {housekeepingActive && t(`${houseKeepingOptionSelected?.title}`)}
            {arrowActive && <DownArrowIcon className={styles.downArrow} />}
          </StyledButton>
        </motion.div>
        {hamburgerMenuStatus ? (
          <CloseHamburgerIcon
            className={styles.hamburgerIcon}
            onClick={() => toggleHamburgerMenuDrawer(false)}
          />
        ) : (
          <HamburgerIcon className={styles.hamburgerIcon} onClick={openHamburgerMenuDrawer} />
        )}
      </div>

      <ModuleOptionsDrawer {...{ homeActive, irdActive, housekeepingActive }} />

      {hamburgerMenuStatus && (
        <div className={styles.hamburgerMenuContainer}>
          {hamburger &&
            hamburger['post'].map((hamburgerMenuElement) => (
              <MenuItem
                Icon={
                  hamburgerIconsMap[hamburgerMenuElement.name as keyof typeof hamburgerIconsMap] ||
                  HamburgerIcon
                }
                title={hamburgerMenuElement.name}
                key={hamburgerMenuElement.id}
                externalLink={hamburgerMenuElement.externalLink}
                flow={hamburgerMenuElement.flow}
                pages={hamburgerMenuElement.pages}
                redirectOptions={hamburgerMenuElement.redirectOptions}
                status={hamburgerMenuElement.isActive}
                toggleOption={closeHamburgerMenuDrawer}
              />
            ))}
        </div>
      )}
      <DetailDrawer onClose={closeDrawer} content={checkInDrawerContent()} />
    </>
  );
};
