import { useQuery, useReactiveVar } from '@apollo/client';
import { TableNumberDrawer } from 'components/pages/dining/TableNumberDrawer/TableNumberDrawer';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import {
  GET_RESTAURANT_DETAILS,
  IGetRestaurantDetailsResponse,
} from 'core/graphql/queries/GET_RESTAURTANT_DETAILS';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useCallback, useEffect, useState } from 'react';
import {
  RestaurantDetailDrawerStatus,
  restaurantListStorage,
  tableReservationStorage,
} from 'storage/table-reservation.storage';
import { getStaticPaths } from 'utils/getStatic';
import styles from '../../styles/restaurants-bars/restaurants-bars.module.scss';
import { useRouter } from 'next/router';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { useCheckedIn } from 'storage/check-in.storage';
import { useTranslation } from 'react-i18next';
import { getRedirectLink } from 'utils/getRedirectLink';
import { flowPathMap } from 'utils/flowPathMap';
import { availablePaths } from 'utils/availablePaths';
import { diningInformationStorage } from 'storage/dining.storage';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import CuisineIcon from '@icons/cuisine.svg';
import LocationIcon from '@icons/location.svg';
import ForkKnifeIcon from '@icons/forkKnife.svg';
import ClockIcon from '@icons/clockIcon.svg';
import DishIcon from '@icons/dishIcon.svg';
import ArrowButton from '@icons/restaurantArrow.svg';
import { Header } from 'components/shared/Header/Header';
import { DetailPage } from '../../components/shared/RestaurantAndBarDetailDrawer/DetailPageDrawer';
import { diningOptions } from 'storage/home.storage';
import { DINING_OPTIONS, IRD } from 'utils/constants';
import { filterRestaurantList } from 'utils/functions';

export { getStaticPaths };
const ListComponentEntity: React.FC<any> = ({
  queryResultEntity,
  listItems,
  paths,
  selectedRestaurant,
}) => {
  const router = useRouter();
  const navigate = useLocalizedRouter();
  const checkinData = useCheckedIn();
  const { t } = useTranslation(['ui-builder']);
  const [tableNumberDrawer, setTableNumberDrawer] = useState(false);

  const toggleConfirmDrawerOpened = useCallback(() => {
    setTableNumberDrawer((oldState) => !oldState);
  }, [tableNumberDrawer]);

  const linkId = listItems?.find((el: any) => el.hotelModuleId === queryResultEntity.id)?.linkId;
  const redirectUrl = getRedirectLink(paths, linkId);

  const onCtaClick = useCallback(() => {
    selectedRestaurant(queryResultEntity.id);
  }, [navigate, redirectUrl]);

  const time = `${queryResultEntity.hours[0]?.day.slice(0, 3).toLowerCase()}-${queryResultEntity.hours[0]?.open
    }-${queryResultEntity.hours[0]?.close}...`;

  return (
    <div className={styles.listComponent}>
      <StableImage
        className={styles.bannerImage}
        src={
          queryResultEntity?.images[0]
            ? `${ASSETS_URL}/${queryResultEntity?.images[0].ratio16to9}`
            : undefined
        }
        onClick={onCtaClick}
      />
      <div className={styles.contentWrapper}>
        <div className={styles.imageContent} onClick={onCtaClick}>
          {queryResultEntity?.name && (
            <h2 className={styles.listComponentTitle} onClick={onCtaClick}>
              {t(`${queryResultEntity?.name}`)}
            </h2>
          )}
          {queryResultEntity?.primaryCuisine && (
            <div className={styles.cuisineRow}>
              <DishIcon className={styles.cuisineIcon} />
              <span>{queryResultEntity.primaryCuisine.toLowerCase()}</span>
            </div>
          )}{' '}
          {queryResultEntity?.hours && (
            <div className={styles.cuisineRow}>
              <ClockIcon className={styles.cuisineIcon} />
              <span>{time}</span>
            </div>
          )}
          <span className={styles.readMoreButton}>
            {t('Read more')}
            {/* <ArrowButton /> */}
          </span>
        </div>
      </div>

      <TableNumberDrawer
        toggleConfirmDrawerOpened={toggleConfirmDrawerOpened}
        tableNumberDrawer={tableNumberDrawer}
        restId={queryResultEntity?.id}
      />
    </div>
  );
};

const RestaurantAndBars: React.FC = () => {
  const { t } = useTranslation(['ui-builder']);

  const [selectedRestaurantData, setSelectedRestaurantData] = useState<any>();
  const { data } = useQuery<IGetRestaurantDetailsResponse>(GET_RESTAURANT_DETAILS, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
  });

  const diningOptionSelected = useReactiveVar(diningOptions);

  const queryResultsData = data?.getRestaurantDetails?.restaurant;
  restaurantListStorage(queryResultsData?.map((item) => ({ id: item?.id, name: item?.name })));

  const onBackToTop = () => {
    window.scrollTo(0, 0);
  };

  const selectedRestaurant = (id: any) => {
    setSelectedRestaurantData(queryResultsData?.filter((item: any) => item.id === id));
    RestaurantDetailDrawerStatus(true);
  };

  useEffect(() => {
    diningOptionSelected.id === IRD && diningOptions(DINING_OPTIONS[1]);
  }, []);

  const filteredList = filterRestaurantList(queryResultsData, diningOptionSelected);

  return (
    <>
      <Header
        screenTitle={diningOptionSelected?.title ?? (t('Restaurants & Bars') as string)}
        displayHome
      />
      <PageWrapper className={styles.pageWrapper} displayBottomMenu>
        <div>
          {filteredList?.map((queryResultEntity: any) => (
            <ListComponentEntity
              key={queryResultEntity.id}
              queryResultEntity={queryResultEntity}
              selectedRestaurant={selectedRestaurant}
            />
          ))}
        </div>
      </PageWrapper>

      <DetailPage data={selectedRestaurantData} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['dining', 'common'], i18nConfig)),
    },
  };
};
export default RestaurantAndBars;
