import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../styles/dining/dining.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { DiningMenuOptions } from 'components/pages/dining/DiningMenuOptions/DiningMenuOptions';
import { diningInformationStorage } from 'storage/dining.storage';
import { useQuery, useReactiveVar } from '@apollo/client';
import { DiningCategorySkeleton } from 'components/pages/dining/DiningCategorySkeleton/DiningCategorySkeleton';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import { useRouter } from 'next/router';
import { IDiningMenuStorageData, diningMenuStorage } from 'storage/dining-menu.storage';
import cx from 'classnames';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { filterLiveMenu, irdActiveMenuList } from 'utils/functions';
import { availablePaths } from 'utils/availablePaths';
import DiningMenu from 'components/pages/dining/DiningMenu/DiningMenu';

export { getStaticPaths };

const Dining = () => {
  const { t } = useTranslation('dining');
  const router = useRouter();
  const locale = useLocale();
  const navigate = useLocalizedRouter();
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const filter = useReactiveVar(diningInformationStorage);
  const [openCategory, setOpencategory] = useState(false);
  const [categoryId1, setcategoryId] = useState('');
  const restaurantId =
    (typeof window !== 'undefined' &&
      localStorage.getItem('restaurantId') &&
      JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
    '';
  const { data, loading: irdMenuLoading } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    context: { clientName: 'host_v2' },
    variables: {
      restaurantId: restaurantId,
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const filteredList = data?.getIRDMenuOutputDetails?.filter(
    (item: any) => item?.isActive && filterLiveMenu(item?.hours),
  );

  const irdActiveMenu = irdActiveMenuList(data);
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
    if (data?.getIRDMenuOutputDetails?.filter((item: any) => item?.isActive)?.length === 0) {
      navigate(availablePaths?.HOME);
    }
  }, [data?.getIRDMenuOutputDetails, navigate, t]);

  useEffect(() => {
    if (!!router?.query['tableNo'] || !!router?.query['restId']) {
      localStorage.setItem('tableNumber', JSON.stringify(router.query['tableNo']) ?? '');
      localStorage.setItem('restaurantId', JSON.stringify(router.query['restId']) ?? '');
    }
  }, [router.query]);

  useEffect(() => {
    if (header[0]?.name == undefined && header[0].hours == undefined) {
      setcategoryIdheader([
        {
          name: menuName,
          hours: menuHours,
        },
      ]);
    }
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

  return (
    <>
      <Head>
        <title>{t('Dining')}</title>
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
                  <div className={styles.menuList}>
                    {irdActiveMenu?.map((el: any) => (
                      <DiningMenuOptions
                        key={el.id}
                        name={el?.name}
                        image={el.images[0] ? el.images[0].master : null}
                        categoryId={el.id}
                        selectMenu={selectMenu}
                        hours={el.hours}
                      />
                    ))}
                  </div>
                  {/* <div className={styles.close} onClick={() => setOpencategory(!openCategory)}>
                    <CrossDropdown />
                  </div> */}
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
