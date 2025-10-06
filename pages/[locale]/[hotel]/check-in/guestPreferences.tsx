import React, { useEffect, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
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
import { STEPPER_PREFERENCES, personalisation } from 'utils/constants';
import { selectedPreferencesDisplayStorage } from 'storage/selected-preferences.storage';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from 'next-i18next.config';
import {
  selectedPreferencesStorage,
  updateSelectedPreferences,
} from 'storage/guestPreferences.storage';

export { getStaticPaths };

const Preferences: React.FC<any> = () => {
  const config = useConfig();
  const { t } = useTranslation('check-in');
  const hotelId = config?.hotelId;
  const locale = useLocale();
  const navigate = useLocalizedRouter();
  const selected = useReactiveVar(selectedPreferencesStorage);
  const [loading, setLoading] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const { data } = useQuery<IGetHotelPreferencesResponse>(GET_HOTEL_PREFERENCES, {
    skip: !hotelId,
    fetchPolicy: 'no-cache',
    context: { clientName: 'property_a' },
    variables: {
      hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  const capitalizeText = (text: string) => {
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const preferences = (data?.getHotelAccommodationDetails?.preferences ?? []).filter(
    (preference: any) => preference.isActive !== false,
  );

  useEffect(() => {
    if (preferencesLoaded || !preferences.length) return;

    const reservationData = client.readQuery<IGetReservationApiResponse>({
      query: GET_RESERVATION,
    });
    const existingPreferences = reservationData?.getReservation?.data?.preferences;

    if (!existingPreferences || existingPreferences.length === 0) {
      setPreferencesLoaded(true);
      return;
    }

    const mappedSelections: Record<string, string[]> = {};

    existingPreferences.forEach((prefGroup: any) => {
      const preferenceType = prefGroup.preferenceType;
      const matchingGroup = preferences.find((pref: any) => pref.code === preferenceType);

      if (matchingGroup) {
        const groupId = matchingGroup.id;
        const selectedItems: string[] = [];

        prefGroup.preference.forEach((item: any, index: number) => {
          const preferenceValue = item.preferenceValue;
          const itemIndex = matchingGroup.preferenceItems.findIndex(
            (pi: any) => pi.code === preferenceValue,
          );

          if (itemIndex !== -1) {
            selectedItems.push(`${preferenceValue}#${itemIndex}`);
          }
        });

        if (selectedItems.length > 0) {
          mappedSelections[groupId] = selectedItems;
        }
      }
    });
    if (Object.keys(mappedSelections).length > 0) {
      const current = selectedPreferencesStorage();
      if (Object.keys(current).length === 0) {
        selectedPreferencesStorage(mappedSelections);
      }
    }

    setPreferencesLoaded(true);
  }, [preferences, preferencesLoaded]);

  const handleSelect = (groupId: string, itemName: string, allowMultiple: boolean) => {
    const current = selectedPreferencesStorage();
    const existing = current[groupId] || [];

    let updated: string[];
    if (allowMultiple) {
      updated = existing.includes(itemName)
        ? existing.filter((name) => name !== itemName)
        : [...existing, itemName];
    } else {
      updated = existing.includes(itemName) ? [] : [itemName];
    }
    updateSelectedPreferences({ ...current, [groupId]: updated });
  };

  const isSelected = (groupId: string, itemName: string) => selected[groupId]?.includes(itemName);

  useEffect(() => {
    const hasSelection = Object.values(selected).some((arr) => (arr?.length ?? 0) > 0);

    StepperInformationStorage(
      produce(StepperInformationStorage(), (draft: any) => {
        const step = draft?.find((el: any) => el?.title === STEPPER_PREFERENCES);
        if (!step) return;

        const target = hasSelection ? 100 : 60;
        if ((step.value ?? 0) < target) {
          step.value = target;
        }
      }),
    );
  }, [selected]);

  useEffect(() => {
    const selectedDisplay = Object.entries(selected)
      .filter(([, values]) => values.length > 0)
      .map(([groupId, values]) => {
        const group = preferences.find((pref: any) => pref.id === groupId);
        const items = values.map((val) => {
          const code = val.split('#')[0];
          const match = group?.preferenceItems?.find((pi: any) => pi.code === code);
          return match?.name ?? code;
        });
        return {
          groupName: group?.name ?? groupId,
          items,
        };
      });

    selectedPreferencesDisplayStorage(selectedDisplay);
  }, [selected, preferences]);

  const hasPersonalization = () => {
    const checkInModule = config?.modules?.find((module: any) => module?.code === 'Check-In');

    if (!checkInModule) {
      return false;
    }

    const personalisationConfig = checkInModule.submodules?.find(
      (submodule: any) => submodule?.name === personalisation && submodule.isActive,
    );

    return !!personalisationConfig;
  };

  const handleSubmit = async () => {
    const hasSelectedPreferences = Object.values(selected).some((items) => items.length > 0);

    if (!hasSelectedPreferences) {
      if (hasPersonalization()) {
        navigate(availablePaths.PERSONALIZE);
      } else {
        navigate(availablePaths.REVIEW);
      }
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

    const stripIdx = (selectionKey: string) => {
      const hashIndex = selectionKey.lastIndexOf('#');
      return hashIndex >= 0 ? selectionKey.slice(0, hashIndex) : selectionKey;
    };

    const payload = {
      bookingId: reservationInfo?.confirmationId,
      reservationId: reservationInfo?.reservationId,
      profileId: reservationInfo?.guests?.[0]?.id,
      preferences: Object.entries(selected)
        .filter(([, keys]) => keys.length > 0)
        .map(([groupId, keys]) => {
          const matchedPref = preferencesList.find((pref: any) => pref.id === groupId);
          return {
            preferenceType: matchedPref?.code ?? groupId,
            preference: Array.from(new Set(keys.map(stripIdx))).map((code) => ({
              preferenceValue: code,
            })),
          };
        }),
    };

    try {
      setLoading(true);
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
          bookingId: payload.bookingId,
          body: payload,
        },
        fetchPolicy: 'no-cache',
      });

      if (hasPersonalization()) {
        navigate(availablePaths.PERSONALIZE);
      } else {
        navigate(availablePaths.REVIEW);
      }
    } catch (error) {
      console.error('Error submitting preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        displayBackButton
        screenTitle='Preferences'
        backRoute={availablePaths.GUEST_VERIFICATION}
      />
      <div className={styles.stepperWrapper}>
        <Stepper />
      </div>
      <PageWrapper>
        <div className={styles.preferencesPageTitle}>{t('Update Your Preferences')}</div>

        {preferences.map((group: any) => (
          <div key={group.id} className={styles.preferenceGroup}>
            <div className={styles.preferenceGroupHeader}>
              <div>{capitalizeText(group.name)}</div>
              <div className={styles.preferenceSelectType}>
                {group.allowMultipleSelection ? 'PICK ANY' : 'PICK ONE'}
              </div>
            </div>
            <div className={styles.preferenceOptions}>
              {group.preferenceItems.map((item: any, idx: any) => {
                const selKey = `${item.code ?? ''}#${idx}`;
                const uniqueKey = `${group.id}:${item.code || item.name}:${idx}`;

                return (
                  <button
                    key={uniqueKey}
                    className={cx(styles.preferenceOption, {
                      [styles.preferenceOptionSelected]: isSelected(group.id, selKey),
                    })}
                    onClick={() => handleSelect(group.id, selKey, group.allowMultipleSelection)}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <p className={styles.preferenceDisclaimer}>
          {t('Special requests are not guaranteed and subject to availability.')}
        </p>

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

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(
        locale as string,
        ['about-your-stay', 'check-in'],
        i18nConfig,
      )),
    },
  };
};

export default Preferences;
