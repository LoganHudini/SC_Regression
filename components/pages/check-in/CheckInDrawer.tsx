import Head from 'next/head';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import DateRangeIcon from '@icons/DateRangeIcon.svg';
import { DatePicker } from '@mui/x-date-pickers';
import styles from './CheckInDrawer.module.scss';
import { IGetPrecheckinReservationData } from 'types/get-reservation.types';
import { getReservationValidation } from 'validation/get-reservation.validation';
import { useFormik } from 'formik';
import { GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import dayjs from 'dayjs';
import { client } from 'core/graphql/client';
import { processError } from 'utils/processError';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { timeFormats } from 'utils/timeFormats';
import { getStaticPaths } from 'utils/getStatic';
import { Drawer } from '@mui/material';
import { HOTEL_CODE } from 'core/graphql/endpoints';
import CloseOutlinedIcon from '@icons/CloseOutlined.svg';
import { toast } from 'react-toastify';
import { checkinStorage } from 'storage/check-in.storage';
import { useRouter } from 'next/router';
import { handleTouchEnd, handleTouchStart } from 'utils/hooks/useDrawerSwipe';
import { toggleCheckInDrawer } from 'storage/home.storage';


const GetReservation = () => {
    const navigate = useLocalizedRouter();
    const router = useRouter();
    const checkInDrawerStatus = useReactiveVar(toggleCheckInDrawer);
    const { t } = useTranslation(['get-reservation', 'common']);
    const [inputDrawer, setInputDrawer] = useState(true);
    const [startY, setStartY] = useState(0);

    const [loading, setLoading] = useState(false);

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

    const closeInputDrawer = useCallback(() => {
        toggleCheckInDrawer(false);
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
                open={checkInDrawerStatus}
                onClose={closeInputDrawer}
                PaperProps={{
                    elevation: 0,
                    style: {
                        maxWidth: '768px',
                        maxHeight: 'var(--primary-drawer-height)',
                        margin: 'auto',
                        borderTopLeftRadius: 'var(--primary-drawer-top-left-border-radius)',
                        borderTopRightRadius: 'var(--primary-drawer-top-right-border-radius)',
                    },
                }}
                slotProps={{
                    backdrop: {
                        style: {
                            backgroundColor: 'var(--primary-overlay-color)',
                        },
                    },
                }}
                onTouchStart={(e) => handleTouchStart(e, setStartY)}
                onTouchEnd={(e) => handleTouchEnd(e, startY, setStartY, closeInputDrawer)}
            >
                <div className={styles.drawerNotch}></div>

                <PageWrapper className={styles.pageWrapper}>
                    <p className={styles.pageTitle}>{t('Please enter the details to start your check-in process')}</p>
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
            </Drawer>
        </>
    );
};

export default GetReservation;
