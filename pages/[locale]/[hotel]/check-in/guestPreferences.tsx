import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_HOTEL_PREFERENCES,
  IGetHotelPreferencesResponse,
} from 'core/graphql/queries/GET_HOTEL_PREFERENCES';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { Header } from 'components/shared/Header/Header';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';
import styles from 'styles/guestPreferences/guestPreferences.module.scss';
import { useTranslation } from 'react-i18next';
import { client } from 'core/graphql/client';
import { availablePaths } from 'utils/availablePaths';
import { SUBMIT_PREFERENCES } from 'core/graphql/queries/SUBMIT_PREFERENCES';
import { getCheckInToken } from 'core/api/functions/getCheckInAuthentication';
import { GET_RESERVATION, IGetReservationApiResponse } from 'core/graphql/queries/GET_RESERVATION';
import { Stepper } from 'components/shared/Stepper/Stepper';
import { StepperInformationStorage } from 'storage/check-in.storage';
import produce from 'immer';
import { STEPPER_PREFERENCES } from 'utils/constants';

const Preferences = () => {
  const config = useConfig();
  const { t } = useTranslation(['common']);
  const hotelId = config?.hotelId;
  const locale = useLocale();
  const navigate = useLocalizedRouter();
  const [selected, setSelected] = useState<{ [groupId: string]: string[] }>({});
  const [loading, setLoading] = useState(false);

  const { data } = useQuery<IGetHotelPreferencesResponse>(GET_HOTEL_PREFERENCES, {
    skip: !hotelId,
    fetchPolicy: 'no-cache',
    context: { clientName: 'property_a' },
    variables: {
      hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const preferences = (data?.getHotelAccommodationDetails?.preferences ?? []).sort(
    (a, b) => Number(a.allowMultipleSelection) - Number(b.allowMultipleSelection),
  );

  const handleSelect = (groupId: string, itemName: string, allowMultiple: boolean) => {
    setSelected((prev) => {
      const existing = prev[groupId] || [];

      if (allowMultiple) {
        const updated = existing.includes(itemName)
          ? existing.filter((name) => name !== itemName)
          : [...existing, itemName];
        return { ...prev, [groupId]: updated };
      } else {
        const updated = existing.includes(itemName) ? [] : [itemName];
        return { ...prev, [groupId]: updated };
      }
    });
  };

  const isSelected = (groupId: string, itemName: string) => selected[groupId]?.includes(itemName);

  useEffect(() => {
    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const step = draft?.find((el: any) => el?.title === STEPPER_PREFERENCES);
        if (step) {
          step.value = Object.keys(selected).length > 0 ? 100 : 60;
        }
      }),
    );
  }, [selected]);

  const handleSubmit = async () => {
    const hasSelectedPreferences = Object.values(selected).some((items) => items.length > 0);
    if (!hasSelectedPreferences) {
      navigate(availablePaths.REVIEW);
      return;
    }

    const reservationData = client.readQuery<IGetReservationApiResponse>({
      query: GET_RESERVATION,
    });
    const reservationInfo = reservationData?.getReservation?.data;

    if (!reservationInfo?.reservationId || !reservationInfo?.guests?.[0]?.id) {
      return;
    }

    const preferencesList = data?.getHotelAccommodationDetails?.preferences;
    if (!preferencesList) return;

    const payload = {
      bookingId: reservationInfo?.confirmationId,
      reservationId: reservationInfo?.reservationId,
      profileId: reservationInfo?.guests?.[0]?.id,
      preferences: Object.entries(selected).map(([groupId, names]) => {
        const matchedPref = preferencesList.find((pref) => pref.id === groupId);
        return {
          preferenceType: matchedPref?.name || groupId,
          preference: names.map((name) => {
            const matchedItem = matchedPref?.preferenceItems.find((item) => item.name === name);
            return {
              preferenceValue: matchedItem?.name || name,
            };
          }),
        };
      }),
    };

    try {
      const checkInToken = await getCheckInToken();
      const response = await client.query({
        query: SUBMIT_PREFERENCES,
        context: {
          clientName: 'rest',
          headers: { Authorization: 'Bearer ' + checkInToken },
        },
        variables: {
          hotelId: hotelId,
          reservationId: payload.reservationId,
          body: payload,
        },
        fetchPolicy: 'no-cache',
      });

      navigate(availablePaths.REVIEW);
    } catch (error) {
      console.error('Error submitting preferences:', error);
    }
  };

  return (
    <>
      <Header displayBackButton screenTitle='Preferences' />
      <div className={styles.stepperWrapper}>
        <Stepper />
      </div>
      <PageWrapper>
        <div className={styles.preferencesPageTitle}>Update Your Preferences</div>

        {preferences.map((group) => (
          <div key={group.id} className={styles.preferenceGroup}>
            <div className={styles.preferenceGroupHeader}>
              <div>{group.name}</div>
              <div className={styles.preferenceSelectType}>
                {group.allowMultipleSelection ? 'PICK ANY' : 'PICK ONE'}
              </div>
            </div>
            <div className={styles.preferenceOptions}>
              {group.preferenceItems.map((item) => (
                <button
                  key={item.name}
                  className={cx(styles.preferenceOption, {
                    [styles.preferenceOptionSelected]: isSelected(group.id, item.name),
                  })}
                  onClick={() => handleSelect(group.id, item.name, group.allowMultipleSelection)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.bottomMenuWrapper}>
          <StyledButton
            loading={loading}
            className={styles.bottomMenuButton}
            onClick={handleSubmit}
          >
            {t('Next')}
          </StyledButton>
        </div>
      </PageWrapper>
    </>
  );
};

export default Preferences;
