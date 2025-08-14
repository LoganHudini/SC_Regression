/* eslint-disable camelcase */
import Head from 'next/head';
import SignatureCanvas from 'react-signature-canvas';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledCheckBox } from 'components/shared/StyledCheckBox/StyledCheckBox';
import styles from '@styles/check-in-v2/check-in-v2.module.scss';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { guestInformationStorage } from 'storage/guest-information.storage';
import { ApolloError, useReactiveVar } from '@apollo/client';
import {
  personalizeYourRoomStorage,
  upgradeYourRoomStorage,
} from 'storage/personalize-your-room.storage';
import { client } from 'core/graphql/client';
import { IGetReservationApiResponse, GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { CHECKIN, ICheckInApiRequest, PRECHECKIN } from 'core/graphql/queries/CHECKIN';
import { ICheckinProps } from 'types/check-in.types';
import { GetStaticProps } from 'next';
import { saveTrip } from 'storage/trips.storage';
import {
  StepperInformationStorage,
  checkinStorage,
  reviewSignAndCheckBox,
} from 'storage/check-in.storage';
import {
  IPreSignDocUploadApiRequest,
  IPreSignDocUploadApiResponse,
  PRE_SIGN_DOC_UPLOAD,
} from 'core/graphql/queries/PRE_SIGN_DOC_UPLOAD';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { availablePaths } from 'utils/availablePaths';
import { DetailsCard, DetailsCardShrinked } from 'components/shared/DetailsCard/DetailsCard';
import { timeFormats } from 'utils/timeFormats';
import dayjs from 'dayjs';
import cx from 'classnames';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import {
  PRE_CHECKIN_ERROR_MSG,
  cardTypes,
  CHECK_IN,
  REVIEW,
  CHKOUT,
  CANCELED,
  STEPPER_CHECK_IN,
  SUCCESS,
  FAILURE,
  CARD_TYPE,
  NOSHOW,
  ERRORMSG,
  NONE,
  WEBURL2,
  DOCUMENT_LIST,
  CHECKEDOUT,
  INFORMATION,
  GUESTINFORMATION,
  ACCOMPANYINGGUEST,
  personalisation,
  CMS,
  PMS,
  CANCELLED,
  settlementType,
  INFOR,
  DOCTYPE,
  MULTIPLE_PRIVACY_OPTIONS,
} from 'utils/constants';
import {
  notificationStorage,
  hotelInformation,
  setDayjsLocale,
  toggleNotification,
} from 'storage/home.storage';
import { useConfig, usePaymentConfig } from 'utils/hooks/useConfiguration';
import { Stepper } from 'components/shared/Stepper/Stepper';
import produce from 'immer';
import {
  accompanyGuestDetails,
  IsBiometricsSkipped,
  newAccompanyGuestDetails,
} from 'storage/accompany-guest-details';
import {
  getCheckInToken,
  handleCheckInAuthenticationFailure,
} from 'core/api/functions/getCheckInAuthentication';
import { processStatusCode } from 'utils/processError';
import { ASSETS_URL, S3_URL } from 'core/graphql/endpoints';
import Link from 'next/link';
import { fetchCharges, formatPrice } from 'utils/functions';
import Resizer from 'react-image-file-resizer';
import { UPDATE_EVA } from 'core/graphql/queries/UPDATE_EVA';
import { getHotelId } from 'utils/fetchConfigs';
import { Loader } from 'components/shared/Loaders/Loaders';
import { Countries } from '../../../../utils/countryList';
import { useCurrency } from 'utils/hooks/useCurrency';
import { StyledInput } from 'components/shared/StyledInput/StyledInput';
import { useFormik } from 'formik';
import { instructionValidation } from 'validation/dining.validation';
import CameraCapture from 'components/shared/renderCamera/CameraCapture';
import Remove from '@icons/removeButton.svg';
import AddImage from '@icons/addImage.svg';

export { getStaticPaths };

const CheckIn: React.FC<ICheckinProps> = () => {
  const { t } = useTranslation(['check-in', 'common']);
  const navigate = useLocalizedRouter();
  const config = useConfig();
  const paymentConfig: any = usePaymentConfig();
  const hotelId = config?.hotelId;
  const guests = useReactiveVar(guestInformationStorage);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);
  const accompanyGuestInfo = useReactiveVar(accompanyGuestDetails);
  const updatedGuestInfo: any = useReactiveVar(newAccompanyGuestDetails);
  const reviewAndSign = useReactiveVar(reviewSignAndCheckBox);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signature, setSignature] = useState<any>(reviewAndSign?.sign || null);
  const [isRuleEnabled, setIsRuleEnabled] = useState(true);
  const [filteredFields, setFilteredFields] = useState<any[]>([]);

  const updatedGuestData = useMemo(() => {
    const guestInfolength = updatedGuestInfo?.adult?.length;
    return guestInfolength > 0
      ? (updatedGuestInfo?.adult || [])?.filter(
          (item: any) => item?.lastName && item?.profileId && item?.isSaved,
        )
      : [];
  }, [updatedGuestInfo]);
  const hotelInfo = useReactiveVar(hotelInformation);
  const information = hotelInfo?.detailsCustomAttributes;
  const termsAndConditions =
    information?.find((item: any) => item?.key === MULTIPLE_PRIVACY_OPTIONS)?.value || '';

  let termsAndConditionsValue: any = useMemo(() => [], []);

  if (
    termsAndConditions &&
    typeof termsAndConditions === 'string' &&
    termsAndConditions?.trim() !== ''
  ) {
    try {
      const parsed = JSON.parse(termsAndConditions);
      if (Array.isArray(parsed)) {
        termsAndConditionsValue = parsed;
      }
    } catch (error) {
      console.error('Failed to parse termsAndConditions JSON:', error);
    }
  }

  useEffect(() => {
    if (!sigCanvas?.current) return;

    const canvas = sigCanvas.current.getCanvas();
    const ctx: any = canvas.getContext('2d');

    const applyWhiteBackground = () => {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    };

    applyWhiteBackground();
    const matchDark = window.matchMedia('(prefers-color-scheme: dark)');
    matchDark.addEventListener('change', applyWhiteBackground);

    return () => {
      matchDark.removeEventListener('change', applyWhiteBackground);
    };
  }, [sigCanvas]);

  const dayjsLocaleLoader = useReactiveVar(setDayjsLocale);
  const [accompanyGuestInformationState, setAcccompanyGuestInformation] = useState(
    new Array(accompanyGuestInfo?.length)?.fill(false),
  );
  const IsBiometricsSkippedStatus = useReactiveVar(IsBiometricsSkipped);
  const personalizationEntities = useReactiveVar(personalizeYourRoomStorage);
  const upgradeRoomEntities = useReactiveVar(upgradeYourRoomStorage);
  const [conditionsAccepted, setConditionsAccepted] = useState(reviewAndSign?.checkBox);
  const [btnStatus, setBtnStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signatureWidth, setSignatureWidth] = useState(340);
  const [specialRequests, setSpecialRequests] = useState('');
  const currency = useCurrency();
  // camera
  const [openCamera, setOpenCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [invalidFileSelected, setInvalidFileSelected] = useState(false);

  // card expansion states
  const [stayInformation, setStayInformation] = useState(false);
  const [primaryGuestInformation, setPrimaryGuestInformation] = useState(false);
  const [creditCardInformation, setCreditCardInformation] = useState(false);

  const data: any = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo = data?.getReservation?.data;
  const adult = reservationInfo?.details.adultGuestCount.toString();
  const children = reservationInfo?.details.childGuestCount.toString();
  const roomNo = reservationInfo?.roomTypes[0]?.roomNumber;

  const cardType = cardTypes
    ?.find((item) => item?.code === guestReservationInfo?.cardType)
    ?.name?.toUpperCase();

  const checkInModule: any = config?.modules?.find((module: any) => module?.code === CHECK_IN);
  const reviewConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === REVIEW && submodule.isActive,
  );

  const dynamicFields = reviewConfig?.dynamicFields;
  const count = dynamicFields?.find((i: any) => i.type === 'camera')?.imageCount;
  const isRequiredDynamicField =
    dynamicFields?.find((i: any) => i.type === 'camera')?.optional === false ? true : false;

  const combinedGuests = [
    {
      ...guestReservationInfo,
      isPrimary: true,
    },
  ];
  if (accompanyGuestInfo && accompanyGuestInfo?.length > 0) {
    combinedGuests.push(
      ...accompanyGuestInfo.map((guest: any) => ({
        ...guest,
        isPrimary: false,
      })),
    );
  }

  // Add AdultGuestCount as a special entry
  combinedGuests.push({
    adultGuestCount: 1 + accompanyGuestInfo?.filter((g: any) => !g?.isChild)?.length,
  });

  const [checkboxStates, setCheckboxStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const initialState: { [key: number]: boolean } = {};

    termsAndConditionsValue?.forEach((item: any, idx: number) => {
      const isChecked = reviewSignAndCheckBox()?.multipleTerms?.includes(idx);
      initialState[idx] = isChecked || item?.defaultChecked || false;
    });

    setCheckboxStates(initialState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewConfig]);

  const toggleCheckbox = (index: number, viewed?: any) => {
    setCheckboxStates((prev) => {
      const updated = {
        ...prev,
        [index]: !prev[index],
      };

      const checkedIndices = Object.entries(updated)
        ?.filter(([_, checked]) => checked)
        ?.map(([idx]) => Number(idx));

      reviewSignAndCheckBox(
        produce(reviewSignAndCheckBox(), (draft: any) => {
          draft.multipleTerms = checkedIndices;
          if (viewed) {
            draft.viewed = Array.isArray(draft?.viewed) ? draft?.viewed : [];
            if (!draft?.viewed?.includes(index)) {
              draft?.viewed?.push(index);
            }
          }
        }),
      );

      return updated;
    });
  };

  const allMandatoryAccepted = termsAndConditionsValue?.every(
    (option: any, idx: number) => !option.mandatory || checkboxStates[idx],
  );

  const guestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === INFORMATION && submodule?.isActive,
  );
  const activeSections = guestSubmodule?.details?.filter((section: any) => section?.isActive);
  const guestInformationSection = activeSections?.find(
    (section: any) => section?.name === GUESTINFORMATION && section.isActive,
  );

  const accompanyingGuestSubmodule = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === ACCOMPANYINGGUEST && submodule.isActive,
  );

  const personalisationConfig = checkInModule?.submodules?.find(
    (submodule: any) => submodule?.name === personalisation && submodule.isActive,
  );

  const formik = useFormik({
    initialValues: { instruction: '' },
    validationSchema: instructionValidation,
    onSubmit: (values) => {
      setSpecialRequests(values.instruction);
    },
  });

  useEffect(() => {
    const signatureWidth = () => {
      const div = document.getElementById('signatureWrapper');
      if (div) {
        setSignatureWidth(div.offsetWidth);
      }
    };
    signatureWidth();
    window.addEventListener('resize', signatureWidth);

    return () => {
      window.removeEventListener('resize', signatureWidth);
    };
  }, []);

  useEffect(() => {
    if (
      !data ||
      data?.getReservation?.data?.reservationStatus === CANCELED ||
      data?.getReservation?.data?.reservationStatus === CHECKEDOUT ||
      data.getReservation.data.reservationStatus === CHKOUT ||
      data.getReservation.data.reservationStatus === CANCELLED ||
      data.getReservation.data.reservationStatus === NOSHOW
    ) {
      navigate(availablePaths?.HOME);
    }
  }, [data, navigate]);
  const preCheckInStatus = config?.preCheckInOnly
    ? true
    : !(roomNo && guestReservationInfo?.roomStatus && paymentConfig?.type !== NONE)
    ? true
    : false;

  useEffect(() => {
    if (
      conditionsAccepted &&
      sigCanvas?.current &&
      signature !== null &&
      (termsAndConditionsValue?.length > 0 ? allMandatoryAccepted : true) &&
      (isRuleEnabled
        ? isRequiredDynamicField
          ? capturedImages?.length > 0
            ? true
            : false
          : true
        : true)
    ) {
      setBtnStatus(true);
    } else {
      setBtnStatus(false);
    }
  }, [
    conditionsAccepted,
    signature,
    allMandatoryAccepted,
    termsAndConditionsValue?.length,
    capturedImages,
    isRequiredDynamicField,
    isRuleEnabled,
  ]);

  const clearCanvas = useCallback(() => {
    sigCanvas?.current?.clear();
    setSignature(null);
    setBtnStatus(false);
    reviewSignAndCheckBox(
      produce(reviewSignAndCheckBox(), (draft: any) => {
        draft.sign = null;
      }),
    );
  }, []);

  const fixSignatureBackground = () => {
    if (!sigCanvas?.current) return;

    const canvas = sigCanvas.current.getCanvas();
    const width = canvas.width;
    const height = canvas.height;

    const ctx: any = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
  };

  const toggleConditionsAccepted = useCallback(() => {
    setConditionsAccepted((oldState: any) => {
      const newState = !oldState;
      reviewSignAndCheckBox(
        produce(reviewSignAndCheckBox(), (draft: any) => {
          draft.checkBox = newState;
        }),
      );
      return newState;
    });
  }, []);

  const handleSignatureChange = () => {
    const signatureData = sigCanvas?.current?.toData();
    setSignature(signatureData);
    const signvalue = { ...reviewAndSign };
    signvalue.sign = signatureData;
    reviewSignAndCheckBox(signvalue);
  };

  const goToCheckIn = useCallback(async () => {
    setLoading(true);
    let guestSignature = '';

    // upload guest signature
    const uploadSignaturePayload: IPreSignDocUploadApiRequest = {
      groupId: hotelInfo?.groupId,
      type: 'reservation_docs',
      propertyType: 'hotels',
      confirmationId: reservationInfo?.confirmationId ?? '',
      filename: `${guests ? guests[0]?.firstName : ''}_${
        guests ? guests[0].lastName : ''
      }_signature.png`,
      contentType: 'image/png',
      contentLength: 8196,
      body: null,
      contents: (sigCanvas?.current?.toDataURL() as string)?.replace('data:image/png;base64,', ''),
      isDocUpload: true,
    };
    const uploadSignature = async () => {
      const checkInToken = await getCheckInToken();
      try {
        const uploadSignatureResponse = await client.query<IPreSignDocUploadApiResponse>({
          query: PRE_SIGN_DOC_UPLOAD,
          context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
          variables: {
            confirmationNumber: reservationInfo?.confirmationId as string,
            body: uploadSignaturePayload,
          },
        });
        guestSignature = uploadSignatureResponse?.data?.preSignDocUpload?.data?.key;
      } catch (uploadSignatureError) {
        const statusCode = processStatusCode(uploadSignatureError as ApolloError);
        statusCode === 403
          ? handleCheckInAuthenticationFailure(uploadSignature)
          : notificationStorage({
              type: FAILURE,
              title: t(ERRORMSG as string),
              description: t('Please proceed to the front desk!'),
            });
      }
    };
    let idDocumentKeys: string[] = [];

    const uploadAllDocuments = async (imagesList: string[]): Promise<string[]> => {
      const checkInToken = await getCheckInToken();
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      const uploadPromises = imagesList.map(async (image, index) => {
        // Extract contentType from base64 string
        const base64PrefixMatch = image.match(/^data:(image\/(png|jpeg|jpg));base64,/);
        const contentType = base64PrefixMatch?.[1];

        // Skip if not an allowed type
        if (!contentType || !allowedTypes.includes(contentType)) {
          console.warn(`Skipping unsupported file type at index ${index}: ${contentType}`);
          return '';
        }

        // Strip correct prefix
        const contents = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        const filename = `${guestReservationInfo?.firstName}_${
          guestReservationInfo?.lastName
        }_id_document_${Date.now()}_${index}.png`;

        const uploadImagePayload: IPreSignDocUploadApiRequest = {
          groupId: hotelInfo?.groupId,
          type: 'reservation_docs',
          propertyType: 'hotels',
          confirmationId: reservationInfo?.confirmationId ?? '',
          filename,
          contentType,
          contentLength: 8196,
          body: null,
          contents,
          isDocUpload: true,
        };

        try {
          const response = await client.query<IPreSignDocUploadApiResponse>({
            query: PRE_SIGN_DOC_UPLOAD,
            context: {
              clientName: 'rest',
              headers: { Authorization: 'Bearer ' + checkInToken },
            },
            variables: {
              confirmationNumber: reservationInfo?.confirmationId as string,
              body: uploadImagePayload,
            },
          });

          return response?.data?.preSignDocUpload?.data?.key || '';
        } catch (error) {
          const statusCode = processStatusCode(error as ApolloError);
          if (statusCode === 403) {
            await handleCheckInAuthenticationFailure(() => uploadAllDocuments(imagesList));
          } else {
            notificationStorage({
              type: FAILURE,
              title: t(ERRORMSG),
              description: t(`Failed to upload image ${index + 1}.`),
            });
          }
          return '';
        }
      });

      const uploadedKeys = await Promise.all(uploadPromises);
      return uploadedKeys.filter((key) => key); // Filter out failures
    };

    await uploadSignature();
    idDocumentKeys = await uploadAllDocuments([...capturedImages]);

    // check-in
    const personalisation =
      personalisationConfig?.type === CMS
        ? personalizationEntities
            ?.map(
              (personalization) =>
                `${personalization?.title} (${Number(Number(personalization?.price)?.toFixed(2))})`,
            )
            ?.join(', ')
        : '';

    if (guestSignature) {
      const checkInPayload: ICheckInApiRequest = {
        skipQueueReservation: config?.skipQueueReservation ? true : false,
        reservationType: reservationInfo?.confirmationType as string,
        reservationId: reservationInfo?.reservationId as string,
        bookingId: reservationInfo?.confirmationId as string,
        checkinDate: dayjs(reservationInfo?.details?.checkInDate as string)?.format(
          timeFormats.YEAR_MONTH_DAY,
        ),
        checkoutDate: dayjs(reservationInfo?.details?.checkOutDate as string)?.format(
          timeFormats.YEAR_MONTH_DAY,
        ),
        roomNo: roomNo as string,
        roomType: reservationInfo?.roomTypes[0]?.shortName as string,
        primaryGuestEmail: guestReservationInfo?.emails as string,
        primaryGuestFirstName: guestReservationInfo?.firstName as string,
        primaryGuestLastName: guestReservationInfo?.lastName as string,
        firstName: guestReservationInfo?.firstName as string,
        lastName: guestReservationInfo?.lastName as string,
        primaryGuestMobileNumber: guestReservationInfo?.phone as string,
        primaryGuestAddress: guestReservationInfo?.addressLine,
        nationality: guestReservationInfo?.nationality,
        profession: guestReservationInfo?.profession,
        guests: accompanyGuestInfo
          ?.concat(updatedGuestData && updatedGuestData)
          ?.map(
            (guest: {
              firstName: string;
              lastName: string;
              emails: string;
              phone: string;
              dob: string;
            }) => ({
              firstName: guest?.firstName,
              lastName: guest?.lastName,
              email: guest?.emails,
              phone: guest?.phone,
              dob: guest?.dob,
            }),
          ),
        guestCount: {
          adult: adult,
          children: children,
        },
        paymentType: paymentConfig?.paymentMethod ?? guestReservationInfo?.paymentType,
        expirationDate: guestReservationInfo?.cardExpiryDate as string,
        cardHolderName:
          guestReservationInfo?.cardHolderName ||
          guestReservationInfo?.firstName + guestReservationInfo?.lastName,
        creditCardType: guestReservationInfo?.cardType,
        lastFourDigits: guestReservationInfo?.cardNumber?.substr(
          guestReservationInfo?.cardNumber?.length - 4,
        ),
        cardNumber: guestReservationInfo?.cardNumber || '',
        cardID: guestReservationInfo?.approvalCode ?? '',
        vaultedCardID: guestReservationInfo?.token,
        settlementType:
          paymentConfig?.settlementType ??
          (config?.pms === INFOR
            ? settlementType?.find((card: any) => card?.type === guestReservationInfo?.cardType)
                ?.code
            : guestReservationInfo?.cardType),
        documentType: guestReservationInfo?.docType
          ? guestReservationInfo?.docType
          : reservationInfo?.guests[0]?.docType,
        documentNumber: guestReservationInfo?.docNo
          ? guestReservationInfo?.docNo
          : reservationInfo?.guests[0]?.docNo,
        issueCountry: guestReservationInfo?.issueCountry
          ? guestReservationInfo?.issueCountry
          : reservationInfo?.guests[0]?.issueCountry,
        channel: 'PWA',
        upsell:
          personalisationConfig?.type === PMS
            ? personalizationEntities?.map((personalization) => ({
                upsellName: personalization?.title,
                revenue: Number(Number(personalization?.price)?.toFixed(2)),
              }))
            : [],
        guestSignature: guestSignature,
        captureDocumentUpload: idDocumentKeys.map((key) => ({
          capturedDocumentFrontImage: key,
          capturedDocumentBackImage: key,
          capturedDocumentType: 'DOCUMENTS', // or dynamic type if needed
        })),
        comment:
          personalisationConfig?.type === CMS
            ? personalizationEntities?.map((personalization) => ({
                upsellName: personalization?.title,
                revenue: Number(Number(personalization?.price)?.toFixed(2)),
              }))
            : '',
        isDoNotMove: true,
        arrivalFlight:
          config?.pms === INFOR
            ? dayjs(guestReservationInfo?.estimatedTime, timeFormats.HOURS_MINUTES)?.format(
                timeFormats?.INFOR_ARRIVAL_DATE,
              )
            : guestReservationInfo?.estimatedTime,
        depositAmount: paymentConfig?.type !== NONE ? String(fetchCharges(reservationInfo)) : '',
        specialInstructions:
          (personalisation ? 'Personalisations: ' + personalisation : '') +
          (specialRequests ? 'Special Request: ' + specialRequests : ''),
        primaryGuestDOB: guestReservationInfo?.dob as string,
        guestType: reservationInfo?.travelAgent?.name as string,
        voucherNumber: (reservationInfo?.packages[0]?.code as string) || '',
        rate: (reservationInfo?.roomTypes[0]?.price as string) || '',
        roomRate: (reservationInfo?.roomTypes[0]?.totalCharge as string) || '',
        country: (guestReservationInfo?.countryCode as string) || '',
        state: guestReservationInfo?.stateProv as string,
        city: guestReservationInfo?.cityName,
        postalCode: guestReservationInfo?.postalCode,
        gender: guestReservationInfo?.gender,
        currencyCode: currency || reservationInfo?.details?.holdAmount?.currency || '',
        group: reservationInfo?.group || '',
        agency: reservationInfo?.agency || '',
        pushEregToOpera: true,
        placeOfStayArrival: guestReservationInfo?.placeOfStayArrival || '',
        placeOfStayDeparture: guestReservationInfo?.placeOfStayDeparture || '',
        skipOCR: IsBiometricsSkippedStatus,
        termsAndConditions:
          (termsAndConditionsValue?.length > 0 &&
            termsAndConditionsValue.map((terms: any, index: number) => {
              const indexKey: any = index?.toString();
              return {
                text: terms?.text,
                isChecked: checkboxStates?.[indexKey] ?? false,
                url: terms?.url || '',
                printInEreg: terms?.printInEreg || false,
                privacyNotes: terms?.privacyNotes,
              };
            })) ||
          [],
        cashierNotes: reservationInfo?.cashierNotes?.join(', ') || '',
        dateOfIssue: guestReservationInfo?.issueDate
          ? guestReservationInfo?.issueDate
          : reservationInfo?.guests[0]?.issueDate || '',
        nights: reservationInfo?.details?.nightCount
          ? reservationInfo?.details?.nightCount.toString()
          : '',
      };
      const checkIn = async () => {
        const checkInToken = await getCheckInToken();
        try {
          await client.query({
            query: preCheckInStatus ? PRECHECKIN : CHECKIN,
            context: { clientName: 'rest', headers: { Authorization: 'Bearer ' + checkInToken } },
            variables: {
              confirmationNumber: reservationInfo?.confirmationId as string,
              body: checkInPayload,
            },
          });

          // EVA integration
          if (checkInModule?.eva && guestReservationInfo?.nationality !== 'SG') {
            const resizeFile = (file: any) =>
              new Promise((resolve) => {
                Resizer.imageFileResizer(
                  file,
                  200,
                  200,
                  'JPEG',
                  100,
                  0,
                  (uri: any) => {
                    resolve(uri);
                  },
                  'base64',
                  200,
                  200,
                );
              });

            const guestImage = await fetch(S3_URL + '/' + guestReservationInfo?.portrait)
              .then((response) => response.blob())
              .then((blob) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                return new Promise((res) => {
                  reader.onloadend = async () => {
                    const resizedImage = await resizeFile(blob);
                    res(resizedImage);
                  };
                });
              });
            const photo = await fetch(S3_URL + '/' + guestReservationInfo?.photo)
              .then((response) => response.blob())
              .then((blob) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                return new Promise((res) => {
                  reader.onloadend = async () => {
                    const resizedImage = await resizeFile(blob);
                    res(resizedImage);
                  };
                });
              });

            const guestDetails = {
              checkin: {
                confirmationNumber: reservationInfo?.confirmationId,
                date: dayjs(reservationInfo?.details?.checkInDate).format('YYYYMMDD'),
                checkoutDate: dayjs(reservationInfo?.details?.checkOutDate).format('YYYYMMDD'),
              },
              guests: [
                {
                  dob: dayjs(guestReservationInfo?.dob)?.format('YYYYMMDD'),
                  firstName: guestReservationInfo?.firstName?.replace(/[0-9]/g, ''),
                  gender: reservationInfo?.guests[0]?.gender?.toLowerCase() == 'female' ? 'F' : 'M',
                  lastName: guestReservationInfo?.lastName?.replace(/[0-9]/g, ''),
                  nationalityCountryCode: Countries?.find(
                    (country) => country?.value === guestReservationInfo?.nationality,
                  )?.evaValue,
                  document: {
                    number: guestReservationInfo?.docNo.replace(/\s/g, ''),
                    images: [
                      {
                        name: 'photo',
                        base64Content: guestImage,
                      },
                      {
                        name: 'scanned',
                        base64Content: photo,
                      },
                      {
                        name: 'cropped',
                        base64Content: photo,
                      },
                    ],
                  },
                },
              ],
            };
            await client.mutate({
              mutation: UPDATE_EVA,
              context: { clientName: 'integration_c' },
              variables: {
                checkin: guestDetails.checkin,
                guests: guestDetails.guests,
                hotelId: getHotelId(),
              },
            });
          }

          saveTrip({
            reservationId: reservationInfo?.confirmationId as string,
            preCheckedIn: preCheckInStatus ? true : false,
            checkedIn: preCheckInStatus ? false : true,
            firstName: guestReservationInfo?.firstName,
            lastName: guestReservationInfo?.lastName,
            email: guestReservationInfo?.emails,
            phoneNumber: guestReservationInfo?.phoneNumber,
            roomNumber: !preCheckInStatus ? roomNo : '',
            invoiceId: reservationInfo?.reservationId as string,
            hotelId: hotelId,
            checkOutDate: dayjs(reservationInfo?.details?.checkOutDate).format(
              timeFormats.DAY_MONTH_YEAR,
            ),
            checkInDate: dayjs(reservationInfo?.details?.checkInDate).format(
              timeFormats.DAY_MONTH_YEAR,
            ),
          });
          checkinStorage({
            reservationId: reservationInfo?.confirmationId as string,
            preCheckedIn: preCheckInStatus ? true : false,
            checkedIn: preCheckInStatus ? false : true,
            firstName: guestReservationInfo?.firstName,
            lastName: guestReservationInfo?.lastName,
            email: guestReservationInfo?.emails,
            phoneNumber: guestReservationInfo?.phoneNumber,
            roomNumber: !preCheckInStatus ? roomNo : '',
            invoiceId: reservationInfo?.reservationId as string,
            currency: reservationInfo?.details?.holdAmount?.currency,
            hotelId: hotelId,
            checkOutDate: dayjs(reservationInfo?.details?.checkOutDate).format(
              timeFormats.DAY_MONTH_YEAR,
            ),
            checkInDate: dayjs(reservationInfo?.details?.checkInDate).format(
              timeFormats.DAY_MONTH_YEAR,
            ),
          });
          notificationStorage({
            type: SUCCESS,
            title: preCheckInStatus
              ? reviewConfig?.preCheckInSuccessfulMessageTitle
                ? reviewConfig?.preCheckInSuccessfulMessageTitle
                : (t('Welcome!') as string)
              : reviewConfig?.checkInSuccessfulMessageTitle
              ? reviewConfig?.checkInSuccessfulMessageTitle
              : (t('Welcome!') as string),
            description: preCheckInStatus
              ? reviewConfig?.checkInSuccessfulMessageDescription
                ? reviewConfig?.checkInSuccessfulMessageDescription
                : (t(
                    'You have pre-registered successfully. Please proceed to the reception to complete your check-in process.',
                  ) as string)
              : (t(
                  'You have checked-in successfully. Please proceed to the hotel lobby to collect your room key.',
                ) as string),
            redirect: availablePaths?.HOME,
            delay: 9000,
            finalFunction: () => {
              reviewSignAndCheckBox({ checkBox: false, sign: null });
            },
          });
          reservationGuestInfoStorageData(null);
          guestInformationStorage(null);
          accompanyGuestDetails(null);
          reservationGuestInfoStorageData(null);
        } catch (checkinError) {
          const statusCode = processStatusCode(checkinError as ApolloError);
          if (statusCode === 403) {
            handleCheckInAuthenticationFailure(checkIn);
          } else {
            const error = checkinError as ApolloError;
            const networkError = error?.networkError as { result?: { errors?: string } };
            notificationStorage({
              type: FAILURE,
              title: t(ERRORMSG as string),
              description: t('Please proceed to the front desk!'),
            });
            if (networkError?.result?.errors === PRE_CHECKIN_ERROR_MSG) {
              notificationStorage({
                type: FAILURE,
                title: t(ERRORMSG as string),
                description: t('You have already completed the pre check-in process.'),
              });
            }
          }
        }
        toggleNotification(true);
        setLoading(false);
      };
      await checkIn();
    }
  }, [
    hotelInfo?.groupId,
    reservationInfo,
    guests,
    personalisationConfig?.type,
    personalizationEntities,
    paymentConfig?.type,
    paymentConfig?.paymentMethod,
    paymentConfig?.settlementType,
    guestReservationInfo?.token,
    guestReservationInfo?.cardNumber,
    guestReservationInfo?.cardExpiryDate,
    guestReservationInfo?.approvalCode,
    guestReservationInfo?.emails,
    guestReservationInfo?.firstName,
    guestReservationInfo?.lastName,
    guestReservationInfo?.phone,
    guestReservationInfo?.addressLine,
    guestReservationInfo?.nationality,
    guestReservationInfo?.profession,
    guestReservationInfo?.paymentType,
    guestReservationInfo?.cardHolderName,
    guestReservationInfo?.cardType,
    guestReservationInfo?.docType,
    guestReservationInfo?.docNo,
    guestReservationInfo?.issueCountry,
    guestReservationInfo?.estimatedTime,
    guestReservationInfo?.dob,
    guestReservationInfo?.countryCode,
    guestReservationInfo?.stateProv,
    guestReservationInfo?.cityName,
    guestReservationInfo?.postalCode,
    guestReservationInfo?.gender,
    guestReservationInfo?.placeOfStayArrival,
    guestReservationInfo?.placeOfStayDeparture,
    guestReservationInfo?.phoneNumber,
    guestReservationInfo?.portrait,
    guestReservationInfo?.photo,
    cardType,
    t,
    config?.skipQueueReservation,
    config?.pms,
    roomNo,
    accompanyGuestInfo,
    updatedGuestData,
    adult,
    children,
    specialRequests,
    currency,
    IsBiometricsSkippedStatus,
    termsAndConditionsValue,
    checkboxStates,
    preCheckInStatus,
    checkInModule?.eva,
    hotelId,
    reviewConfig?.checkInSuccessfulMessageTitle,
    reviewConfig?.checkInSuccessfulMessageDescription,
    capturedImages,
  ]);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const item = draft?.find((el: any) => el?.title === STEPPER_CHECK_IN);
        if (item) {
          item.value = btnStatus ? 100 : 60;
        }
      }),
    );
  }, [btnStatus]);

  const Item: React.FC<any> = ({ title, value }) => {
    return (
      <>
        {value && (
          <div className={styles.itemsColumn}>
            <p className={styles.checkDatesText}>{title}</p>
            <p className={cx(styles.checkDatesDetails, styles.left)}>{value}</p>
          </div>
        )}
      </>
    );
  };

  const ItemFullWidth: React.FC<any> = ({ title, value, code }) => {
    const options = guestInformationSection?.details?.find(
      (detail: any) => detail?.name === code,
    )?.options;

    const isValidDate = (dateString: string) => {
      return /^\d{4}-\d{2}-\d{2}$/.test(dateString) && !isNaN(new Date(dateString).getTime());
    };
    return (
      <>
        {value && (
          <div>
            <p className={styles.checkDatesText}>{title}</p>
            <p className={cx(styles.checkDatesDetails, styles.left)}>
              {options?.length > 0
                ? options?.find(
                    (option: any) =>
                      (code === DOCTYPE ? option?.code : option?.value)?.toLowerCase() ===
                      value?.toLowerCase(),
                  )?.name
                : isValidDate(value)
                ? dayjs(value).format(timeFormats.DAY_MONTH_YEAR_5)
                : value}
            </p>
          </div>
        )}
      </>
    );
  };

  const ShrinkedItem: React.FC<any> = ({ title, value, code }) => {
    const options = guestInformationSection?.details?.find(
      (detail: any) => detail?.name === code,
    )?.options;
    return (
      <>
        {value && (
          <div className={cx(styles.shrinkedText, styles.left)}>
            {title && title}{' '}
            {options?.length > 0
              ? options?.find((option: any) => option?.value === value)?.name
              : value}
          </div>
        )}
      </>
    );
  };

  const toggleStayInformation = () => {
    setStayInformation((prev) => !prev);
  };

  const toggleAccompanyGuestInformation = (index: any) => {
    setAcccompanyGuestInformation((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const toggleCreditCardInformation = () => {
    setCreditCardInformation((prev) => !prev);
  };

  useEffect(() => {
    restoreSignature();
  }, [dayjsLocaleLoader, signature, sigCanvas?.current]);

  const restoreSignature = () => {
    if (signature && sigCanvas?.current) {
      requestAnimationFrame(() => {
        sigCanvas?.current?.clear();
        sigCanvas?.current?.fromData(signature);
      });
    }
  };

  const combinedAccArray = accompanyGuestInfo?.concat(updatedGuestData && updatedGuestData) ?? [];

  const handleCapture = useCallback(async (imageData: string) => {
    setCapturedImages((prev) => {
      if (prev.length >= count) return prev;
      return [...prev, imageData];
    });
    setOpenCamera(false);
    return true;
  }, []);

  const handleCloseCamera = useCallback(() => {
    setOpenCamera(false);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCloseCamera();
    const files = Array.from(e.target.files || []);
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    const invalidFiles = files.filter((file) => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      console.error('Please select different files');
      setInvalidFileSelected(true);
      notificationStorage({
        type: FAILURE,
        title: 'Unsupported File Type',
        description: 'Please upload a PNG, JPEG, or JPG image.',
      });
      toggleNotification(true);

      // reset input so same file can be chosen again
      e.target.value = '';
      return;
    }

    const readerPromises = files
      .filter((file) => allowedTypes.includes(file.type))
      .slice(0, count - capturedImages.length)
      .map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      );

    Promise.all(readerPromises).then((base64Images) => {
      setCapturedImages((prev) => [...prev, ...base64Images].slice(0, count));
      handleCloseCamera();
      e.target.value = '';
    });
  };

  const handleRemoveImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!dynamicFields) {
      setFilteredFields([]);
      setIsRuleEnabled(false);
      return;
    }

    const newFilteredFields = dynamicFields?.filter((field: any) => {
      if (!field?.enabled) return false;
      if (!field?.rule || field?.rule?.length === 0) return true;

      return field.rule.every((rule: any) => {
        const { key, condition, value } = rule;
        let guestValue;

        for (const guest of combinedGuests) {
          if (key in guest) {
            guestValue = guest[key];
            break;
          }
        }

        if (guestValue === undefined) return false;

        switch (condition) {
          case '==':
            return guestValue == value;
          case '>':
            return guestValue > value;
          case '<':
            return guestValue < value;
          case '>=':
            return guestValue >= value;
          case '<=':
            return guestValue <= value;
          case '!=':
            return guestValue != value;
          default:
            return false;
        }
      });
    });

    setFilteredFields(newFilteredFields);
    setIsRuleEnabled(newFilteredFields?.length > 0);
  }, [dynamicFields]);

  const renderDocumentUploads = () => {
    const userAgent = navigator?.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    return filteredFields?.map((field: any, index: any) => (
      <div className={styles.mainContainer} key={index}>
        <DetailsCard
          title={field?.fieldName}
          customTextClassName={
            isRequiredDynamicField && capturedImages?.length > 0 ? '' : styles.isRequired
          }
          customBorderClassName={
            isRequiredDynamicField && capturedImages?.length > 0 ? '' : styles.isRequiredBorder
          }
        >
          <div className={styles.imageText}>
            <p className={styles.containerTitle}>{field?.label}</p>
            {capturedImages.length > 0 && (
              <div className={styles.capturedImageContainer}>
                {capturedImages.map((img, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img src={img} alt={`ID ${index + 1}`} className={styles.capturedImage} />
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(index)}
                      className={styles.removeButton}
                      aria-label='Remove image'
                    >
                      <Remove />
                    </button>
                  </div>
                ))}
                {!(capturedImages.length >= field?.imageCount) &&
                  capturedImages.length >= 1 &&
                  (isIOS ? (
                    <label className={styles.scanDocWrapper}>
                      <AddImage />
                      {t('Add Document')}
                      <input
                        type='file'
                        accept='.jpg,.jpeg,.png'
                        multiple
                        onChange={handleImageUpload}
                        className={styles.fileInput}
                      />
                    </label>
                  ) : (
                    <div className={styles.scanDocWrapper} onClick={() => setOpenCamera(true)}>
                      <AddImage />
                      <span>{t('Add Document')}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          {capturedImages.length >= field?.imageCount - 1 && (
            <p className={styles.containerSubTitle}>
              {capturedImages.length !== field?.imageCount
                ? t(
                    `You can add ${field?.imageCount - capturedImages.length} more image${
                      field?.imageCount - capturedImages.length === 1 ? '' : 's'
                    } `,
                  )
                : t(`Maximum ${capturedImages.length} images reached.`)}
            </p>
          )}
          {!(capturedImages?.length >= field?.imageCount) &&
            capturedImages?.length === 0 &&
            (isIOS ? (
              <StyledButton variant='contained' component='label' className={styles.buttonFile}>
                {t('Add Document')}
                <input
                  type='file'
                  accept='.jpg,.jpeg,.png'
                  multiple
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                />
              </StyledButton>
            ) : (
              <StyledButton
                variant='contained'
                onClick={() => setOpenCamera(true)}
                disabled={capturedImages.length >= field?.imageCount}
                className={styles.buttonStyling}
              >
                <span className={styles.scanDocText}>{t('Add Document')}</span>
              </StyledButton>
            ))}
        </DetailsCard>
      </div>
    ));
  };

  return (
    <>
      <Head>
        <title>
          {config?.name} | {t('Review & Sign')}
        </title>
      </Head>
      <Header displayBackButton screenTitle={t('Review & Sign') as string} language />
      {!dayjsLocaleLoader ? (
        <Loader />
      ) : (
        <PageWrapper className={styles.pageWrapper}>
          <Stepper />
          <div className={styles.titleWrapper}>
            <p className={styles.title}>{t('Review & Sign')}</p>
            <p className={styles.titleDescription}>
              {t(
                'Please review and confirm the below information to complete the Check-In process',
              )}
            </p>
          </div>
          <div onClick={toggleStayInformation}>
            {stayInformation ? (
              <DetailsCard title={t('Stay Information')} icon>
                <div className={styles.stayInformation}>
                  <Item
                    title={t('Check-In Date')}
                    value={dayjs(reservationInfo?.details?.checkInDate).format(
                      timeFormats.DAY_MONTH_YEAR,
                    )}
                  />
                  <Item
                    title={t('Checkout Date')}
                    value={dayjs(reservationInfo?.details?.checkOutDate).format(
                      timeFormats.DAY_MONTH_YEAR,
                    )}
                  />
                  <Item title={t('Booking Id')} value={reservationInfo?.confirmationId} />
                  {reservationInfo?.roomTypes?.length > 0 && (
                    <Item
                      title={t('Room Number')}
                      value={reservationInfo?.roomTypes[0]?.roomNumber}
                    />
                  )}

                  {(reservationInfo?.details?.adultGuestCount ||
                    reservationInfo?.details?.childGuestCount) && (
                    <div className={styles.itemsColumn}>
                      <p className={styles.checkDatesText}>{t('Guests')}</p>
                      <p className={cx(styles.checkDatesDetails, styles.left)}>
                        {reservationInfo?.details?.adultGuestCount > 0 && (
                          <>
                            {reservationInfo?.details?.adultGuestCount}{' '}
                            {reservationInfo?.details?.adultGuestCount === 1
                              ? t('Adult')
                              : t('Adults')}{' '}
                          </>
                        )}{' '}
                        {reservationInfo?.details?.childGuestCount > 0 && (
                          <>
                            {reservationInfo?.details?.childGuestCount}{' '}
                            {reservationInfo?.details?.childGuestCount === 1
                              ? t('Child')
                              : t('Children')}
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {reservationInfo?.roomTypes?.length > 0 &&
                    !reservationInfo?.roomTypes[0]?.suppressRate && (
                      <Item
                        title={t('Rate')}
                        value={`${reservationInfo?.details?.holdAmount?.currency} ${Number(
                          reservationInfo?.roomTypes[0]?.price,
                        )?.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`}
                      />
                    )}

                  {reservationInfo?.roomTypes?.length > 0 && (
                    <ItemFullWidth
                      title={t('Room Type')}
                      value={reservationInfo?.roomTypes[0]?.shortName}
                    />
                  )}
                </div>
              </DetailsCard>
            ) : (
              <DetailsCardShrinked title={t('Stay Information')}>
                <ShrinkedItem
                  title={t('Room No:')}
                  value={reservationInfo?.roomTypes[0]?.roomNumber}
                />
                <ShrinkedItem value={reservationInfo?.roomTypes[0]?.shortName} />
              </DetailsCardShrinked>
            )}
          </div>

          <div onClick={() => setPrimaryGuestInformation((prev) => !prev)}>
            {primaryGuestInformation ? (
              <DetailsCard title={t('Primary Guest Information')} icon>
                <div className={styles.guestInformation}>
                  {guestInformationSection?.details
                    ?.filter((detail: any) => detail?.isActive)
                    ?.map((details: any, index: number) => (
                      <ItemFullWidth
                        key={index}
                        title={t(details?.label)}
                        value={guestReservationInfo?.[details?.name]}
                        code={details?.name}
                      />
                    ))}
                </div>
              </DetailsCard>
            ) : (
              <DetailsCardShrinked title={t('Primary Guest Information')}>
                {guestInformationSection?.details
                  ?.filter((detail: any) => detail?.isActive)
                  ?.slice(0, 4)
                  ?.filter((_: string, index: number) => index !== 1)
                  ?.map((configData: any, index: number) => (
                    <ShrinkedItem
                      key={index}
                      value={guestReservationInfo?.[configData.name]}
                      code={configData?.name}
                    />
                  ))}
              </DetailsCardShrinked>
            )}
            {combinedAccArray?.length > 0 && (
              <p className={styles.titleText}>
                {combinedAccArray?.length === 1
                  ? t('Sharer Information')
                  : t('Sharers Information')}
              </p>
            )}

            {combinedAccArray?.length > 0 &&
              combinedAccArray?.map((accompanyGuest: any, index: number) => (
                <div
                  key={accompanyGuest?.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAccompanyGuestInformation(index);
                  }}
                >
                  {accompanyGuestInformationState[index] ? (
                    <div>
                      <DetailsCard title={`${t('Guest')} ${index + 1}`} icon>
                        <div className={styles.guestInformation}>
                          {accompanyingGuestSubmodule?.details?.map(
                            (details: any, index: number) => (
                              <ItemFullWidth
                                key={index}
                                title={t(details?.label)}
                                value={accompanyGuest?.[details?.name]}
                                code={details?.name}
                              />
                            ),
                          )}
                        </div>
                      </DetailsCard>
                    </div>
                  ) : (
                    <DetailsCardShrinked title={`${t('Guest')} ${index + 1}`}>
                      <ShrinkedItem value={accompanyGuest?.firstName} />
                    </DetailsCardShrinked>
                  )}
                </div>
              ))}

            {paymentConfig?.type !== NONE &&
              (paymentConfig?.isTotalChargeActive
                ? Number(reservationInfo?.roomTypes[0]?.totalCharge) > 0
                : true) && (
                <div onClick={toggleCreditCardInformation}>
                  {creditCardInformation ? (
                    <DetailsCard title={t(`${reviewConfig?.creditCardDetails?.title}`)} icon>
                      <div>
                        {reviewConfig?.creditCardDetails?.details?.map(
                          (detail: any, index: number) => (
                            <div key={index} className={styles.checkDatesColumn}>
                              <p className={styles.checkDatesText}>{t(`${detail?.label}`)}</p>
                              <p className={cx(styles.checkDatesDetails, styles.left)}>
                                {detail?.name === CARD_TYPE
                                  ? cardType
                                  : guestReservationInfo?.[detail?.name] ??
                                    data?.getReservation?.data?.reservePayments[0]?.[
                                      detail?.name
                                    ] ??
                                    ''}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </DetailsCard>
                  ) : (
                    <DetailsCardShrinked title={t(`${reviewConfig?.creditCardDetails?.title}`)}>
                      {reviewConfig?.creditCardDetails?.details?.map(
                        (detail: any, index: number) => (
                          <div key={index} className={styles.checkDatesColumn}>
                            <ShrinkedItem
                              value={
                                detail?.name === 'cardType'
                                  ? cardType
                                  : guestReservationInfo?.[detail?.name] ??
                                    data?.getReservation?.data?.reservePayments[0]?.[
                                      detail?.name
                                    ] ??
                                    ''
                              }
                            />
                          </div>
                        ),
                      )}
                    </DetailsCardShrinked>
                  )}
                </div>
              )}

            {personalizationEntities?.length > 0 && (
              <div className={styles.cardWrapper}>
                <DetailsCard title={t(`${reviewConfig?.personalizationDetails[0]?.title}`)}>
                  <div className={styles.personalzizationWrapper}>
                    <div className={styles.border}></div>
                    {personalizationEntities?.map((personalizationEntity) => (
                      <div key={personalizationEntity?.id} className={styles.personalizationData}>
                        <p className={styles.personalizationText}>
                          {personalizationEntity?.quantity} x {personalizationEntity?.title}
                        </p>
                        <p className={styles.personalizationQuantity}>
                          {personalizationEntity?.currency}{' '}
                          <span className={styles.price}>
                            {formatPrice(
                              Number(personalizationEntity?.price) *
                                Number(personalizationEntity?.quantity),
                            )}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </DetailsCard>
              </div>
            )}

            {upgradeRoomEntities?.length > 0 && (
              <div className={styles.cardWrapper}>
                <DetailsCard title={t(`${reviewConfig?.RoomUpgradeDetails[0]?.title}`)}>
                  <div className={styles.personalzizationWrapper}>
                    <div className={styles.border}></div>
                    {upgradeRoomEntities?.map((personalizationEntity) => (
                      <div key={personalizationEntity?.id} className={styles.personalizationData}>
                        <p className={styles.personalizationText}>{personalizationEntity?.title}</p>
                        <p className={styles.personalizationQuantity}>
                          {personalizationEntity?.currency}{' '}
                          <span className={styles.price}>
                            {formatPrice(Number(personalizationEntity?.price))}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </DetailsCard>
              </div>
            )}

            {config?.isSpecialRequestActive && (
              <StyledInput
                autoComplete='off'
                variant='standard'
                onChange={(e) => {
                  formik.handleChange(e);
                  setSpecialRequests(e.target.value);
                }}
                fullWidth
                multiline
                color='success'
                value={formik.values.instruction}
                className={styles.textInput}
                id='instruction'
                placeholder={`${t('Special Request')}`}
                InputProps={{
                  classes: {
                    underline: styles.customUnderline,
                  },
                  inputProps: {
                    maxLength: 150,
                    style: {
                      font: '14px var(--primary-font-heading)',
                      color: 'var(--tertiary-text-color)',
                    },
                  },
                }}
                error={Boolean(formik.errors.instruction)}
                helperText={formik.errors.instruction ? t(formik.errors.instruction) : null}
              />
            )}
          </div>
          {renderDocumentUploads()}

          {openCamera && (
            <div className={styles.cameraModalOverlay}>
              <div className={styles.cameraModalContent}>
                <CameraCapture
                  openCamera={openCamera}
                  handleCapture={handleCapture}
                  onClose={handleCloseCamera}
                  handleImageUpload={handleImageUpload}
                  t={t}
                />
              </div>
            </div>
          )}

          {DOCUMENT_LIST?.some((document: any) => hotelInfo?.[document.code]?.type) && (
            <div className={styles.agrementWrapper}>
              <div className={styles.checkBoxAlign}>
                <StyledCheckBox
                  onClick={toggleConditionsAccepted}
                  value={conditionsAccepted}
                  checked={conditionsAccepted}
                />
              </div>

              <p className={styles.agrementText}>
                {DOCUMENT_LIST?.some((document) => hotelInfo?.[document.code]?.type) &&
                  t('I have read, understood and agree to the')}{' '}
                {DOCUMENT_LIST?.map((document, index) => {
                  if (hotelInfo?.[document.code]?.type) {
                    return (
                      <React.Fragment key={index}>
                        <Link
                          href={
                            hotelInfo?.[document.code]?.type === WEBURL2
                              ? hotelInfo?.[document.code]?.url
                              : `${ASSETS_URL}/${hotelInfo?.[document.code]?.url}`
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {t(`${document.name}`)}
                        </Link>
                        {index === DOCUMENT_LIST.length - 2
                          ? ` ${t('and')} `
                          : index !== DOCUMENT_LIST.length - 1 && ', '}
                      </React.Fragment>
                    );
                  }
                })}
              </p>
            </div>
          )}
          {termsAndConditionsValue?.length > 0 &&
            termsAndConditionsValue.map((option: any, idx: number) => (
              <div
                key={idx}
                className={styles.agrementWrapper}
                onClick={() => {
                  if (
                    option?.mustView &&
                    option?.policyLink &&
                    !reviewAndSign?.viewed?.includes(idx)
                  ) {
                    toggleCheckbox(idx, true);
                    window.open(option.policyLink, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <div className={styles.checkBoxAlign}>
                  <StyledCheckBox
                    onClick={() => {
                      if (
                        !(
                          option?.mustView &&
                          option?.policyLink &&
                          !reviewAndSign?.viewed?.includes(idx)
                        )
                      ) {
                        toggleCheckbox(idx);
                      }
                    }}
                    value={checkboxStates[idx] || false}
                    checked={checkboxStates[idx] || false}
                  />
                </div>

                <p className={styles.agrementText}>
                  {option?.text}{' '}
                  {option?.policyLink && (
                    <Link href={option?.policyLink} target='_blank' rel='noopener noreferrer'>
                      {t('View')}
                    </Link>
                  )}
                </p>
              </div>
            ))}

          <div className={styles.guestSignatureWrapper}>
            <p className={styles.guestSignature}>{t('Guest Signature')}</p>
            <p className={styles.clearBtn} onClick={clearCanvas}>
              {t('Clear')}
            </p>
          </div>

          <div id='signatureWrapper' className={styles.agrementSignatureWrapper}>
            <SignatureCanvas
              ref={sigCanvas}
              penColor='#3D3C3C'
              canvasProps={{
                height: 100,
                width: signatureWidth,
              }}
              clearOnResize={false}
              onEnd={() => {
                fixSignatureBackground();
                handleSignatureChange();
              }}
            />
          </div>
          <div className={styles.btnWrapper}>
            <StyledButton
              disabled={!btnStatus}
              onClick={goToCheckIn}
              loading={loading}
              variant='contained'
              className={cx(styles.checkInButton)}
            >
              {preCheckInStatus ? t('Pre-Register') : t('Check-In')}
            </StyledButton>
          </div>
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
        ['errors', 'check-in', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default CheckIn;
