import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@styles/dining/dining.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { DiningMenuOptions } from 'components/pages/dining/DiningMenuOptions/DiningMenuOptions';
import { diningInformationStorage } from 'storage/dining.storage';
import { useQuery, useReactiveVar } from '@apollo/client';
import { DiningCategorySkeleton } from 'components/pages/dining/DiningCategorySkeleton/DiningCategorySkeleton';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import { IDiningMenuStorageData, diningMenuStorage } from 'storage/dining-menu.storage';
import cx from 'classnames';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import {
  activeModule,
  filterLiveMenu,
  filterIRDMenuItems,
  irdActiveMenuList,
  uniqueDiningOption,
} from 'utils/functions';
import { availablePaths } from 'utils/availablePaths';
import DiningMenu from 'components/pages/dining/DiningMenu/DiningMenu';
import ScrollDown from '@icons/scrollDown.svg';
import { useConfig } from 'utils/hooks/useConfiguration';
import { client } from 'core/graphql/client';
import { IN_ROOM_DINING } from 'utils/constants';
import { useCheckedIn } from 'storage/check-in.storage';
import {
  IGetRestaurantDetailsResponse,
  GET_RESTAURANT_DETAILS,
} from 'core/graphql/queries/GET_RESTAURTANT_DETAILS';
import { diningOptions, diningHeaders } from 'storage/home.storage';
import { isEmpty } from 'lodash';

export { getStaticPaths };

const Dining = () => {
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

  const { data: restaurantList, loading } = useQuery<IGetRestaurantDetailsResponse>(
    GET_RESTAURANT_DETAILS,
    {
      skip: !hotelId,
      context: { clientName: 'host_v0' },
      fetchPolicy: 'no-cache',
      variables: {
        lang: locale === 'en' ? '' : locale,
        hotelId: hotelId,
      },
    },
  );
  const { data, loading: irdMenuLoading } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    skip: !hotelId,
    context: { clientName: 'host_v2' },
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
    (item: any) => item?.isActive && filterLiveMenu(item?.hours),
  );

  const irdModule: any = activeModule(config?.modules, IN_ROOM_DINING);

  useEffect(() => {
    diningOptions({ type: IN_ROOM_DINING });
    if (uniqueFilteredDiningOptions?.length > 0 && irdOption?.length === 0) {
      diningHeaders(
        checkInData?.checkedIn && irdModule
          ? [...uniqueFilteredDiningOptions, { type: IN_ROOM_DINING }]
          : uniqueFilteredDiningOptions,
      );
    }
  }, [queryResultsData]);

  const irdMenu: IRDMenuApiResponse = irdActiveMenuList(data);
  const irdActiveMenu: any = filterIRDMenuItems(irdMenu);
  const menuName = irdActiveMenu && irdActiveMenu[0]?.name;
  const menuHours = irdActiveMenu && irdActiveMenu[0]?.hours;
  const [header, setcategoryIdheader] = useState([
    {
      name: menuName,
      hours: menuHours,
    },
  ]);

  const [search, setsearch] = useState(false);

  useEffect(() => {
    if (
      data?.getIRDMenuOutputDetails?.filter((item: any) => item?.isActive)?.length === 0 ||
      !irdModule ||
      !checkInData?.checkedIn
    ) {
      navigate(availablePaths?.HOME);
    }
  }, [data?.getIRDMenuOutputDetails, navigate, t, irdModule]);

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

  const openSearch = useCallback(() => {
    setsearch(!search);
    setOpencategory(false);
  }, [search]);

  const selectMenu = useCallback(
    (category: string, name: string, hours: any) => {
      setOpencategory(!openCategory);
      setcategoryId(category);
      setcategoryIdheader([{ name: filter?.menuName, hours: hours }]);
      diningInformationStorage({
        menuName: name,
      });
      window.scrollTo(0, 0);
    },
    [filter, openCategory],
  );

  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }
  function enableScroll() {
    document.body.style.overflow = '';
  }

  useEffect(() => {
    if (openCategory) {
      disableScroll();
    } else {
      enableScroll();
    }
  }, [openCategory]);

  const scrollToBottom = () => {
    dropdownRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (typeof window !== 'undefined') {
    document
      ?.getElementById('container')
      ?.addEventListener('scroll', (evt: any) => setScrollTop(evt?.target?.scrollTop));
  }

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Dining')}
        </title>
      </Head>
      <Header
        className={styles.header}
        displaySearchButton
        openCategory={openCategory}
        header={header}
        irdModule
        setOpencategory={setOpencategory}
        onSearchBtnClick={openSearch}
        search
        displayHome
      />
      <PageWrapper
        className={cx(styles.pageWrapper, {
          [styles.pageWrapperSecondary]: diningData?.items?.length > 0,
        })}
        displayBottomMenu
      >
        <div className={styles.wrapper}>
          {irdMenuLoading ? (
            <>
              {irdActiveMenu?.map(() => {
                <DiningCategorySkeleton />;
              })}
            </>
          ) : (
            openCategory && (
              <>
                <div
                  className={styles.backdrop}
                  onClick={() => setOpencategory(!openCategory)}
                ></div>
                <div className={styles.menuDropdown}>
                  <div id='container' className={styles.menuList}>
                    {irdActiveMenu?.map((el: any) => (
                      <div
                        key={el.id}
                        ref={dropdownRef}
                        className={cx(styles.scrollContainer, {
                          [styles.notScrollContainer]: irdActiveMenu?.length < 3,
                        })}
                      >
                        <DiningMenuOptions
                          name={el?.name}
                          image={el.images[0] ? el.images[0].master : null}
                          categoryId={el.id}
                          selectMenu={selectMenu}
                          hours={el.hours}
                        />
                      </div>
                    ))}
                  </div>

                  <div
                    className={cx(styles.bottomScrollIcon, {
                      [styles.removeScroll]: irdActiveMenu?.length < 3,
                    })}
                  >
                    {scrollTop !== 369 && <ScrollDown onClick={scrollToBottom} />}
                  </div>
                </div>
              </>
            )
          )}

          <DiningMenu
            openCategory={openCategory}
            categoryId={categoryId1}
            search={search}
            setsearch={setsearch}
            menuAvailability={filteredList?.length === 0 ? false : true}
          />
        </div>
      </PageWrapper>
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

export default Dining;
