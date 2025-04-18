import React, { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import styles from '@styles/pre-checkin-form/pre-checkin-form.module.scss';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { client } from 'core/graphql/client';
import cx from 'classnames';
import { GetStaticProps } from 'next';
import { ApolloError, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { PreCheckinGuestInfo } from 'components/pages/check-in/PreCheckinGuestInfo/PreCheckinGuestInfo';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import {
  IUpdateGuestDetailsApiRequest,
  UPDATE_GUEST_DETAILS,
} from 'core/graphql/queries/UPDATE_GUEST_DETAILS';
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import {
  CHECK_IN,
  EMAIL_REGEX,
  GUESTINFORMATION,
  INFORMATION,
  PHONE,
  EMAILS,
  STEPPER_REVIEW,
  STEPPER_PAYMENT,
  STEPPER_CUSTOMISATION,
  ACCOMPANYINGGUEST,
  YOUVERSE,
  PRIMARY,
  FAILURE,
  INCODE,
  DOCTYPE,
  NONE,
  TRENTIAL,
  UPGRADE_ROOM,
  CMS,
  ROOM,
  SECONDARY,
  NEWGUEST,
  NEWGUESTFORM,
  SUCCESS,
  OHIP,
  MANUAL,
  NEWGUESTSCAN,
  BLANK,
  OTA,
  DOC_NO,
  GENDER,
  FIRST_NAME,
  LAST_NAME,
  BIOMETRICS_DISCLAIMER,
} from 'utils/constants';
import {
  updateFieldStatus,
  updateDocTypeForNewGuestOptions,
  updateDocTypeOptionsOptionConfig,
  filterChildDetails,
} from 'utils/functions';
import { docTypeStorage } from 'storage/guest-information.storage';
import { Stepper } from 'components/shared/Stepper/Stepper';
import { StepperInformationStorage, profileIDStorage } from 'storage/check-in.storage';
import produce from 'immer';
import Camera from '@icons/cameraIcon.svg';
import {
  accompanyGuestDetails,
  IsBiometricsSkipped,
  newAccompanyGuestDetails,
  primaryGuestButtonDisabled,
  secondaryGuestButtonDisabled,
  setNewGuestFormData,
  updateNewAccompanyGuestDetails,
} from 'storage/accompany-guest-details';
import {
  hotelInformation,
  notificationStorage,
  setDayjsLocale,
  toggleNotification,
} from 'storage/home.storage';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { personalizationStorage } from 'storage/personalize-your-room.storage';
import { ADD_ACCOMPANY_GUEST } from 'core/graphql/queries/ADD_GUEST';
import { DetailsCard, DetailsCardShrinked } from 'components/shared/DetailsCard/DetailsCard';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { Autocomplete, InputAdornment, autocompleteClasses, styled } from '@mui/material';
import { Countries } from 'utils/countryList';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import Popper from '@mui/material/Popper';
import DangerIcon from '@icons/danger.svg';
import DropDownIcon from '@icons/dropDownIcon.svg';
import { Loader } from 'components/shared/Loaders/Loaders';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { StyledCheckBox } from 'components/shared/StyledCheckBox/StyledCheckBox';
import { validatePhoneNumber } from 'utils/hooks/useValidate';
export { getStaticPaths };

const Guest: React.FC<any> = () => {
  const { t } = useTranslation(['about-your-stay', 'check-in']);
  const navigate = useLocalizedRouter();
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [countryDrawer, setCountryDrawer] = useState(true);
  const addAccompanyGuest: any = useReactiveVar(setNewGuestFormData);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const dayjsLocaleLoader = useReactiveVar(setDayjsLocale);
  const config = useConfig();
  const paymentConfig: any = usePaymentConfig();
  const accompanyGuestData = useReactiveVar(accompanyGuestDetails);
  const hotelInfo = useReactiveVar(hotelInformation);
  const information = hotelInfo?.detailsCustomAttributes;

  const getBiometricsDisclaimer = (data: any) =>
    data?.find((item: any) => item?.key === BIOMETRICS_DISCLAIMER)?.value || '';

  const disclaimerDisplayText = getBiometricsDisclaimer(information);

  const availablePersonalizations = useReactiveVar(personalizationStorage);
  const newAccompanyGuestStorage = useReactiveVar(newAccompanyGuestDetails);

  const updatedGuestData = useReactiveVar(updateNewAccompanyGuestDetails);
  const primaryGuestButtonDisable = useReactiveVar(primaryGuestButtonDisabled);
  const secondaryGuestButtonDisable = useReactiveVar(secondaryGuestButtonDisabled);

  const [openToggleAccompanyGuest, setOpenToggleAccompanyGuest] = useState(
    new Array(newAccompanyGuestStorage?.child?.length)?.fill(false),
  );
  const [openToggleAddNewGuest, setOpenToggleAddNewGuest] = useState(
    new Array(newAccompanyGuestStorage?.child?.length)?.fill(false),
  );
  const enableIdVerificationStatus = useReactiveVar(IsBiometricsSkipped);
  const [openToggleAddNewGuestForAdult, setOpenToggleAddNewGuestForAdult] = useState(
    new Array(newAccompanyGuestStorage?.adult?.length)?.fill(false),
  );

  const [openTogglePrimaryGuest, setOpenTogglePrimaryGuest] = useState(true);

  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });

  const reservationInfo: any = reservationData?.getReservation?.data;
  const totalGuestCount = reservationInfo?.details?.totalGuestCount;
  const childGuestCount = reservationInfo?.details?.childGuestCount;
  const adultGuestCount = reservationInfo?.details?.adultGuestCount;

  const handleCheckboxChange = (index: number) => {
    const updatedState =
      accompanyGuestData?.length > 0 &&
      accompanyGuestData?.map((guest: any, idx: any) => {
        if (idx === index) {
          return {
            ...guest,
            isChild: !guest?.isChild,
            emails: !guest?.isChild ? '' : guest?.emails,
            phone: !guest?.isChild ? '' : guest?.phone,
          };
        }
        return guest;
      });
    accompanyGuestDetails(updatedState);
  };

  const newGuestHandleCheckboxChange = (index: number) => {
    const newAccompanyGuestData = { ...newAccompanyGuestStorage };

    newAccompanyGuestData.adult[index].isChild = !newAccompanyGuestData?.adult[index]?.isChild;
    newAccompanyGuestData.adult[index].phone = newAccompanyGuestData?.adult[index]?.isChild
      ? ''
      : newAccompanyGuestData?.adult[index]?.phone;
    newAccompanyGuestData.adult[index].emails = newAccompanyGuestData?.adult[index]?.isChild
      ? ''
      : newAccompanyGuestData?.adult[index]?.emails;
    newAccompanyGuestData.adult[index].isSaved = false;
    newAccompanyGuestDetails(newAccompanyGuestData);
  };

  const checkInModule: any = config?.modules?.find((module: any) => module?.code === CHECK_IN);

  // primary guest configuration
  const guestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule?.isActive,
  );
  const activeSections = guestSubmodule?.details?.filter((section: any) => section?.isActive);
  const guestInformationSection = activeSections?.find(
    (section: any) => section?.name === GUESTINFORMATION && section.isActive,
  );
  const documentTypes = guestInformationSection?.details?.find(
    (e: any) => e?.name === DOCTYPE,
  )?.options;
  const genderTypes = guestInformationSection?.details?.find(
    (e: any) => e?.name === GENDER,
  )?.options;

  // accompanyguest configuration
  const accompanyingGuestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === ACCOMPANYINGGUEST && submodule.isActive,
  );
  const accompanyGuestInformationSection = updateDocTypeOptionsOptionConfig(
    accompanyingGuestSubmodule?.details,
    documentTypes,
    genderTypes,
  );

  // newguest configuration
  const newGuestModules = structuredClone(accompanyingGuestSubmodule);
  const newGuestConfigs = updateDocTypeForNewGuestOptions(
    newGuestModules,
    documentTypes,
    genderTypes,
  );
  const disabledFields = updateFieldStatus(guestInformationSection);

  const upgradeRoomConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === UPGRADE_ROOM && submodule.isActive,
  );

  const [guestInformation, setGuestInformation] = useState<any[]>(accompanyGuestInformationSection);

  useEffect(() => {
    if (documentTypes) {
      docTypeStorage(documentTypes);
    }
  }, [documentTypes]);

  useEffect(() => {
    if (!reservationData) {
      navigate(availablePaths?.HOME);
    }
  }, [reservationData, navigate]);

  // primary guest initialization
  const extractDataForField = useCallback(
    (inputFieldName: string) => {
      let source: any = reservationInfo?.guests && reservationInfo?.guests[0];

      const emailField = guestInformationSection?.details?.find(
        (field: any) => field?.isActive && field?.name === EMAILS,
      );
      if (source && source[inputFieldName]) {
        if (emailField && inputFieldName === EMAILS && emailField?.defaultValue === BLANK) {
          source = '';
        } else if (emailField && inputFieldName === EMAILS && emailField?.defaultValue === OTA) {
          if (reservationInfo?.confirmationId === reservationInfo?.uniqueBookingId) {
            source = source[inputFieldName];
          } else {
            source = '';
          }
        } else {
          source = source[inputFieldName];
        }
      } else {
        source = '';
      }

      if (Array.isArray(source)) {
        source = source.join(', ');
      }

      return source;
    },
    [
      guestInformationSection?.details,
      guestInformationSection?.type,
      reservationInfo?.confirmationId,
      reservationInfo?.guests,
      reservationInfo?.uniqueBookingId,
    ],
  );

  useEffect(() => {
    if (reservationInfo?.guests) {
      const initialGuestReservationInfo = activeSections?.reduce((values: any, section: any) => {
        section?.details?.forEach((field: any) => {
          const { name } = field;
          values[name] = extractDataForField(name);
        });
        return values;
      }, {});

      for (const key in initialGuestReservationInfo) {
        if (Object.prototype.hasOwnProperty.call(initialGuestReservationInfo, key)) {
          if (!initialGuestReservationInfo[key]) {
            initialGuestReservationInfo[key] = '';
          }
        }
      }

      reservationGuestInfoStorageData({
        ...initialGuestReservationInfo,
        ...guestReservationInfo,
        isComplete: validateCompleteGuestDetails(
          guestReservationInfo,
          guestInformationSection?.details,
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractDataForField, countryDrawer, reservationInfo?.guests]);
  // guest validation
  const validateCompleteGuestDetails = (guestDetails: any, field: any) => {
    if (!guestDetails) {
      return true;
    }
    if (field === undefined) {
      return true;
    }
    return field?.every((fieldItem: any) => {
      if (!fieldItem.isActive || !fieldItem.required) {
        return true;
      }

      const infoValue = fieldItem?.name in guestDetails ? guestDetails[fieldItem?.name] : true;

      if (fieldItem?.name === PHONE) {
        return validatePhoneNumber(infoValue);
      }
      if (fieldItem?.name === EMAILS) {
        return EMAIL_REGEX.test(infoValue);
      }

      return !!infoValue;
    });
  };

  const guestValidation = validateCompleteGuestDetails(
    guestReservationInfo,
    guestInformationSection?.details,
  );

  const generateAccompanyGuestDetails = useCallback(
    (accompanyGuestLists: any) => {
      const emailField =
        accompanyGuestInformationSection?.find(
          (field: any) => field?.isActive && field?.name === EMAILS,
        ) || {};
      return accompanyGuestLists
        ?.map((accompanyGuest: any) => {
          const guestData: any = { id: accompanyGuest?.id };

          accompanyGuestInformationSection?.forEach((item: any) => {
            if (item?.name in accompanyGuest && item?.isActive) {
              if (item?.name === EMAILS && emailField) {
                if (emailField?.defaultValue === BLANK) {
                  guestData[item?.name] = '';
                } else if (emailField?.defaultValue === OTA) {
                  if (reservationInfo?.confirmationId === reservationInfo?.uniqueBookingId) {
                    guestData[item?.name] = accompanyGuest[item?.name]?.[0] || '';
                  } else {
                    guestData[item?.name] = '';
                  }
                } else {
                  guestData[item?.name] = accompanyGuest[item?.name]?.[0] || '';
                }
              } else {
                guestData[item?.name] = Array.isArray(accompanyGuest[item?.name])
                  ? accompanyGuest[item?.name][0] || ''
                  : (accompanyingGuestSubmodule?.type === YOUVERSE ||
                      accompanyingGuestSubmodule?.type === TRENTIAL) &&
                    item?.name === DOC_NO
                  ? ''
                  : accompanyGuest[item?.name] || '';
              }
            }
          });

          if ('isChild' in accompanyGuest) {
            guestData.isChild = accompanyGuest?.isChild;
          } else {
            guestData.isChild = false;
          }

          return { guestData };
        })
        ?.map((item: any) => item?.guestData);
    },
    [
      accompanyGuestInformationSection,
      accompanyingGuestSubmodule?.type,
      reservationInfo?.confirmationId,
      reservationInfo?.uniqueBookingId,
    ],
  );

  // accompany guests initialization and validation
  useEffect(() => {
    if (
      reservationInfo &&
      reservationInfo?.guests?.length > 1 &&
      accompanyGuestData?.length === 0
    ) {
      accompanyGuestDetails(generateAccompanyGuestDetails(reservationInfo?.guests?.slice(1)));
    }
  }, [accompanyGuestData, generateAccompanyGuestDetails, reservationInfo]);

  const validDetails = Array.isArray(accompanyingGuestSubmodule?.details)
    ? accompanyingGuestSubmodule?.details
    : [];

  const accompanyGuestValidation = accompanyGuestData?.map((accompanyGuest: any) => {
    return validateCompleteGuestDetails(
      accompanyGuest,
      accompanyGuest?.isChild ? filterChildDetails(validDetails) : accompanyGuestInformationSection,
    );
  });

  // new guests initialization and validation
  useEffect(() => {
    if (
      (totalGuestCount > 0 && isEmpty(newAccompanyGuestStorage)) ||
      (adultGuestCount > 0 && isEmpty(newAccompanyGuestStorage?.adult))
    ) {
      const guestFields = accompanyGuestInformationSection.reduce((acc: any, curr: any) => {
        if (curr.label && curr.isActive) {
          acc[curr.name] = '';
        }
        acc.isChild = false;
        return acc;
      }, {});

      const childGuests = Array.from({ length: 0 }, (_, index) => ({
        ...guestFields,
        id: `guest-${index + 1}`,
        name: `Child Guest ${index + 1}`,
      }));

      const adultGuests = Array.from(
        { length: adultGuestCount + childGuestCount - reservationInfo?.guests?.length },
        (_, index) => ({
          ...guestFields,
          id: `guest-${index + 1}`,
          name: `Adult Guest ${index + 1}`,
        }),
      );
      newAccompanyGuestDetails({
        child: childGuests,
        adult: adultGuests,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stepper component
  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_REVIEW);
        if (item) {
          item.value = !(
            !guestValidation ||
            !reservationData ||
            !accompanyGuestValidation?.every((item: boolean) => item)
          )
            ? 100
            : 60;
        }
      }),
    );
  }, [accompanyGuestValidation, reservationData, guestValidation]);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_PAYMENT);
        if (item) {
          paymentConfig?.type === NONE ? (item.title = STEPPER_CUSTOMISATION) : null;
        }
      }),
    );
  }, [paymentConfig?.type]);

  const nextStep = useCallback(async () => {
    if (
      (paymentConfig?.type === NONE ||
        (paymentConfig?.isTotalChargeActive &&
          Number(reservationInfo?.roomTypes[0]?.totalCharge) === 0)) &&
      availablePersonalizations?.length === 0
    ) {
      navigate(availablePaths?.REVIEW);
    } else if (paymentConfig?.type === NONE && availablePersonalizations?.length !== 0) {
      navigate(availablePaths?.PERSONALIZE);
    } else {
      const filteredRoomList: any =
        availablePersonalizations?.length > 0 &&
        availablePersonalizations?.filter((item: any) => item?.isActive && item?.type === ROOM);
      if (upgradeRoomConfig?.type !== CMS && filteredRoomList?.length > 0) {
        navigate(availablePaths?.UPGRADE_ROOM);
      } else {
        navigate(availablePaths?.CARD_AUTHORISATION);
      }
    }
  }, [
    availablePersonalizations,
    navigate,
    paymentConfig,
    reservationInfo?.roomTypes,
    upgradeRoomConfig?.type,
  ]);

  // document update
  const goToTheNextStep = useCallback(async () => {
    setLoading(true);
    let successFlag = true;

    const updateGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
      docType: documentTypes?.find((option: any) => option?.value === guestReservationInfo?.docType)
        ?.code,
      docNumber: guestReservationInfo?.docNo,
      reservationId: reservationInfo?.confirmationId as string,
      firstName: guestReservationInfo?.firstName,
      lastName: guestReservationInfo?.lastName,
      profileId: reservationInfo?.guests[0]?.id as string,
      isPrimary: 'Y',
      effectiveDate: guestReservationInfo?.issueDate,
      expiryDate: guestReservationInfo?.expiry,
      countryOfIssue: guestReservationInfo?.issueCountry,
      documentFrontImage: guestInformationSection?.uploadId
        ? guestReservationInfo?.documentFrontImage
        : '',
      documentBackImage: guestInformationSection?.uploadId
        ? guestReservationInfo?.documentBackImage
        : '',
      channel: 'PWA',
      updateGuestDetails: {
        name: {
          firstName: guestReservationInfo?.firstName,
          lastName: guestReservationInfo?.lastName,
          gender: guestReservationInfo?.gender,
          nationality: guestReservationInfo?.nationality ?? '',
          dob: guestReservationInfo?.dob,
          profession: guestReservationInfo?.profession,
        },
        address: {
          id: reservationInfo?.guests[0]?.addressOperaId as string,
          addressLine1: guestReservationInfo?.addressLine,
          addressType: 'HOME',
          countryCode: guestReservationInfo?.countryCode,
          city: guestReservationInfo?.cityName,
          postalCode: guestReservationInfo?.postalCode,
          stateProv: guestReservationInfo?.stateProv,
        },
        phone: {
          id: reservationInfo?.guests[0]?.phoneOperaId
            ? reservationInfo?.guests[0]?.phoneOperaId[0]
            : '',
          phoneType: config?.pms === OHIP ? 'PHONE' : 'HOME',
          phoneNumber: guestReservationInfo?.phone ?? '',
          phoneRole: config?.pms === OHIP ? 'HOME' : 'PHONE',
        },
        email: {
          id: reservationInfo?.guests[0]?.emailOperaId
            ? reservationInfo?.guests[0]?.emailOperaId[0]
            : '',
          email: guestReservationInfo?.emails,
        },
      },
    };

    const updateGuestDetails = async (payload: IUpdateGuestDetailsApiRequest) => {
      try {
        const checkInToken = await getCheckInToken();
        await client.query({
          query: UPDATE_GUEST_DETAILS,
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          variables: {
            confirmationNumber: reservationInfo?.confirmationId as string,
            body: payload,
          },
        });
        return true;
      } catch (error) {
        const statusCode = processStatusCode(error as ApolloError);
        if (statusCode === 403) {
          handleCheckInAuthenticationFailure(updateGuestDetails(payload));
        }
        return false;
      }
    };

    successFlag = (await updateGuestDetails(updateGuestDetailsPayload)) && successFlag;

    if (newAccompanyGuestStorage?.adult?.length > 0) {
      const filteredAdultArray = newAccompanyGuestStorage?.adult?.filter(
        (item: any) => item?.profileId && !item?.isSaved,
      );

      if (filteredAdultArray?.length > 0) {
        for (const data of filteredAdultArray) {
          const updateAccompanyGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
            docType: documentTypes?.find((option: any) => option?.value === data?.docType)?.code,
            docNumber: data?.docNo,
            reservationId: reservationInfo?.reservationId as string,
            firstName: data?.firstName,
            lastName: data?.lastName,
            profileId: data?.profileId as string,
            isPrimary: 'N',
            effectiveDate: data?.issueDate,
            expiryDate: data?.expiry || '',
            documentFrontImage: guestInformationSection?.uploadId ? data?.documentFrontImage : '',
            documentBackImage: guestInformationSection?.uploadId ? data?.documentBackImage : '',
            countryOfIssue: data?.issueCountry || '',
            channel: 'PWA',
            updateGuestDetails: {
              name: {
                firstName: data?.firstName,
                lastName: data?.lastName,
                gender: data?.gender,
                nationality: data?.nationality,
                dob: data?.dob,
              },
              phone: {
                phoneType: data?.phone ? 'PHONE' : '',
                phoneNumber: data?.phone ?? '',
                phoneRole: data?.phone ? 'HOME' : '',
                id: data?.phoneOperaId ? data?.phoneOperaId[0] : '',
              },
              address: {
                addressLine1: data?.addressLine,
                addressType:
                  data?.addressLine ||
                  data?.countryCode ||
                  data?.cityName ||
                  data?.postalCode ||
                  data?.stateProv
                    ? 'HOME'
                    : '',
                countryCode: data?.countryCode,
                city: data?.cityName,
                postalCode: data?.postalCode,
                stateProv: data?.stateProv,
              },
              email: {
                email: data?.emails,
                id: data?.emailOperaId ? data?.emailOperaId[0] : '',
              },
            },
          };
          const newAccompanyGuestData = { ...newAccompanyGuestStorage };

          newAccompanyGuestData.adult.forEach((adult: any) => {
            if (adult?.profileId === data?.profileId) {
              adult.isSaved = true;
            }
          });

          newAccompanyGuestDetails(newAccompanyGuestData);
          successFlag =
            (await updateGuestDetails(updateAccompanyGuestDetailsPayload)) && successFlag;
        }
      }
    }

    if (accompanyGuestData?.length > 0) {
      for (const data of accompanyGuestData) {
        const updateAccompanyGuestDetailsPayload: IUpdateGuestDetailsApiRequest = {
          docType: documentTypes?.find((option: any) => option?.value === data?.docType)?.code,
          docNumber: data?.docNo,
          reservationId: reservationInfo?.reservationId as string,
          firstName: data?.firstName,
          lastName: data?.lastName,
          profileId: data?.id as string,
          isPrimary: 'N',
          effectiveDate: data?.issueDate,
          expiryDate: data?.expiry || '',
          countryOfIssue: data?.issueCountry || '',
          channel: 'PWA',
          documentFrontImage: guestInformationSection?.uploadId ? data?.documentFrontImage : '',
          documentBackImage: guestInformationSection?.uploadId ? data?.documentBackImage : '',
          updateGuestDetails: {
            name: {
              firstName: data?.firstName,
              lastName: data?.lastName,
              gender: data?.gender,
              nationality: data?.nationality,
              dob: data?.dob,
            },
            phone: {
              phoneType: data?.phone ? 'PHONE' : '',
              phoneNumber: data?.phone ?? '',
              phoneRole: data?.phone ? 'HOME' : '',
              id: data?.phoneOperaId ? data?.phoneOperaId[0] : '',
            },
            address: {
              addressLine1: data?.addressLine,
              addressType:
                data?.addressLine ||
                data?.countryCode ||
                data?.cityName ||
                data?.postalCode ||
                data?.stateProv
                  ? 'HOME'
                  : '',
              countryCode: data?.countryCode,
              city: data?.cityName,
              postalCode: data?.postalCode,
              stateProv: data?.stateProv,
            },
            email: {
              email: data?.emails,
              id: data?.emailOperaId ? data?.emailOperaId[0] : '',
            },
          },
        };

        successFlag = (await updateGuestDetails(updateAccompanyGuestDetailsPayload)) && successFlag;
      }
    }

    if (successFlag) {
      nextStep();
    } else {
      toggleNotification(true);
      notificationStorage({
        title: t('Please Try Again!') as string,
        description: t('Failed to update your details.') as string,
        redirect: null,
        type: FAILURE,
      });
    }

    setLoading(false);
  }, [
    accompanyGuestData,
    config?.pms,
    documentTypes,
    guestInformationSection?.uploadId,
    guestReservationInfo?.addressLine,
    guestReservationInfo?.cityName,
    guestReservationInfo?.countryCode,
    guestReservationInfo?.dob,
    guestReservationInfo?.docNo,
    guestReservationInfo?.docType,
    guestReservationInfo?.documentBackImage,
    guestReservationInfo?.documentFrontImage,
    guestReservationInfo?.emails,
    guestReservationInfo?.expiry,
    guestReservationInfo?.firstName,
    guestReservationInfo?.gender,
    guestReservationInfo?.issueCountry,
    guestReservationInfo?.issueDate,
    guestReservationInfo?.lastName,
    guestReservationInfo?.nationality,
    guestReservationInfo?.phone,
    guestReservationInfo?.postalCode,
    guestReservationInfo?.profession,
    guestReservationInfo?.stateProv,
    newAccompanyGuestStorage,
    nextStep,
    reservationInfo?.confirmationId,
    reservationInfo?.guests,
    reservationInfo?.reservationId,
    t,
  ]);

  useEffect(() => {
    if (childGuestCount > 0) {
      handleManualGuestConfig(newGuestConfigs);
    } else if (
      reservationInfo?.guests?.length <=
      reservationInfo?.details?.totalGuestCount - reservationInfo?.details?.childGuestCount
    ) {
      handleDefaultGuestConfig(newGuestConfigs);
    }

    setNewGuestFormData({
      configs: newGuestConfigs,
    });
  }, []);

  const handleManualGuestConfig = (guestConfigs: any) => {
    guestConfigs.type = 'manual';
    guestConfigs?.details
      ?.filter((detail: any) => detail?.isActive)
      ?.forEach((fields: any) => {
        if (['emails', 'phone']?.includes(fields?.name)) {
          fields.required = false;
        }
      });
  };

  const handleDefaultGuestConfig = (guestConfigs: any) => {
    if (guestConfigs?.type === TRENTIAL) {
      guestConfigs?.details
        ?.filter((detail: any) => detail?.isActive)
        ?.forEach((fields: any) => {
          if (fields?.name === 'firstName') {
            fields.isDisabled = false;
          }
        });
    } else {
      guestConfigs = accompanyingGuestSubmodule;
    }
  };

  const saveGuest = async (index?: any, method?: any) => {
    const checkInToken = await getCheckInToken();
    const addAccompanyGuestDetailsPayload = {
      isRegisterNewProfile: true,
      guests: [
        {
          firstName: newAccompanyGuestStorage?.[method][index]?.firstName,
          lastName: newAccompanyGuestStorage?.[method][index]?.lastName,
          phone: newAccompanyGuestStorage?.[method][index]?.phone,
          email: newAccompanyGuestStorage?.[method][index]?.emails,
          docType: documentTypes?.find(
            (option: any) => option?.value === newAccompanyGuestStorage?.[method][index]?.docType,
          )?.code,
          docNumber: newAccompanyGuestStorage?.[method][index]?.docNo,
          dob: newAccompanyGuestStorage?.[method][index]?.dob,
          nationality: newAccompanyGuestStorage?.[method][index]?.nationality,
          countryOfIssue: newAccompanyGuestStorage?.[method][index]?.issueCountry,
          expiryDate: newAccompanyGuestStorage?.[method][index]?.expiry,
          effectiveDate: newAccompanyGuestStorage?.[method][index]?.issueDate,
          gender: newAccompanyGuestStorage?.[method][index]?.gender,
          arrivalDate: dayjs(reservationInfo?.details?.checkInDate).format(
            timeFormats.YEAR_MONTH_DAY,
          ),
          departureDate: dayjs(reservationInfo?.details?.checkOutDate).format(
            timeFormats.YEAR_MONTH_DAY,
          ),
          address: {
            addressLine1: newAccompanyGuestStorage?.[method][index]?.addressLine,
            addressType: 'HOME',
            stateProv: newAccompanyGuestStorage?.[method][index]?.stateProv,
          },
          documentFrontImage: guestInformationSection?.uploadId
            ? newAccompanyGuestStorage?.[method][index]?.documentFrontImage
            : '',
          documentBackImage: guestInformationSection?.uploadId
            ? newAccompanyGuestStorage?.[method][index]?.documentBackImage
            : '',
        },
      ],
    };

    try {
      setGuestLoading(true);
      const res: any = await client.query({
        query: ADD_ACCOMPANY_GUEST,
        context: {
          clientName: 'rest',
          headers: { Authorization: 'Bearer ' + checkInToken },
        },
        variables: {
          confirmationNumber: reservationInfo?.confirmationId as string,
          body: addAccompanyGuestDetailsPayload,
        },
      });
      newAccompanyGuestDetails({
        child:
          method === 'child'
            ? newAccompanyGuestStorage?.[method]?.map((guest: any, i: any) =>
                i === index
                  ? {
                      ...guest,
                      isSaved: true,
                      profileId: res?.data?.addAccompanyDetails?.data?.at(-1)?.id,
                      status: 'updated',
                    }
                  : guest,
              )
            : newAccompanyGuestStorage?.child,
        adult:
          method === 'adult'
            ? newAccompanyGuestStorage?.[method]?.map((guest: any, i: any) =>
                i === index
                  ? {
                      ...guest,
                      isSaved: true,
                      profileId: res?.data?.addAccompanyDetails?.data?.at(-1)?.id,
                      status: 'updated',
                    }
                  : guest,
              )
            : newAccompanyGuestStorage?.adult,
      });
      updateNewAccompanyGuestDetails([
        ...updatedGuestData,
        {
          ...newAccompanyGuestStorage,
          id: res?.data?.addAccompanyDetails?.data?.at(-1)?.id,
        },
      ]);
      toggleNotification(true);
      notificationStorage({
        title: t('Guest Added') as string,
        description: t('Guest information added successfully.') as string,
        redirect: null,
        type: SUCCESS,
      });
      setGuestLoading(false);
    } catch (error) {
      toggleNotification(true);
      notificationStorage({
        title: t('Please Try Again!') as string,
        description: t('Failed to add guest details.') as string,
        redirect: null,
        type: FAILURE,
      });
      setGuestLoading(false);
    }
  };

  const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
      boxSizing: 'border-box',
      maxHeight: '6rem',
      '& ul': {
        padding: 0,
        margin: 0,
      },
    },
  });

  const countryDrawerDetails = () => {
    return (
      <div className={styles.drawerWrapper}>
        <p className={styles.pageTitle}>{t('Choose Your Nationality')}</p>
        <Autocomplete
          disablePortal
          disableClearable={true}
          disableListWrap
          PopperComponent={StyledPopper}
          className={styles.countryDropdown}
          options={Countries?.map((country) => country?.name)}
          value={
            guestReservationInfo?.nationality
              ? Countries?.find(
                  (country: any) => country?.value === guestReservationInfo?.nationality,
                )?.name
              : undefined
          }
          autoComplete={true}
          onChange={(event, selectedCountry) => {
            const country = Countries?.find((country) => country?.name === selectedCountry)?.value;
            reservationGuestInfoStorageData({
              ...guestReservationInfo,
              nationality: country,
              countryCode: country,
            });
          }}
          renderInput={(params) => (
            <StyledInput
              required
              {...params}
              label={t('Nationality')}
              InputProps={{
                ...params.InputProps,

                endAdornment: (
                  <InputAdornment position='end'>
                    <DropDownIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <StyledButton
          variant='contained'
          className={styles.button}
          disabled={guestReservationInfo?.nationality ? false : true}
          onClick={() => setCountryDrawer(false)}
        >
          {t('Next')}
        </StyledButton>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Identity Verification')}
        </title>
      </Head>
      <Header
        screenTitle={t(`${guestSubmodule?.label}`) as string}
        displayBackButton
        backRoute={availablePaths?.CHECK_IN}
        language
      />
      {!dayjsLocaleLoader ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper}>
          <Stepper />
          <div className={styles.titleWrapper}>
            <p className={styles.title}>{t('Identity Verification')}</p>
            <p className={styles.description}>
              {`${
                guestInformationSection?.type === MANUAL
                  ? t('Complete your identity verification by filling out essential details.')
                  : t('Scan your Passport/ID to verify your identity.')
              } ${t('Your information is protected by responsible data practices.')}
               ${t(`${disclaimerDisplayText}`)}`}
            </p>
          </div>
          {(reservationInfo?.details?.contactPerson?.firstName ||
            reservationInfo?.details?.contactPerson?.lastName) && (
            <div className={styles.boxWrapper}>
              <p className={styles.guestType}>{t('Primary Guest')}</p>
              <div>
                {openTogglePrimaryGuest ? (
                  <DetailsCard
                    title={`${guestReservationInfo?.firstName}  ${guestReservationInfo?.lastName}`}
                    handleClick={() =>
                      guestValidation && setOpenTogglePrimaryGuest((prev) => !prev)
                    }
                    icon={guestValidation}
                  >
                    {!guestReservationInfo?.docNo &&
                      (guestInformationSection?.type === YOUVERSE ||
                        guestInformationSection?.type === TRENTIAL ||
                        guestInformationSection?.type === INCODE) && (
                        <StyledButton
                          variant='contained'
                          className={styles.scanDocWrapper}
                          onClick={() => {
                            profileIDStorage({
                              id: reservationInfo?.guests[0]?.id,
                              guestType: PRIMARY,
                            });
                            navigate(
                              guestInformationSection?.type === YOUVERSE
                                ? availablePaths?.YOUVERSE
                                : guestInformationSection?.type === TRENTIAL
                                ? availablePaths?.TRENTIAL
                                : availablePaths?.INCODE,
                            );
                          }}
                        >
                          <Camera />
                          <span className={styles.scanDocText}>{t('Scan & Verify')}</span>
                        </StyledButton>
                      )}
                    {guestReservationInfo && guestInformationSection?.details && (
                      <PreCheckinGuestInfo
                        selectedGuest={guestReservationInfo}
                        guestInformationSection={
                          enableIdVerificationStatus
                            ? guestInformationSection?.details
                            : disabledFields?.details
                        }
                        type={PRIMARY}
                      />
                    )}
                  </DetailsCard>
                ) : (
                  <DetailsCardShrinked
                    error={guestValidation}
                    title={`${guestReservationInfo?.firstName}  ${guestReservationInfo?.lastName}`}
                    handleClick={() => setOpenTogglePrimaryGuest((prev) => !prev)}
                  >
                    {!guestValidation && (
                      <div className={styles.pendingDetails}>
                        <DangerIcon className={styles.icon} />
                        <div className={styles.pendingText}>{t('Pending Details')}</div>
                      </div>
                    )}
                  </DetailsCardShrinked>
                )}
              </div>
            </div>
          )}
          {reservationInfo?.details?.totalGuestCount > 1 && (
            <p className={styles.guestType}>
              {reservationInfo?.details?.totalGuestCount === 2 ? t('Sharer') : t('Sharers')}{' '}
            </p>
          )}

          {accompanyGuestData && accompanyGuestData?.length > 0 && (
            <div className={styles.boxWrapper}>
              {accompanyGuestData?.map((selectedAccompanyGuest: any, index: number) => (
                <div key={index}>
                  {accompanyingGuestSubmodule?.type === YOUVERSE ||
                  accompanyingGuestSubmodule?.type === TRENTIAL ? (
                    !selectedAccompanyGuest?.docNo || !selectedAccompanyGuest?.docType ? (
                      <DetailsCard
                        title={`${selectedAccompanyGuest?.firstName}  ${selectedAccompanyGuest?.lastName}`}
                      >
                        <StyledButton
                          variant='contained'
                          className={styles.scanDocWrapper}
                          onClick={() => {
                            profileIDStorage({
                              id: selectedAccompanyGuest?.id,
                              guestType: ACCOMPANYINGGUEST,
                            });
                            navigate(
                              accompanyingGuestSubmodule?.type === YOUVERSE
                                ? availablePaths?.YOUVERSE
                                : accompanyingGuestSubmodule?.type === TRENTIAL
                                ? availablePaths?.TRENTIAL
                                : availablePaths?.INCODE,
                            );
                          }}
                        >
                          <Camera />
                          <span className={styles.scanDocText}>{t('Scan & Verify')}</span>
                        </StyledButton>
                      </DetailsCard>
                    ) : (
                      selectedAccompanyGuest &&
                      accompanyGuestInformationSection?.length > 0 &&
                      (openToggleAccompanyGuest[index] ? (
                        <DetailsCard
                          title={`${t('Guest')} ${index + 1}`}
                          handleClick={() =>
                            setOpenToggleAccompanyGuest((prev) => {
                              const newState = [...prev];
                              newState[index] = !newState[index];
                              return newState;
                            })
                          }
                          icon
                        >
                          <div className={styles.margin}>
                            <PreCheckinGuestInfo
                              selectedGuest={selectedAccompanyGuest}
                              guestInformationSection={
                                selectedAccompanyGuest?.isChild
                                  ? accompanyGuestInformationSection?.map((field: any) => {
                                      if (field?.name === PHONE || field?.name === EMAILS) {
                                        return { ...field, isActive: false };
                                      }
                                      return field;
                                    })
                                  : accompanyGuestInformationSection
                              }
                              type={SECONDARY}
                            />
                          </div>
                        </DetailsCard>
                      ) : (
                        <DetailsCardShrinked
                          error={accompanyGuestValidation[index]}
                          title={`${t('Guest')} ${index + 1}`}
                          handleClick={() =>
                            setOpenToggleAccompanyGuest((prev) => {
                              const newState = [...prev];
                              newState[index] = !newState[index];
                              return newState;
                            })
                          }
                        >
                          <div className={styles.cardTitleWrapper}>
                            <p className={styles.cardTitleAccompany}>
                              {`${selectedAccompanyGuest?.firstName} ${selectedAccompanyGuest?.lastName}`}
                            </p>
                          </div>
                          {!accompanyGuestValidation[index] && (
                            <div className={styles.pendingDetails}>
                              <DangerIcon className={styles.icon} />
                              <div className={styles.pendingText}>{t('Pending Details')}</div>
                            </div>
                          )}
                        </DetailsCardShrinked>
                      ))
                    )
                  ) : (
                    selectedAccompanyGuest &&
                    accompanyGuestInformationSection?.length > 0 &&
                    (openToggleAccompanyGuest[index] ? (
                      <DetailsCard
                        title={`${t('Guest')} ${index + 1}`}
                        handleClick={() =>
                          setOpenToggleAccompanyGuest((prev) => {
                            const newState = [...prev];
                            newState[index] = !newState[index];
                            return newState;
                          })
                        }
                        icon
                      >
                        <div className={styles.margin}>
                          <div className={styles.checkboxWrapper}>
                            <StyledCheckBox
                              checked={selectedAccompanyGuest?.isChild}
                              onChange={() => handleCheckboxChange(index)}
                            />
                            <label className={styles.checkboxLabel}>
                              {t('below_age', {
                                value: accompanyingGuestSubmodule?.minorGuestAgeLimit ?? 18,
                              })}
                            </label>
                          </div>
                          <PreCheckinGuestInfo
                            selectedGuest={selectedAccompanyGuest}
                            guestInformationSection={
                              selectedAccompanyGuest?.isChild
                                ? accompanyGuestInformationSection?.map((field: any) => {
                                    if (field?.name === PHONE || field?.name === EMAILS) {
                                      return { ...field, isActive: false };
                                    }
                                    return field;
                                  })
                                : accompanyGuestInformationSection
                            }
                            type={SECONDARY}
                          />
                        </div>
                      </DetailsCard>
                    ) : (
                      <DetailsCardShrinked
                        error={accompanyGuestValidation[index]}
                        title={`${t('Guest')} ${index + 1}`}
                        handleClick={() =>
                          setOpenToggleAccompanyGuest((prev) => {
                            const newState = [...prev];
                            newState[index] = !newState[index];
                            return newState;
                          })
                        }
                      >
                        <div className={styles.cardTitleWrapper}>
                          <p className={styles.cardTitleAccompany}>
                            {`${selectedAccompanyGuest?.firstName} ${selectedAccompanyGuest?.lastName}`}
                          </p>
                        </div>
                        {!accompanyGuestValidation[index] && (
                          <div className={styles.pendingDetails}>
                            <DangerIcon className={styles.icon} />
                            <div className={styles.pendingText}>{t('Pending Details')}</div>
                          </div>
                        )}
                      </DetailsCardShrinked>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
          {(reservationInfo?.details?.adultGuestCount > 0 ||
            reservationInfo?.details?.childGuestCount > 0) && (
            <>
              {[
                ...(newAccompanyGuestStorage?.adult || []),
                ...(newAccompanyGuestStorage?.child || []),
              ]?.map((newGuest: any, index: number) => {
                const uniqueIndex = index + accompanyGuestData.length;

                const handleDetailsCardClick = () => {
                  setOpenToggleAddNewGuestForAdult((prev) => {
                    const newState = [...prev];
                    newState[uniqueIndex] = !newState[uniqueIndex];
                    return newState;
                  });
                };

                const handleShrinkedCardClick = () => {
                  setOpenToggleAddNewGuestForAdult((prev) => {
                    const newState = [...prev];
                    newState[uniqueIndex] = !newState[uniqueIndex];
                    return newState;
                  });
                };

                const handleScanDocumentClick = () => {
                  profileIDStorage({ id: newGuest?.id, guestType: NEWGUESTSCAN });
                  navigate(
                    accompanyingGuestSubmodule?.type === YOUVERSE
                      ? availablePaths?.YOUVERSE
                      : accompanyingGuestSubmodule?.type === TRENTIAL
                      ? availablePaths?.TRENTIAL
                      : availablePaths?.INCODE,
                  );
                };

                const updatedGuestInformation = newGuest?.isChild
                  ? guestInformation?.map((field) => {
                      if (field?.name === FIRST_NAME || field?.name === LAST_NAME) {
                        return {
                          ...field,
                          isDisabled: newGuest?.status == 'updated' ? true : false,
                        };
                      }
                      if (field?.name === PHONE || field?.name === EMAILS) {
                        return { ...field, isActive: false, required: false };
                      }
                      return field;
                    })
                  : guestInformation?.map((field) => {
                      if (field?.name === FIRST_NAME || field?.name === LAST_NAME) {
                        return {
                          ...field,
                          isDisabled: newGuest?.status == 'updated' ? true : false,
                        };
                      }
                      return field;
                    });

                return (
                  <div key={index}>
                    {accompanyingGuestSubmodule?.type === YOUVERSE ||
                    accompanyingGuestSubmodule?.type === TRENTIAL ? (
                      !newGuest?.docNo ? (
                        <DetailsCard
                          title={t(`${t('Guest')} ${accompanyGuestData?.length + index + 1}`)}
                        >
                          <StyledButton
                            variant='contained'
                            className={styles.scanDocWrapper}
                            onClick={handleScanDocumentClick}
                          >
                            <Camera />
                            <span className={styles.scanDocText}>{t('Scan & Verify')}</span>
                          </StyledButton>
                        </DetailsCard>
                      ) : openToggleAddNewGuestForAdult[index] ? (
                        <DetailsCard
                          title={`${t('Guest')} ${accompanyGuestData?.length + index + 1}`}
                          handleClick={handleDetailsCardClick}
                          icon
                        >
                          <div className={styles.margin}>
                            <div className={styles.checkboxWrapper}>
                              <StyledCheckBox
                                checked={newGuest?.isChild}
                                onChange={() => newGuestHandleCheckboxChange(index)}
                              />
                              <label className={styles.checkboxLabel}>
                                {t('below_age', {
                                  value: accompanyingGuestSubmodule?.minorGuestAgeLimit ?? 18,
                                })}
                              </label>
                            </div>

                            <PreCheckinGuestInfo
                              selectedGuest={newGuest}
                              guestInformationSection={updatedGuestInformation}
                              type={newGuest?.isSaved ? NEWGUEST : NEWGUESTFORM}
                              method='adult'
                            />
                            {!newGuest?.isSaved && !newGuest?.profileId && (
                              <StyledButton
                                variant='contained'
                                disabled={newGuest?.disabled}
                                className={styles.button}
                                loading={guestLoading}
                                onClick={() => saveGuest(uniqueIndex, 'adult')}
                              >
                                {t('Save')}
                              </StyledButton>
                            )}
                          </div>
                        </DetailsCard>
                      ) : (
                        <DetailsCardShrinked
                          error={newGuest?.isSaved ? true : false}
                          title={`${newGuest?.firstName} ${newGuest?.lastName}`}
                          handleClick={handleShrinkedCardClick}
                        >
                          <div className={styles.cardTitleWrapper}>
                            {!newGuest?.isSaved && !newGuest?.profileId && (
                              <div className={styles.pendingDetails}>
                                <DangerIcon className={styles.icon} />
                                <div className={styles.pendingText}>{t('Pending Details')}</div>
                              </div>
                            )}
                          </div>
                        </DetailsCardShrinked>
                      )
                    ) : openToggleAddNewGuestForAdult[uniqueIndex] ? (
                      <DetailsCard
                        title={`${t('Guest')} ${accompanyGuestData?.length + index + 1}`}
                        handleClick={handleDetailsCardClick}
                        icon
                      >
                        <div className={styles.box}>
                          <div className={styles.checkboxWrapper}>
                            <StyledCheckBox
                              checked={newGuest?.isChild}
                              onChange={() => newGuestHandleCheckboxChange(index)}
                            />
                            <label className={styles.checkboxLabel}>
                              {t('below_age', {
                                value: accompanyingGuestSubmodule?.minorGuestAgeLimit ?? 18,
                              })}
                            </label>
                          </div>

                          <PreCheckinGuestInfo
                            selectedGuest={newGuest}
                            guestInformationSection={updatedGuestInformation}
                            type={NEWGUESTFORM}
                            method='adult'
                          />
                          {!newGuest?.isSaved && !newGuest?.profileId && (
                            <StyledButton
                              variant='contained'
                              disabled={newGuest?.disabled}
                              className={styles.button}
                              loading={guestLoading}
                              onClick={() => saveGuest(index, 'adult')}
                            >
                              {t('Save')}
                            </StyledButton>
                          )}
                        </div>
                      </DetailsCard>
                    ) : (
                      <DetailsCardShrinked
                        error={newGuest?.isSaved ? true : false}
                        title={`${t('Guest')} ${accompanyGuestData?.length + index + 1}`}
                        handleClick={handleShrinkedCardClick}
                      >
                        <div className={styles.cardTitleWrapper}>
                          <p className={styles.cardTitleAccompany}>
                            {`${newGuest?.firstName} ${newGuest?.lastName}`}
                          </p>
                        </div>
                      </DetailsCardShrinked>
                    )}
                  </div>
                );
              })}
            </>
          )}
          <div className={cx(styles.bottomMenuWrapper)}>
            <StyledButton
              variant='contained'
              loading={loading}
              disabled={
                !primaryGuestButtonDisable ||
                accompanyGuestValidation.some((item: boolean) => !item) ||
                (accompanyingGuestSubmodule?.mandatory
                  ? (accompanyGuestData || []).concat(updatedGuestData || [])?.length <
                    reservationInfo?.details?.totalGuestCount - 1
                  : false)
              }
              onClick={goToTheNextStep}
              className={cx(styles.bottomMenuButton)}
            >
              {t('Next')}
            </StyledButton>
          </div>
          {config?.idVerificationBasedOnNationality &&
            (guestInformationSection?.type === YOUVERSE ||
            guestInformationSection?.type === TRENTIAL
              ? !guestReservationInfo?.docNo
              : true) && (
              <CustomDrawer
                open={countryDrawer}
                onClose={() => (guestReservationInfo?.countryCode ? setCountryDrawer(false) : null)}
                content={countryDrawerDetails()}
              />
            )}
        </PageWrapper>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['errors', 'about-your-stay', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default Guest;
