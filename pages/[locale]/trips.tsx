import { TimeFilter } from 'components/pages/upcoming-stays/UpcomingStaysFilter/UpcomingStaysFilter.types';
import { client } from 'core/graphql/client';
import {
  IGetRoomDetailsApiResponse,
  GET_ROOM_DETAILS,
} from 'core/graphql/queries/GET_ROOM_DETAILS';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { getTrips, ISavedTrip } from 'storage/trips.storage';
import { ITripsProps } from 'types/trips.types';
import { UpcomingStay } from 'components/pages/upcoming-stays/UpcomingStay/UpcomingStay';
import { UpcomingStaysFilter } from 'components/pages/upcoming-stays/UpcomingStaysFilter/UpcomingStaysFilter';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import styles from '../../styles/trips/trips.module.scss';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import { IHamburgerProps, getHamburgerProps } from 'utils/hamburger/getHamburgerProps';

export { getStaticPaths };

const UpcomingStays: React.FC<ITripsProps & IHamburgerProps> = ({
  roomDetails,
  hamburger,
  pages,
}) => {
  const navigate = useLocalizedRouter();

  const { t } = useTranslation('trips');

  const [selectedFilter, setSelectedFilter] = useState<TimeFilter | null>(null);
  const [trips, setTrips] = useState<ISavedTrip[]>([]);

  useEffect(() => {
    setTrips(getTrips());
  }, []);

  const findMyBooking = useCallback(() => {
    navigate(availablePaths.GET_RESERVATION);
  }, [navigate]);

  return (
    <>
      <Head>
        <title>{t('Trips')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Trips') as string} />
      <PageWrapper
        displayBottomMenu
        hamburger={hamburger}
        pages={pages}
        className={styles.pageWrapper}
      >
        <div className={styles.upcomingStaysWrapper}>
          <UpcomingStaysFilter
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
          <StyledButton
            className={styles.findMyBookingBtn}
            onClick={findMyBooking}
            variant='outlined'
          >
            {t('FIND MY BOOKING')}
          </StyledButton>

          {(!trips || trips.length === 0) && (
            <p className={styles.noStaysFilter}>
              We could not find any Upcoming Trips.
              <br />
              Use the Find My Booking to add a trip.
            </p>
          )}

          <div className={styles.horizontalLine} />

          {trips.map((trip) => (
            <UpcomingStay
              key={trip.reservationId}
              selectedFilter={selectedFilter}
              roomDetails={roomDetails}
              specialRequests={trip.specialRequests}
              guests={trip.guests}
              reservationId={trip.reservationId}
              personalizationEntities={trip.personalizationEntities}
            />
          ))}
        </div>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  const { data } = await client.query<IGetRoomDetailsApiResponse>({
    query: GET_ROOM_DETAILS,
    context: { clientName: 'host_v0' },
  });

  return {
    props: {
      roomDetails: data,
      ...(await serverSideTranslations(locale as string, ['trips', 'common'], i18nConfig)),
      ...(await getHamburgerProps()),
    },
  };
};

export default UpcomingStays;
