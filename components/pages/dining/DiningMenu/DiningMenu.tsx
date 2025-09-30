import { DiningMenuElement } from 'components/pages/dining/DiningMenuElement/DiningMenuElement';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@styles/dining-menu/dining-menu.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { IRDMenuApiResponse } from 'core/graphql/queries/IRD_MENU';
import { useQuery, useReactiveVar } from '@apollo/client';
import { diningInformationStorage, irdMenuOutputDetailsStorage } from 'storage/dining.storage';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
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
import {
  convertTo12HourFormat,
  filterIRDMenuItems,
  filterLiveMenu,
  findModule,
  irdActiveMenuList,
  isIRDOpenNow,
} from 'utils/functions';
import { DiningCategoryOptions } from 'components/pages/dining/DiningCategoryOptions/DiningCategoryOptions';
import produce from 'immer';
import { ItemNotFoundLoader, Loader } from 'components/shared/Loaders/Loaders';
import DiningDetailsDrawer from '../DiningDetailsDrawer/DiningDetailsDrawer';
import { useCheckedIn } from 'storage/check-in.storage';
import { useHideOnScroll } from 'utils/hooks/useHideOnScroll';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useCurrency } from 'utils/hooks/useCurrency';
import { ALLERGENS, CHEF_TAG_NAME, IN_ROOM_DINING, TAGS } from 'utils/constants';
import { iconsMap } from 'utils/hamburger/hamburgerIconsMap';
import { hotelInfoStorage } from 'storage/home.storage';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import Viewless from '@icons/viewLessIconIrd.svg';
import ViewAll from '@icons/viewAllIconIrd.svg';
import dayjs from 'dayjs';

