import { ApolloError } from '@apollo/client';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { getCheckOutToken } from 'core/api/functions/getCheckOutAuthentication';
import { client } from 'core/graphql/client';
import {
  GET_RESERVATION,
  GET_RESERVATION_WITH_ROOM_NUMBER,
} from 'core/graphql/queries/GET_RESERVATION';
import { checkinStorage } from 'storage/check-in.storage';
import { toggleCheckInDetailsDrawer } from 'storage/home.storage';
import { saveTrip } from 'storage/trips.storage';
import { availablePaths } from './availablePaths';
import { CANCELED, CHKOUT, CHECKEDOUT, NOSHOW, INHOUSE, CANCELLED } from './constants';
import { getWelcomeDrawer } from './functions';

export const handleReservation = async ({
  activeCheckInFlowInfo,
  values,
  hotelId,
  config,
  toggleNotification,
  setLoading,
  setErrorToggle,
  t,
  processStatusCode,
  goToTheNextStep,
  homeActiveRef,
  navigate,
}: any) => {
  try {
    setLoading(true);

    const checkInToken: { current?: string } = {};
    const checkOutToken: { current?: string } = {};

    if (activeCheckInFlowInfo) {
      checkInToken.current = await getCheckInToken(
        values?.confirmationNumber?.toString()?.trim(),
        values?.lastName?.toString()?.trim(),
      );
    } else {
      checkOutToken.current = await getCheckOutToken(
        values?.roomNo?.toString()?.trim(),
        values?.lastName?.toString()?.trim(),
      );
    }

    const { data } = await client.query({
      query: activeCheckInFlowInfo ? GET_RESERVATION : GET_RESERVATION_WITH_ROOM_NUMBER,
      context: {
        clientName: 'rest',
        headers: {
          Authorization:
            'Bearer ' + (activeCheckInFlowInfo ? checkInToken.current : checkOutToken.current),
        },
      },
      variables: activeCheckInFlowInfo
        ? {
            confirmationNumber: values?.confirmationNumber?.toString()?.trim(),
            lastName: values?.lastName?.toString()?.trim(),
            hotelId: hotelId,
          }
        : {
            roomNo: values?.roomNo?.toString()?.trim(),
            lastName: values?.lastName?.toString()?.trim(),
            hotelId: hotelId,
          },
      fetchPolicy: 'no-cache',
    });

    if (data) {
      client.writeQuery({
        query: GET_RESERVATION,
        data,
      });
      const roomNo = data.getReservation.data.roomTypes[0]?.roomNumber;

      if (config?.preCheckInOnly ? !data.getReservation.data?.isPreCheckedIn : true) {
        if (
          roomNo && config?.allowedRoomtypes && config?.allowedRoomtypes?.length > 0
            ? config?.allowedRoomtypes.includes(data.getReservation.data.roomTypes[0].code)
            : true
        ) {
          const reservationStatus = data.getReservation.data.reservationStatus;

          if ([CANCELLED, CANCELED, CHKOUT, CHECKEDOUT, NOSHOW].includes(reservationStatus)) {
            setErrorToggle &&
              setErrorToggle({
                state: false,
                message: t('Reservation Not Found'),
                description: t('Please proceed to the front desk for further assistance.'),
                redirect: null,
              });
            checkinStorage({
              reservationId: data.getReservation.data.confirmationId,
              checkedIn: false,
              preCheckedIn: false,
            });
            toggleNotification(true);
            toggleCheckInDetailsDrawer(false);
            setLoading(false);
          } else if (reservationStatus === INHOUSE) {
            if (roomNo) {
              if (activeCheckInFlowInfo) {
                setErrorToggle &&
                  setErrorToggle({
                    state: true,
                    message: t('Hello Again!'),
                    description: t(
                      'Reservation validated successfully. You can now explore our in-stay services.',
                    ),
                    redirect: null,
                  });
                toggleNotification(true);
                toggleCheckInDetailsDrawer(false);
              } else {
                toggleCheckInDetailsDrawer(true);
              }

              saveTrip({
                reservationId:
                  data.getReservation.data.confirmationId !== 'NA'
                    ? data.getReservation.data.confirmationId
                    : data.getReservation.data.uniqueBookingId,
                preCheckedIn: !roomNo,
                checkedIn: !!roomNo,
                name: data.getReservation.data.details.contactPerson.lastName,
                email: data.getReservation.data.details.contactPerson.email,
                roomNumber: roomNo,
                invoiceId: data.getReservation.data.reservationId,
                hotelId: hotelId,
              });

              checkinStorage({
                reservationId:
                  data.getReservation.data.confirmationId !== 'NA'
                    ? data.getReservation.data.confirmationId
                    : data.getReservation.data.uniqueBookingId,
                preCheckedIn: !roomNo,
                checkedIn: !!roomNo,
                name: data.getReservation.data.details.contactPerson.lastName,
                email: data.getReservation.data.details.contactPerson.email,
                roomNumber: roomNo,
                invoiceId: data.getReservation.data.reservationId,
                currency: data.getReservation.data.details.holdAmount.currency,
              });

              setLoading(false);
            } else {
              setErrorToggle &&
                setErrorToggle({
                  state: false,
                  message: t('Room Unavailable'),
                  description: t('Please try after sometime'),
                  redirect: null,
                });
              toggleNotification(true);
              toggleCheckInDetailsDrawer(false);
              setLoading(false);
            }
            // setButtonTitle && setButtonTitle(true);
            navigate && navigate(availablePaths.HOME);
          } else {
            activeCheckInFlowInfo && getWelcomeDrawer();
            homeActiveRef && homeActiveRef.current && navigate && navigate(availablePaths.CHECK_IN);
            if (!activeCheckInFlowInfo) {
              setErrorToggle &&
                setErrorToggle({
                  state: false,
                  message: t('Oops! Check-In Incomplete!'),
                  description: t(
                    'Please complete your check-in at our front desk to connect your phone with the room.',
                  ),
                  redirect: null,
                });
              toggleNotification(true);
            }
            setLoading(false);
            setTimeout(() => {
              toggleCheckInDetailsDrawer(false);
            }, 2000);
          }
        } else {
          setErrorToggle &&
            setErrorToggle({
              state: false,
              message: t('Invalid Room Type'),
              description: t('Please proceed to the front desk for further assistance.'),
              redirect: null,
            });
          toggleNotification(true);
          toggleCheckInDetailsDrawer(false);
          setLoading(false);
        }
      } else {
        setErrorToggle &&
          setErrorToggle({
            state: false,
            message: t('Pre Checked-In'),
            description: t('You have already completed the pre check-in process.'),
            redirect: null,
          });
        toggleNotification(true);
        toggleCheckInDetailsDrawer(false);
        setLoading(false);
      }
    }
  } catch (error) {
    const statusCode = processStatusCode(error as ApolloError);
    if (statusCode === 403) {
      handleCheckInAuthenticationFailure(goToTheNextStep, values);
    } else {
      setErrorToggle &&
        setErrorToggle({
          state: false,
          message: t('Reservation Not Found'),
          description: t('Please proceed to the front desk for further assistance.'),
          redirect: null,
        });
      toggleNotification(true);
      toggleCheckInDetailsDrawer(false);
      setLoading(false);
    }
  }
};
