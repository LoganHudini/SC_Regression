import { DiningMenuElement } from 'components/pages/dining/DiningMenuElement/DiningMenuElement';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@styles/dining-menu/dining-menu.module.scss';
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
import { convertTo12HourFormat, irdActiveMenuList } from 'utils/functions';
import { DiningCategoryOptions } from 'components/pages/dining/DiningCategoryOptions/DiningCategoryOptions';
import produce from 'immer';
import { ItemNotFoundLoader, Loader } from 'components/shared/Loaders/Loaders';
import DiningDetailsDrawer from '../DiningDetailsDrawer/DiningDetailsDrawer';
import { useCheckedIn } from 'storage/check-in.storage';
import { useHideOnScroll } from 'utils/hooks/useHideOnScroll';
import { client } from 'core/graphql/client';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useCurrency } from 'utils/hooks/useCurrency';
import { ALLERGENS, TAGS } from 'utils/constants';
import { iconsMap } from 'utils/hamburger/hamburgerIconsMap';

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
  const hideOnScroll = useHideOnScroll();
  const hotelId = useConfig()?.hotelId;
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyHeaderSearch: any = useRef();
  const locale = useLocale();
  const selectedFilter = useReactiveVar(diningInformationStorage);
  const diningData = useReactiveVar(diningMenuStorage) as IDiningMenuStorageData;
  const scrollData = useReactiveVar(scrollState) as IScrollPosition;
  const [scroll, setScroll] = useState(false);
  const [scrollSearch, setScrollSearch] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [irdItemsList, setIrdItemsList] = useState<any[]>([]);
  const [orderDrawer, setOrderDrawer] = useState(false);
  const [scrollHide, setScrollHide] = useState(true);
  const [scrollPosition] = useState(scrollData);
  const currency = useCurrency();

  const data = client.readQuery<IRDMenuApiResponse>({ query: IRD_MENU });

  const { data: myOrders } = useQuery(GET_ORDERS, {
    skip: !hotelId || !checkinData?.reservationId,
    context: { clientName: 'host_v3' },
    variables: {
      hotelId: hotelId,
      bookingId: checkinData?.reservationId,
      lang: locale === 'en' ? '' : locale,
    },
    fetchPolicy: 'no-cache',
  });

  const irdMenu = irdActiveMenuList(data);

  useLayoutEffect(() => {
    const tags: string[] = [];
    const allergens: string[] = [];
    irdMenu?.forEach((irdItem: any) => {
      if (irdItem?.name === selectedFilter?.menuName) {
        irdItem?.categories?.forEach((category: any) =>
          category?.items?.forEach((item: any) => {
            [TAGS, ALLERGENS].forEach((filterOption: string) => {
              if (item?.[filterOption]?.length > 0) {
                item[filterOption].forEach((option: any) => {
                  if (filterOption === TAGS) {
                    tags.push(option?.name);
                  } else {
                    allergens.push(option?.name);
                  }
                });
              }
            });
          }),
        );
        irdItem?.categories?.forEach((categoryItem: any) => {
          if (categoryItem?.items?.length > 0) {
            setIrdItemsList((prevItemsList) => [...prevItemsList, ...categoryItem.items]);
          }
          categoryItem?.subCategories?.forEach((subCategoryItem: any) => {
            if (subCategoryItem?.items?.length > 0) {
              setIrdItemsList((prevItemsList) => [...prevItemsList, ...subCategoryItem.items]);
            }
          });
        });
      }
    });

    setTags([...new Set(tags)]);
    setAllergens([...new Set(allergens)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  const filterItems = (items: any) => {
    return items?.filter((item: any) => {
      return (
        item?.price > 0 &&
        item?.isActive &&
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filteredOptions?.length === 0 ||
          item?.allergens?.some((allergen: any) => filteredOptions?.includes(allergen?.name)) ||
          item?.tags?.some((tag: any) => filteredOptions?.includes(tag?.name)))
      );
    });
  };

  const filteredIrdItemsList = irdItemsList?.length > 0 && filterItems(irdItemsList);

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

  const initialFilter = irdMenu && irdMenu[0];

  const selectedMenu = selectedFilter?.selectedMenu
    ? irdMenu?.find((item: any) => item?.id === selectedFilter?.selectedMenu)
    : initialFilter;

  const ordersData = myOrders?.getOrdersByBookingId;

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, scrollPosition?.scrollY);
    }, 1200);
  }, [scrollPosition?.scrollY]);

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const visibleCategories = entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => {
        const elementId = entry.target?.id.slice(8);
        return selectedMenu?.categories
          ?.filter((item: any) => item?.isActive)
          ?.find((cat: any) => cat.id === elementId);
      })
      .filter(Boolean);

    if (visibleCategories.length > 0) {
      const category = visibleCategories[0];
      diningInformationStorage(
        produce(diningInformationStorage(), (draft: any) => {
          if (draft) {
            draft.selectedCategory = category?.id ?? '';
            draft.categoryName = category?.value ?? '';
          }
        }),
      );
    }
  };

  useEffect(() => {
    if (scrollHide) {
      const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: '-13%',
        threshold: 0.1,
      });

      const categoryElements = document.querySelectorAll('.category-element');
      categoryElements?.forEach((item) => {
        observer.observe(item);
      });

      return () => {
        observer.disconnect();
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
      const addonsTotal = item?.addons?.reduce((acc: any, addon: any) => {
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

  const renderFilterOptions = (items: string[], allergenCheck: boolean) => {
    return items.map((itemName, index) => {
      const IconComponent = iconsMap[itemName.toLowerCase() as keyof typeof iconsMap];
      return (
        <div key={index} className={styles.wrapper}>
          <StyledButton
            className={cx(
              styles.FilterButtonInActive,
              {
                [styles.FilterButtonActive]: filteredOptions.includes(itemName) && !allergenCheck,
              },
              styles.FilterButtonInActive,
              {
                [styles.FilterButtonActiveAllergen]:
                  filteredOptions.includes(itemName) && allergenCheck,
              },
            )}
            onClick={() =>
              setFilteredOptions((prev) =>
                filteredOptions.includes(itemName)
                  ? prev.filter((item) => item !== itemName)
                  : [...prev, itemName],
              )
            }
          >
            {IconComponent && <IconComponent />}
            {itemName}
          </StyledButton>
        </div>
      );
    });
  };

  return (
    <>
      {!data ? (
        <>
          <Loader />
        </>
      ) : (
        <>
          <>
            {ordersData?.length > 0 && !search && (
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
            <div ref={stickyHeaderSearch} className={cx(styles.searchDiv)}>
              <div className={styles.searchWrapper}>
                <div>
                  <p className={styles.searchText}>{t('Search')}</p>
                </div>
                <div
                  className={styles.searchIcon}
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredOptions([]);
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
                        <IconButton
                          onClick={() => {
                            setSearchQuery('');
                            setFilteredOptions([]);
                          }}
                        >
                          <SearchText />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
              {tags?.length > 0 && (
                <div className={styles.buttonWrapper}>{renderFilterOptions(tags, false)}</div>
              )}
              {allergens?.length > 0 && (
                <>
                  <p className={styles.indredient}>Allergens</p>
                  <div className={styles.buttonWrapper}>{renderFilterOptions(allergens, true)}</div>
                </>
              )}
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

          <div ref={scrollRef} className={cx(styles.listContainer)}>
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
            {filteredIrdItemsList?.length === 0 &&
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
      <DiningDetailsDrawer />
    </>
  );
};

export default DiningMenu;