export { getStaticPaths };
interface DiningMenuProps {
  categoryId: string;
  search?: any;
  setsearch?: any;
  openCategory?: boolean;
  setFilterDrawer?: any;
  filterDrawer?: any;
  appliedFilter?: any;
  setAppliedFilter?: any;
  setTags?: any;
  setAllergens?: any;
  tags?: any;
  allergens?: any;
}
const DiningMenu: React.FC<DiningMenuProps> = ({
  search,
  setsearch,
  openCategory,
  filterDrawer,
  setFilterDrawer,
  appliedFilter,
  setAppliedFilter,
  setTags,
  setAllergens,
  tags,
  allergens,
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
  useEffect(() => {
    setsearch(false);
    setSearchQuery('');
  }, [selectedFilter?.selectedMenu]);
  const [filteredOptions, setFilteredOptions] = useState<any>(
    appliedFilter || {
      allergen: [],
      tag: [],
    },
  );

  const [irdItemsList, setIrdItemsList] = useState<any[]>([]);
  const [orderDrawer, setOrderDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const hotelInformation = useReactiveVar(hotelInfoStorage);

  const [scrollHide, setScrollHide] = useState(true);
  const [scrollPosition] = useState(scrollData);
  const currency = useCurrency();
  const [backToTopClicked, setBackToTopClicked] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const config = useConfig();
  const irdModuleContent: any = findModule(config?.modules, IN_ROOM_DINING);

  const isIRDv2 = irdModuleContent?.version === 'v2';
  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
    }, 1500);
  }, []);

  const data = useReactiveVar(irdMenuOutputDetailsStorage) as IRDMenuApiResponse;
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

  const irdMenu = irdActiveMenuList(
    data,
    hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
  );

  useEffect(() => {
    setAppliedFilter({
      allergen: [],
      tag: [],
    });
    setFilteredOptions({
      allergen: [],
      tag: [],
    });
  }, [selectedFilter?.selectedMenu]);

  useLayoutEffect(() => {
    const tags: string[] = [];
    const allergens: string[] = [];
    irdMenu?.forEach((irdItem: any) => {
      if (irdItem?.name === selectedFilter?.menuName) {
        irdItem?.categories?.forEach((category: any) => {
          if (!category?.isActive) return;
          category?.items?.forEach((item: any) => {
            if (item?.isActive) {
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
            }
          });

          category?.subCategories?.forEach((subcategory: any) => {
            if (!subcategory?.isActive) return;
            subcategory?.items?.forEach((item: any) => {
              if (item?.isActive) {
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
              }
            });
          });
        });

        irdItem?.categories?.forEach((categoryItem: any) => {
          if (!categoryItem?.isActive) return;
          if (categoryItem?.items?.length > 0) {
            setIrdItemsList((prevItemsList) => [...prevItemsList, ...categoryItem.items]);
          }
          categoryItem?.subCategories?.forEach((subCategoryItem: any) => {
            if (!subCategoryItem?.isActive) return;

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
      const basicConditions =
        item?.price >= 0 &&
        item?.isActive &&
        item?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!basicConditions) return false;

      if (appliedFilter?.allergen?.length === 0 && appliedFilter?.tag?.length === 0) {
        return true;
      }

      let tagMatch = true;
      if (appliedFilter?.tag?.length > 0) {
        tagMatch = item?.tags?.some((tag: any) => appliedFilter.tag.includes(tag?.name));
      }

      let allergenMatch = true;
      if (appliedFilter?.allergen?.length > 0) {
        allergenMatch = !item?.allergens?.some((allergen: any) =>
          appliedFilter.allergen.includes(allergen?.name),
        );
      }

      return tagMatch && allergenMatch;
    });
  };

  const filteredIrdItemsList = irdItemsList?.length > 0 && filterItems(irdItemsList);

  const currentTime = new Date().getHours();

  const initialFilter = irdMenu && filterIRDMenuItems(irdMenu)?.[0];

  const CHEF_SPECIAL_CATEGORY = {
    id: 'chefSpecialCategoryId',
    // eslint-disable-next-line quotes
    name: "Chef's Special",
    isActive: true,
    images: [],
    subCategories: null,
    hours: {
      allTime: true,
      everyday: false,
      timings: [
        {
          day: 'EVERYDAY',
          from: 'all day',
          to: 'all day',
        },
      ],
    },
  };

  const baseSelectedMenu = selectedFilter?.selectedMenu
    ? irdMenu?.find((item: any) => item?.id === selectedFilter?.selectedMenu)
    : initialFilter;

  const extractChefsSpecialCategory = (selectedMenu: any) => {
    if (!selectedMenu?.categories) return selectedMenu;

    const chefSpecialItems: any = [];

    const updatedCategories = selectedMenu.categories.map((category: any) => {
      const filteredItems =
        category.items?.filter((item: any) => {
          const isChefSpecial = item.tags?.some((tag: any) => tag.name === CHEF_TAG_NAME);
          if (isChefSpecial && isIRDv2) chefSpecialItems.push(item);
          return !isChefSpecial;
        }) || [];

      const filteredSubCategories =
        category.subCategories?.map((sub: any) => ({
          ...sub,
          items:
            sub.items?.filter((item: any) => {
              const isChefSpecial = item.tags?.some((tag: any) => tag.name === CHEF_TAG_NAME);
              if (isChefSpecial && isIRDv2) chefSpecialItems.push(item);
              return !isChefSpecial;
            }) || [],
        })) || null;

      return {
        ...category,
        items: filteredItems,
        subCategories: filteredSubCategories,
      };
    });

    if (chefSpecialItems.length === 0) {
      return {
        ...selectedMenu,
        categories: updatedCategories,
      };
    }

    const chefsSpecialCategory = {
      ...CHEF_SPECIAL_CATEGORY,
      items: chefSpecialItems,
    };

    return {
      ...selectedMenu,
      categories: [chefsSpecialCategory, ...updatedCategories],
    };
  };

  const selectedMenu =
    baseSelectedMenu &&
    (isIRDv2 ? extractChefsSpecialCategory(baseSelectedMenu) : baseSelectedMenu);

  const menuAvailability = filterLiveMenu(
    baseSelectedMenu?.hours,
    hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
  );

  const menuStartingTime =
    irdMenu && convertTo12HourFormat(baseSelectedMenu?.hours[0]?.open || '00:00');

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
        rootMargin: '-15%',
        threshold: 1,
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
    if (!selectedMenu?.id) return;

    const activeCategories = selectedMenu.categories?.filter((item: any) => item?.isActive) || [];
    if (!activeCategories.length) return;

    const chefSpecialCategory = activeCategories.find(
      // eslint-disable-next-line quotes
      (cat: { name: string }) => cat.name === "Chef's Special",
    );

    const shouldUseChefSpecial = isInitialLoad && chefSpecialCategory;
    const defaultCategory = chefSpecialCategory || activeCategories[0];

    const selectedCategory = shouldUseChefSpecial
      ? chefSpecialCategory.id
      : selectedFilter?.selectedCategory || defaultCategory.id;

    const categoryName = shouldUseChefSpecial
      ? chefSpecialCategory.name
      : selectedFilter?.categoryName || defaultCategory.name;

    const currentStorage = diningInformationStorage();
    const newStorage = {
      selectedMenu: selectedFilter?.selectedMenu || selectedMenu.id,
      menuName: selectedFilter?.menuName || selectedMenu.name,
      selectedCategory,
      categoryName,
    };

    if (JSON.stringify(currentStorage) !== JSON.stringify(newStorage)) {
      diningInformationStorage(newStorage);
    }

    if (shouldUseChefSpecial) {
      setIsInitialLoad(false);
    }
  }, [selectedMenu?.id, selectedMenu?.name, isInitialLoad]);

  useEffect(() => {
    const totalAmount = diningData?.items?.reduce((allTotal, item) => {
      const addonsTotal = item?.addons?.reduce((acc: any, addon: any) => {
        return acc + addon.priceInDecimal * item.quantity;
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

  const baseSelectedCat = selectedFilter?.selectedCategory
    ? selectedMenu?.categories?.find((item: any) => item?.id === diningData?.selectedCategoryId)
    : initialFilter;

  const catAvailabilityDisable = isIRDOpenNow(
    baseSelectedCat?.hours?.timings,
    hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
  );

  const renderMenuElements = (
    items: any[],
    categoryName: string,
    catAvailability?: any,
    categoryId?: any,
  ) => {
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
                customisation={
                  el?.customisation || el?.groupedAddon?.length > 0 || el?.addons?.length > 0
                }
                index={index}
                code={el?.code}
                addons={el?.addons}
                menuAvailability={menuAvailability ? catAvailability : menuAvailability}
                ingredients={el?.ingredients}
                tags={el?.tags ? el?.tags?.[0] : {}}
                allergens={el?.allergens}
                categoryName={categoryName}
                categoryId={categoryId}
              />
            </React.Fragment>
          ))}
      </>
    );
  };

  // useEffect(()=>{},[])

  const renderCategory = (category: any) => {
    const categoryItems = filterItems(category?.items);
    /*eslint-disable*/
    const isChefSpecial = category?.name === "Chef's Special";

    const catAvailability = isIRDOpenNow(
      category?.hours?.timings,
      hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
    );

    return (
      <div
        id={`Category${category?.id}`}
        className={`${isIRDv2 ? 'globals-irdv2-category-element' : ''} ${
          isChefSpecial && isIRDv2 ? 'globals-irdv2-chef-special' : ''
        }`}
        key={category?.id}
      >
        {categoryItems?.length > 0 && (
          <h2 className={styles.subCategoriesText}>{category?.name}</h2>
        )}
        {renderMenuElements(categoryItems, category?.name, catAvailability, category?.id)}
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
                {renderMenuElements(
                  subCategoryItems,
                  `${category?.name} - ${subCategory?.name}`,
                  catAvailability,
                  category?.id,
                )}
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

  const [viewAllTags, setViewAllTags] = useState(false);
  const [viewAllAllergens, setViewAllAllergens] = useState(false);

  const renderFilterOptions = (
    items: string[],
    allergenCheck: boolean,
    showAll?: boolean,
    setShowAll?: (val: boolean) => void,
  ) => {
    const displayItems = showAll ? items : items.slice(0, 6);
    return (
      <>
        {' '}
        <div className={styles.filterTagWrapper}>
          {displayItems?.map((itemName, index) => {
            const IconComponent = iconsMap[itemName.toLowerCase() as keyof typeof iconsMap];
            return (
              <div key={index} className={styles.wrapper}>
                <StyledButton
                  className={cx(
                    styles.FilterButtonInActive,
                    {
                      [styles.FilterButtonActive]:
                        filteredOptions?.tag.includes(itemName) && !allergenCheck,
                    },
                    {
                      [styles.FilterButtonActiveAllergen]:
                        filteredOptions?.allergen.includes(itemName) && allergenCheck,
                    },
                  )}
                  onClick={() => {
                    if (allergenCheck) {
                      setFilteredOptions((prev: any) => ({
                        ...prev,
                        allergen: prev?.allergen.includes(itemName)
                          ? prev?.allergen.filter((item: any) => item !== itemName)
                          : [...prev?.allergen, itemName],
                      }));
                    } else {
                      setFilteredOptions((prev: any) => ({
                        ...prev,
                        tag: prev.tag.includes(itemName)
                          ? prev.tag.filter((item: any) => item !== itemName)
                          : [...prev.tag, itemName],
                      }));
                    }
                  }}
                >
                  <div className={styles.filterButtonContent}>
                    {IconComponent && <IconComponent className={styles.filterIcon} />}
                    <span className={styles.filterText}>{itemName}</span>
                  </div>
                </StyledButton>
              </div>
            );
          })}
        </div>
        {items.length > 6 && (
          <span className={styles.viewAllButton} onClick={() => setShowAll && setShowAll(!showAll)}>
            {showAll ? (
              <>
                {' '}
                View Less
                <Viewless />
              </>
            ) : (
              <>
                {' '}
                View All
                <ViewAll />{' '}
              </>
            )}
          </span>
        )}
      </>
    );
  };

  const backToTopBtn: any = () => {
    let count = 0;
    selectedMenu?.categories
      ?.filter((category: any) => category?.isActive)
      ?.forEach((category: any) => {
        const categoryItems = filterItems(category?.items);
        if (categoryItems?.length > 0) {
          count += categoryItems.length;
        }

        category?.subCategories?.forEach((sub: any) => {
          const subItems = filterItems(sub?.items);
          if (subItems?.length > 0) {
            count += subItems.length;
          }
        });
      });

    return count;
  };

  const backToTopBtnVar = backToTopBtn();

  const FilterDetails = () => (
    <>
      <div className={styles.drawerWrapper}>
        <div className={styles.filterWrapper}>
          <div className={styles.filterHeader}>
            <h3 className={styles.welcomeTitle}>{t('Filter By')}</h3>
          </div>
          <div className={styles.filterOptions}>
            {tags?.length > 0 && (
              <div className={styles.indredientWrapper}>
                <p className={styles.indredient}>{t('Special Features')}</p>
                {renderFilterOptions(tags, false, viewAllTags, setViewAllTags)}
              </div>
            )}
            {allergens?.length > 0 && (
              <div className={styles.indredientWrapper}>
                <p className={styles.indredient}>Allergens</p>
                {renderFilterOptions(allergens, true, viewAllAllergens, setViewAllAllergens)}{' '}
              </div>
            )}
          </div>
        </div>
        <div className={styles.btnWrapper}>
          <StyledButton
            className={styles.clearFilter}
            onClick={() => {
              setAppliedFilter({
                allergen: [],
                tag: [],
              });
              setFilteredOptions({
                allergen: [],
                tag: [],
              });
            }}
            variant='outlined'
          >
            {t('Clear All')}
          </StyledButton>
          <StyledButton
            className={styles.beginCheckIn}
            onClick={() => {
              setAppliedFilter(filteredOptions);
              setsearch(false);
              setFilterDrawer(false);
            }}
          >
            {t('Apply')}
          </StyledButton>
        </div>
      </div>
    </>
  );

  return (
    <>
      {!data || !loading ? (
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
                            setFilteredOptions({
                              allergen: [],
                              tag: [],
                            });
                          }}
                        >
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
            className={cx(styles.listContainer, {
              [styles.searchDic]: search,
              [styles.chefSpecialCategoryIdMargin]: !menuAvailability,
            })}
          >
            {!menuAvailability &&
              data.getIRDMenuOutputDetails.filter((i) => i?.isActive)?.length > 0 &&
              (() => {
                const tz = hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone;
                const nowTz = dayjs()?.tz(tz);
                const nowDt = nowTz?.toDate();
                const nowHr = nowTz?.hour(),
                  nowMn = nowTz?.minute();

                const findHoursFor = (weekday: string) =>
                  baseSelectedMenu?.hours?.find((h: any) => {
                    const parts = h?.day
                      ?.toUpperCase()
                      ?.split(/,|\s+TO\s+|\s+AND\s+/)
                      ?.map((p: any) => p?.trim());
                    if (parts?.length === 2 && parts[0]?.length > 2 && parts[1]?.length > 2) {
                      const days = [
                        'SUNDAY',
                        'MONDAY',
                        'TUESDAY',
                        'WEDNESDAY',
                        'THURSDAY',
                        'FRIDAY',
                        'SATURDAY',
                      ];
                      const start = days?.indexOf(parts[0]),
                        end = days?.indexOf(parts[1]);
                      const range =
                        start <= end
                          ? days?.slice(start, end + 1)
                          : days?.slice(start)?.concat(days?.slice(0, end + 1));
                      return range?.includes(weekday);
                    }
                    return parts?.includes(weekday);
                  });

                const everyday = findHoursFor('EVERYDAY');
                if (everyday) {
                  const fmt = convertTo12HourFormat(everyday?.from || everyday?.open);
                  return (
                    <div className={styles.menuUnavailableContainer}>
                      <div className={styles.menuTimingsText}>
                        {`${
                          irdModuleContent?.name || 'In-Room Dining'
                        } requests will open from ${fmt}.`}
                      </div>
                      <div className={styles.menuUnavailableDescription}>
                        {t('This menu is unavailable right now! You can still check it out below.')}
                      </div>
                    </div>
                  );
                }

                const getWeekday = (d: Date) =>
                  d?.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz })?.toUpperCase();

                const todayName = getWeekday(nowDt);
                const todayHrs = findHoursFor(todayName);
                if (todayHrs) {
                  const [h, m] = (todayHrs?.from || todayHrs?.open).split(':')?.map(Number);
                  if (nowHr < h || (nowHr === h && nowMn < m)) {
                    const fmt = convertTo12HourFormat(todayHrs?.from || todayHrs?.open);
                    return (
                      <div className={styles.menuUnavailableContainer}>
                        <div className={styles.menuTimingsText}>
                          {`${
                            irdModuleContent?.name || 'In-Room Dining'
                          } requests will open today from ${fmt}.`}
                        </div>
                        <div className={styles.menuUnavailableDescription}>
                          {t(
                            'This menu is unavailable right now! You can still check it out below.',
                          )}
                        </div>
                      </div>
                    );
                  }
                }
                const tomoDt = nowTz?.add(1, 'day').toDate();
                const tomoH = findHoursFor(getWeekday(tomoDt));
                if (tomoH) {
                  const fmt = convertTo12HourFormat(tomoH?.from || tomoH?.open);
                  return (
                    <div className={styles.menuUnavailableContainer}>
                      <div className={styles.menuTimingsText}>
                        {`${
                          irdModuleContent?.name || 'In-Room Dining'
                        } requests will open tomorrow from ${fmt}.`}
                      </div>
                      <div className={styles.menuUnavailableDescription}>
                        {t('This menu is unavailable right now! You can still check it out below.')}
                      </div>
                    </div>
                  );
                }

                for (let i = 2; i <= 7; i++) {
                  const futureDt = nowTz?.add(i, 'day')?.toDate();
                  const hrs = findHoursFor(getWeekday(futureDt));
                  if (hrs) {
                    const dateStr = futureDt?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      timeZone: tz,
                    });
                    const fmt = convertTo12HourFormat(hrs?.from || hrs?.open);
                    return (
                      <div className={styles.menuUnavailableContainer}>
                        <div className={styles.menuTimingsText}>
                          {`${
                            irdModuleContent?.name || 'In-Room Dining'
                          } requests will open on ${dateStr} from ${fmt}.`}
                        </div>
                        <div className={styles.menuUnavailableDescription}>
                          {t(
                            'This menu is unavailable right now! You can still check it out below.',
                          )}
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}

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
            {selectedMenu?.categories?.filter((item: any) => item?.isActive)?.length > 0 && (
              <div
                className={cx(styles.bottomContainer, { ['globals-irdv2-irdFlowShow']: isIRDv2 })}
              >
                <div className={styles.backToTopContainer}>
                  {backToTopBtnVar >= 4 && isIRDv2 && (
                    <StyledButton
                      className={cx(styles.backToTopButton, {
                        [styles.backToTopButtonClicked]: backToTopClicked,
                      })}
                      onClick={() => {
                        setBackToTopClicked(true);
                        const firstCategory = selectedMenu?.categories?.filter(
                          (item: any) => item?.isActive,
                        )[0];

                        if (firstCategory) {
                          window.scrollTo({
                            top: 0,
                            behavior: 'smooth',
                          });
                          diningInformationStorage(
                            produce(diningInformationStorage(), (draft) => {
                              if (draft) {
                                draft.selectedCategory = firstCategory?.id ?? '';
                                draft.categoryName = firstCategory?.name ?? '';
                              }
                            }),
                          );
                          setTimeout(() => {
                            setBackToTopClicked(false);
                          }, 500);
                        }
                      }}
                      variant='outlined'
                    >
                      {t('Back to Top')}
                    </StyledButton>
                  )}

                  {backToTopBtnVar !== 0 && isIRDv2 && (
                    <p className={styles.priceDisclaimer}>All prices are in {currency}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      <DiningDetailsDrawer
        menuAvailability={menuAvailability ? catAvailabilityDisable : menuAvailability}
      />{' '}
      <CustomDrawer
        open={filterDrawer}
        onClose={() => {
          setFilteredOptions(
            appliedFilter || {
              allergen: [],
              tag: [],
            },
          );
          setFilterDrawer(false);
        }}
        content={<FilterDetails />}
      />
    </>
  );
};

export default DiningMenu;
