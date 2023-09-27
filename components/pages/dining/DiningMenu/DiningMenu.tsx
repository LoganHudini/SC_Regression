import { DiningMenuElement } from 'components/pages/dining/DiningMenuElement/DiningMenuElement';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../../../styles/dining-menu/dining-menu.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { IRDMenuApiResponse, IRD_MENU } from 'core/graphql/queries/IRD_MENU';
import { useQuery, useReactiveVar } from '@apollo/client';
import { diningInformationStorage } from 'storage/dining.storage';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { availablePaths } from 'utils/availablePaths';
import cx from 'classnames';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import {
  diningMenuStorage,
  IDiningMenuStorageData,
  IScrollPosition,
  scrollState,
} from 'storage/dining-menu.storage';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchClose from '@icons/search_close.svg';
import SearchText from '@icons/search_text_delete.svg';
import { DiningOrders } from 'components/pages/dining/DiningOrders/DiningOrders';
import { DiningOrdersDrawer } from 'components/pages/dining/DiningOrdersDrawer/DiningOrdersDrawer';
import { GET_ORDERS } from 'core/graphql/queries/GET_ORDERS_BY_ID';
import { GET_F_AND_B_ORDER } from 'core/graphql/queries/GET_F_AND_B_ORDER';
import {
  FandBOrders,
  convertTo12HourFormat,
  irdActiveMenuList,
  setScrollPosition,
} from 'utils/functions';
import { DiningCategoryOptions } from 'components/pages/dining/DiningCategoryOptions/DiningCategoryOptions';
import produce from 'immer';
import { ItemNotFoundLoader, Loader } from 'components/shared/Loaders/Loaders';
import DiningDetailsDrawer from '../DiningDetailsDrawer/DiningDetailsDrawer';
import { useCheckedIn } from 'storage/check-in.storage';

