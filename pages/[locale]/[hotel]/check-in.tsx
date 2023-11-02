import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useState } from 'react';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import styles from 'styles/get-reservation/get-reservation.module.scss';
import { IGetPrecheckinReservationData } from 'types/get-reservation.types';
import { getReservationValidation } from 'validation/get-reservation.validation';
import { useFormik } from 'formik';
import { GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import { processError } from 'utils/processError';
import { ApolloError } from '@apollo/client';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { getStaticPaths } from 'utils/getStatic';
import { Drawer } from '@mui/material';
import { BRAND_CODE } from 'core/graphql/endpoints';
import CloseOutlinedIcon from '@icons/CloseOutlined.svg';
import { useRouter } from 'next/router';

export { getStaticPaths };

const GetReservation: React.FC = () => {
  const navigate = useLocalizedRouter();
  const router = useRouter();

  const { t } = useTranslation(['get-reservation', 'common']);
  const [inputDrawer, setInputDrawer] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigate(availablePaths?.HOME);
    if (router.query['resId'] && router.query['lastName']) {
      getReservation(router.query['resId'], router.query['lastName']);
    }
  }, []);

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
      confirmationNumber: router.query['resId'] ? router.query['resId'] : '',
      lastName: router.query['lastName'] ? router.query['lastName'] : '',
    },
    validationSchema: getReservationValidation,
    onSubmit: goToTheNextStep,
  });

  const closeInputDrawer = useCallback(() => {
    setInputDrawer((state) => !state);
    navigate(availablePaths.HOME);
  }, [navigate]);

  return (
    <>
      <Head>
        <title>{t('Booking Details')}</title>
      </Head>
      <Drawer
        variant='temporary'
        anchor='bottom'
        open={inputDrawer}
        PaperProps={{
          elevation: 0,
          style: {
            borderTopRightRadius: '2rem',
            borderTopLeftRadius: '2rem',
            maxWidth: '772px',
            margin: 'auto',
            height: '445px',
            overflow: 'hidden',
          },
        }}
        BackdropProps={{
          style: {
            backgroundImage: `url('/images/${BRAND_CODE}/background.png')`,
            maxWidth: '772px',
            margin: 'auto',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          },
        }}
      >
        <PageWrapper className={styles.pageWrapper}>
          <p className={styles.pageTitle}>{t('Please fill your details')}</p>
          <div className={styles.reservationInputs}>
            <button onClick={closeInputDrawer} className={styles.closeBtn}>
              <CloseOutlinedIcon />
            </button>
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
            {t('SUBMIT')}
          </StyledButton>
        </PageWrapper>
      </Drawer>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['get-reservation', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default GetReservation;
