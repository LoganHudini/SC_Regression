import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@styles/dining/dining.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { diningInformationStorage } from 'storage/dining.storage';
import { useQuery, useReactiveVar } from '@apollo/client';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import {
  IDiningMenuStorageData,
  diningCategoryStorage,
  diningMenuStorage,
} from 'storage/dining-menu.storage';
import cx from 'classnames';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import {
  filterLiveMenu,
  filterIRDMenuItems,
  irdActiveMenuList,
  uniqueDiningOption,
  getCurrentOpenPeriod,
  convertTo12HourFormat,
} from 'utils/functions';
import { availablePaths } from 'utils/availablePaths';
import { useConfig } from 'utils/hooks/useConfiguration';
import { client } from 'core/graphql/client';
import { ALL_DAY, EVERYDAY, IN_ROOM_DINING } from 'utils/constants';
import { useCheckedIn } from 'storage/check-in.storage';
import {
  IGetRestaurantDetailsResponse,
  GET_RESTAURANT_DETAILS,
} from 'core/graphql/queries/GET_RESTAURTANT_DETAILS';
import { diningOptions, diningHeaders, hotelInfoStorage } from 'storage/home.storage';
import { ASSETS_URL } from 'core/graphql/endpoints';
import { StableImage } from 'components/shared/StableImage/StableImage';
import { Loader } from 'components/shared/Loaders/Loaders';

export { getStaticPaths };

const Menu = () => {
  const { t } = useTranslation('dining');
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelName = useConfig()?.name;
  const config = useConfig();
  const navigate = useLocalizedRouter();
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const filter = useReactiveVar(diningInformationStorage);
  const [openCategory, setOpencategory] = useState(false);
  const [categoryId1, setcategoryId] = useState('');
  const dropdownRef: any = useRef();
  const [scrollTop, setScrollTop] = useState(0);
  const checkInData = useCheckedIn();
  const irdOption = useReactiveVar(diningHeaders);
  const diningOptionSelected = useReactiveVar(diningOptions);
  const hotelInformation = useReactiveVar(hotelInfoStorage);

  const { data: restaurantList, loading } = useQuery<IGetRestaurantDetailsResponse>(
    GET_RESTAURANT_DETAILS,
    {
      skip: !hotelId,
      context: { clientName: 'property_a' },
      fetchPolicy: 'no-cache',
      variables: {
        lang: locale === 'en' ? '' : locale,
        hotelId: hotelId,
      },
    },
  );
  const { data, loading: irdMenuLoading } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    skip: !hotelId,
    context: { clientName: 'property_c' },
    variables: {
      hotelId: hotelId,
      restaurantId: '',
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  if (data) {
    client.writeQuery({
      query: IRD_MENU,
      data,
    });
  }

  const queryResultsData: any = restaurantList?.getRestaurantDetails?.restaurant;

  const uniqueFilteredDiningOptions = uniqueDiningOption(queryResultsData);

  const filteredList = data?.getIRDMenuOutputDetails?.filter(
    (item: any) =>
      item?.isActive &&
      filterLiveMenu(
        item?.hours,
        hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
      ),
  );

  useEffect(() => {
    diningOptions({ type: IN_ROOM_DINING });
    if (uniqueFilteredDiningOptions?.length > 0 && irdOption?.length === 0) {
      diningHeaders(
        checkInData?.checkedIn
          ? [...uniqueFilteredDiningOptions, { type: IN_ROOM_DINING }]
          : uniqueFilteredDiningOptions,
      );
    }
  }, [queryResultsData]);

  const irdMenu: IRDMenuApiResponse = irdActiveMenuList(
    data,
    hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
  );
  const irdActiveMenu: any = filterIRDMenuItems(irdMenu);
  const menuName = irdActiveMenu && irdActiveMenu[0]?.name;
  const menuHours = irdActiveMenu && irdActiveMenu[0]?.hours;
  const [header, setcategoryIdheader] = useState([
    {
      name: menuName,
      hours: menuHours,
    },
  ]);

  useEffect(() => {
    if (irdActiveMenu?.length > 0 && !irdMenuLoading) {
      diningCategoryStorage(irdActiveMenu);
    }
  }, [irdActiveMenu]);

  useEffect(() => {
    if (!checkInData?.checkedIn) {
      navigate(availablePaths?.HOME);
    }
  }, [navigate, t, checkInData?.checkedIn]);

  useEffect(() => {
    if (header[0]?.name == undefined && header[0].hours == undefined) {
      setcategoryIdheader([
        {
          name: menuName,
          hours: menuHours,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuHours, menuName]);

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Dining')}
        </title>
      </Head>

      <PageWrapper className={cx(styles.pageWrapper, {})} displayBottomMenu>
        {irdMenuLoading ? (
          <Loader />
        ) : (
          <>
            <Header className={styles.header} header={header} displayHome />
            <div className={styles.title}>In-Room Dining</div>
            <div className={styles.cardWrapper}>
              {irdActiveMenu?.map((item: any, index: any) => {
                const currentOpenPeriod: any = getCurrentOpenPeriod(item?.hours);

                return (
                  <div
                    key={index}
                    className={styles.carouselSlide}
                    onClick={() => {
                      diningInformationStorage({
                        selectedMenu: item?.id,
                        menuName: item?.name,
                        selectedCategory: item?.categories[0]?.id,
                        categoryName: item?.categories[0]?.name,
                      });
                      navigate(availablePaths?.DINING);
                    }}
                  >
                    <StableImage
                      className={cx(styles.carouselSlideImage, 'globals-carouselSlideImage')}
                      src={`${ASSETS_URL}/${item?.images?.[0]?.master}`}
                    />
                    <div className={styles.itemTitle}>{item?.name}</div>
                    {item?.hours[0]?.day && module && (
                      <p className={styles.itemTime}>
                        {item.hours[0]?.day === EVERYDAY &&
                        item.hours[0]?.open === ALL_DAY &&
                        item.hours[0]?.close === ALL_DAY ? (
                          t('Open 24x7')
                        ) : (
                          <>
                            {/* {t('From')}{' '} */}
                            <span className={styles.timingCase}>
                              {convertTo12HourFormat(
                                currentOpenPeriod?.open || item?.hours[0]?.open,
                              )}{' '}
                              to{' '}
                              {convertTo12HourFormat(
                                currentOpenPeriod?.close || item?.hours[0]?.close,
                              )}
                            </span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
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
        ['errors', 'dining', 'common'],
        i18nConfig,
      )),
    },
  };
};

export default Menu;