export { getStaticPaths };
interface DiningMenuProps {
  categoryId: string;
  search?: any;
  setsearch?: any;
  openCategory?: boolean;
  menuAvailability?: boolean;
}
const DiningMenu: React.FC<DiningMenuProps> = ({
  search,
  setsearch,
  openCategory,
  menuAvailability,
}) => {
  const { t } = useTranslation('dining');
  const navigate = useLocalizedRouter();
  const checkinData = useCheckedIn();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyHeaderSearch: any = useRef();
  const locale = useLocale();
  const selectedFilter = useReactiveVar(diningInformationStorage);
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const scrollData = useReactiveVar(scrollState) as IScrollPosition;
  const restaurantId =
    (typeof window !== 'undefined' &&
      localStorage.getItem('restaurantId') &&
      JSON.parse(localStorage.getItem('restaurantId') ?? '')) ??
    '';
  const tableNumber =
    (typeof window !== 'undefined' &&
      localStorage.getItem('tableNumber') &&
      JSON.parse(localStorage.getItem('tableNumber') ?? '')) ??
    '';
  const [scroll, setScroll] = useState(false);
  const [scrollSearch, setScrollSearch] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderDrawer, setOrderDrawer] = useState(false);
  const [scrollHide, setScrollHide] = useState(true);
  const [scrollPosition] = useState(scrollData);
  const FanbOrders = FandBOrders();

  const { data, loading } = useQuery<IRDMenuApiResponse>(IRD_MENU, {
    context: { clientName: 'host_v2' },
    variables: {
      restaurantId: restaurantId,
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const { data: myOrders } = useQuery(GET_ORDERS, {
    context: { clientName: 'host_v3' },
    variables: {
      bookingId: checkinData?.reservationId,
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const { data: FAndBOrder } = useQuery(GET_F_AND_B_ORDER, {
    context: { clientName: 'host_v5' },
    variables: {
      restaurantId: restaurantId,
      tableNumber: tableNumber || '0',
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const irdMenu = irdActiveMenuList(data);

  const currentTime = new Date().getHours();
  const hoursDifference =
    irdMenu &&
    irdMenu
      ?.map((item: any) => parseInt(item?.hours[0]?.open) - currentTime)
      ?.map((item: any) => (item > 0 ? item : 24));

  const menuStartingTime =
    irdMenu &&
    hoursDifference &&
    convertTo12HourFormat(
      irdMenu[hoursDifference?.indexOf(Math.min(...hoursDifference))]?.hours[0]?.open || '00:00',
    );

  let irdItemsList: any = [];
  irdMenu?.forEach((irdItem: any) =>
    irdItem?.categories?.forEach((categoryItem: any) => {
      categoryItem?.items?.length > 0 && (irdItemsList = [...irdItemsList, ...categoryItem.items]);
      categoryItem?.subCategories?.forEach((subCategoryItem: any) => {
        subCategoryItem?.items?.length > 0 &&
          (irdItemsList = [...irdItemsList, ...subCategoryItem.items]);
      });
    }),
  );

  const initialFilter = irdMenu && irdMenu[0];

  const selectedMenu = selectedFilter?.selectedMenu
    ? irdMenu?.find((item: any) => item?.id === selectedFilter?.selectedMenu)
    : initialFilter;

  const ordersData = restaurantId
    ? FAndBOrder?.getFAndBOrderDetails?.orders?.filter((item: any) =>
        FanbOrders?.includes(item?.id),
      )
    : myOrders?.getOrdersByBookingId;

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, scrollPosition?.scrollY);
    }, 1200);
  }, [scrollPosition?.scrollY]);

  // Dynamically change category status while scrolling
  useEffect(() => {
    if (scrollHide) {
      const handleScroll = () => {
        const categoryElements = document.querySelectorAll('.category-element');
        categoryElements?.forEach((item: any) => {
          const element = item as HTMLElement;
          const { top, bottom } = element.getBoundingClientRect();
          const elementId = element?.id.slice(8);
          setScrollPosition(0, window.scrollY);
          if (top <= 170 && bottom >= 0) {
            const category = selectedMenu?.categories
              ?.filter((item: any) => item?.isActive)
              ?.find((cat: any) => cat.id === elementId);
            if (category) {
              diningInformationStorage(
                produce(diningInformationStorage(), (draft) => {
                  if (draft) {
                    draft.selectedCategory = category?.id ?? '';
                    draft.categoryName = category?.value ?? '';
                  }
                }),
              );
            }
          }
        });
      };
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollHide, selectedMenu?.categories]);

  useLayoutEffect(() => {
    const top = stickyHeaderSearch?.current?.offsetTop;
    const fixedHeader = () => {
      if (window?.scrollY > top) {
        setScrollSearch(true);
      } else {
        setScrollSearch(false);
      }
    };
    window.addEventListener('scroll', fixedHeader);
  }, [stickyHeaderSearch?.current?.offsetTop]);

  useEffect(() => {
    diningInformationStorage({
      selectedMenu: selectedFilter?.selectedMenu || selectedMenu?.id,
      menuName: selectedFilter?.menuName || selectedMenu?.name,
      selectedCategory: selectedFilter?.selectedCategory || selectedMenu?.categories[0]?.id,
      categoryName: selectedFilter?.categoryName || selectedMenu?.categories[0]?.name,
    });
  }, [
    selectedFilter?.categoryName,
    selectedFilter?.menuName,
    selectedFilter?.selectedCategory,
    selectedFilter?.selectedMenu,
    selectedMenu?.categories,
    selectedMenu?.id,
    selectedMenu?.name,
  ]);

  useEffect(() => {
    const totalAmount = diningData?.items?.reduce((allTotal, item) => {
      const addonsTotal = item?.addons?.reduce((acc, addon) => {
        return acc + addon.price * item.quantity;
      }, 0);

      return allTotal + (item.quantity * item.price + (addonsTotal ?? 0));
    }, 0);
    setTotalAmount(totalAmount);
  }, [diningData?.items]);

  useEffect(() => {
    if (openCategory) {
      disableScroll();
    } else {
      enableScroll();
    }
  }, [search, openCategory]);

  const filterItems = (items: any) => {
    return items?.filter(
      (item: any) =>
        item?.price > 0 &&
        item?.isActive &&
        item?.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  irdItemsList = filterItems(irdItemsList);

  const renderMenuElements = (items: any[]) => {
    return (
      <>
        {items?.length > 0 &&
          items?.map((el, index) => (
            <React.Fragment key={el?.id}>
              <DiningMenuElement
                key={el?.id}
                id={el?.id}
                title={el?.name}
                image={el?.images[0]?.ratio1to1 || null}
                description={el?.description}
                price={el?.price}
                customisation={el?.customisation}
                index={index}
                code={el?.code}
                addons={el?.addons}
                menuAvailability={menuAvailability}
              />
            </React.Fragment>
          ))}
      </>
    );
  };

  const renderCategory = (category: any) => {
    const categoryItems = filterItems(category?.items);
    return (
      <div id={`Category${category?.id}`} className='category-element' key={category?.id}>
        {categoryItems?.length > 0 && (
          <h2 className={styles.subCategoriesText}>{category?.name}</h2>
        )}
        {renderMenuElements(categoryItems)}
        {category?.subCategories
          ?.filter((item: any) => item?.isActive)
          ?.map((subCategory: any) => {
            const subCategoryItems = filterItems(subCategory?.items);
            return (
              <div key={subCategory?.id}>
                {subCategoryItems?.length !== 0 && (
                  <h2 className={styles.subCategoriesText}>
                    {category?.name} - {subCategory?.name}
                  </h2>
                )}
                {renderMenuElements(subCategoryItems)}
              </div>
            );
          })}
      </div>
    );
  };

  const openOrdersDrawer = () => {
    setOrderDrawer(true);
  };

  const closeOrdersDrawer = () => {
    setOrderDrawer(false);
  };

  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  function enableScroll() {
    document.body.style.overflow = '';
  }

  const confirmOrder = useCallback(() => {
    navigate(availablePaths.DINING_ORDER_SUMMARY);
  }, [navigate]);

  return (
    <>
      {loading ? (
        <>
          <Loader />
        </>
      ) : (
        <>
          <>
            {ordersData?.length > 0 && (
              <>
                <DiningOrders openOrdersDrawer={openOrdersDrawer} ordersData={ordersData} />
                <DiningOrdersDrawer
                  ordersDrawer={orderDrawer}
                  ordersData={ordersData}
                  closeOrdersDrawer={closeOrdersDrawer}
                />
              </>
            )}
          </>
          {search ? (
            <div
              ref={stickyHeaderSearch}
              className={cx(
                styles.searchDiv,
                {
                  [styles.searchDivSecondary]: (ordersData ?? [])?.length > 0 ? true : false,
                },
                {
                  [styles.searchDivScroll]: scrollSearch,
                },
              )}
            >
              <div className={styles.searchWrapper}>
                <div>
                  <p className={styles.searchText}>{t('Search')}</p>
                </div>
                <div
                  className={styles.searchIcon}
                  onClick={() => {
                    setSearchQuery('');
                    setsearch(false);
                  }}
                >
                  <SearchClose />
                </div>
              </div>

              <TextField
                autoFocus
                size='small'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                placeholder={`${t('Search for items')}`}
                sx={{
                  '& fieldset': {
                    borderRadius: '50px',
                    border: '1px solid var(--primary-theme-color) !important',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='start'>
                      {searchQuery && (
                        <IconButton onClick={() => setSearchQuery('')}>
                          <SearchText />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          ) : (
            <DiningCategoryOptions
              categories={selectedMenu?.categories?.filter((item: any) => item?.isActive)}
              ordersData={ordersData}
              scroll={scroll}
              setScroll={setScroll}
              setScrollHide={setScrollHide}
            />
          )}

          <div
            ref={scrollRef}
            className={cx(
              styles.listContainer,
              {
                [styles.listContainerSearchScroll]: search && scrollSearch,
              },
              {
                [styles.listContainerScroll]: !search && scroll,
              },
            )}
          >
            {!menuAvailability &&
              data?.getIRDMenuOutputDetails?.filter((item: any) => item?.isActive)?.length !==
                0 && (
                <div className={styles.menuUnavailableContainer}>
                  <div className={styles.menuTimingsText}>
                    {t('Online requests will be available from')} {menuStartingTime}
                  </div>
                  <div className={styles.menuUnavailableDescription}>
                    {t(
                      'There are no menus available right now! You can still check out the upcoming menu items in the list below.',
                    )}
                  </div>
                </div>
              )}
            {data?.getIRDMenuOutputDetails?.filter((item: any) => item?.isActive)?.length === 0 && (
              <div className={styles.menuUnavailableContainer}>
                <div className={styles.menuUnavailableTitle}>
                  {t('Online requests presently unavailable')}
                </div>
                <div className={styles.menuUnavailableDescription}>
                  {t('There are no menus available right now!')}
                </div>
              </div>
            )}
            {irdItemsList?.length === 0 &&
              data?.getIRDMenuOutputDetails?.filter((item: any) => item?.isActive)?.length !==
                0 && (
                <div className={styles.noItems}>
                  <ItemNotFoundLoader />
                  <div className={styles.noItemsText}>{t('Oops, Item Not Found')}</div>
                  <div>{t('Try rewording your search or entering a new keyword.')}</div>
                </div>
              )}
            {selectedMenu?.categories
              ?.filter((item: any) => item?.isActive)
              ?.map((category: any) => renderCategory(category))}
          </div>
        </>
      )}

      {diningData?.items?.length > 0 && totalAmount !== 0 && !search && (
        <div className={styles.totalWrapper}>
          {/* <div className={styles.totalRow}>
              <p className={styles.totalText}>{t('Total')}</p>
              <p className={styles.totalPrice}>
                {CURRENCY} <span className={styles.currencyValue}>{totalAmount?.toFixed(2)}</span>
              </p>
            </div> */}
          <StyledButton count={diningData.items.length} onClick={confirmOrder}>
            {t('cart')}
          </StyledButton>
        </div>
      )}
      <DiningDetailsDrawer />
    </>
  );
};

export default DiningMenu;
