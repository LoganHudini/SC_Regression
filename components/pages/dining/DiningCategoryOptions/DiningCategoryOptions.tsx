import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './DiningCategoryOptions.module.scss';
import { IDiningMenuFilterProps } from './DiningCategoryOptions.types';
import { diningInformationStorage } from 'storage/dining.storage';
import { useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import produce from 'immer';
import { findModule, getIRDStatus, setScrollPosition } from 'utils/functions';
import { hotelInfoStorage } from 'storage/home.storage';
import { useConfig } from 'utils/hooks/useConfiguration';
import { IN_ROOM_DINING } from 'utils/constants';

export const DiningCategoryOptions: React.FC<IDiningMenuFilterProps> = ({
  categories,
  ordersData,
  scroll,
  setScroll,
  setScrollHide,
}) => {
  const stickyHeader: any = useRef();
  const diningInformation = useReactiveVar(diningInformationStorage);
  const [userScrolling, setUserScrolling] = useState(false);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const hotelInformation = useReactiveVar(hotelInfoStorage);
  const config = useConfig();
  const irdModuleContent: any = findModule(config?.modules, IN_ROOM_DINING);
  const isIRDv2 = irdModuleContent?.version === 'v2';
  const manualSelectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingToCategory = useRef(false);

  useEffect(() => {
    const scrollContainer = stickyHeader.current;

    if (scrollContainer && diningInformation?.selectedCategory) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        const activeCategoryElement = scrollContainer.querySelector(
          `[id="${diningInformation?.selectedCategory}"]`,
        ) as HTMLElement;

        if (activeCategoryElement) {
          const containerWidth = scrollContainer.offsetWidth;
          const elementWidth = activeCategoryElement.offsetWidth;
          const elementOffsetLeft = activeCategoryElement.offsetLeft;
          const scrollPosition = elementOffsetLeft + elementWidth / 2 - containerWidth / 2;
          scrollContainer.scrollTo({
            left: Math.max(0, scrollPosition),
            behavior: 'smooth',
          });
        }
      }, 50);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [diningInformation?.selectedCategory]);

  useLayoutEffect(() => {
    const top = stickyHeader?.current?.offsetTop;
    const fixedHeader = () => {
      if (window?.scrollY > top) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    window.addEventListener('scroll', fixedHeader);

    return () => {
      window.removeEventListener('scroll', fixedHeader);
    };
  }, [setScroll]);

  useEffect(() => {
    let scrollDebounceTimer: NodeJS.Timeout;
    const handleScroll = () => {
      if (isManualSelection || isScrollingToCategory.current) return;
      if (scrollDebounceTimer) {
        clearTimeout(scrollDebounceTimer);
      }
      scrollDebounceTimer = setTimeout(() => {
        const scrollY = window.scrollY;
        const isAtBottom =
          scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50;

        const categoryElements = filteredCategories
          .map((category: any) => ({
            id: category.id,
            name: category.name,
            element: document.getElementById(`Category${category.id}`),
          }))
          .filter((item: any) => item.element);

        if (!categoryElements.length) return;

        if (isAtBottom) {
          const lastCategory = categoryElements[categoryElements.length - 1];
          updateSelectedCategory(lastCategory.id, lastCategory.name);
          return;
        }

        const scrollThreshold = scrollY + 200;
        for (let i = categoryElements.length - 1; i >= 0; i--) {
          const { id, name, element } = categoryElements[i];
          if (element && element.offsetTop <= scrollThreshold) {
            updateSelectedCategory(id, name);
            return;
          }
        }

        const firstCategory = categoryElements[0];
        updateSelectedCategory(firstCategory.id, firstCategory.name);
      }, 100);
    };
    function updateSelectedCategory(id: string, name: string) {
      if (id !== diningInformation?.selectedCategory) {
        diningInformationStorage(
          produce(diningInformationStorage(), (draft) => {
            if (draft) {
              draft.selectedCategory = id;
              draft.categoryName = name;
            }
          }),
        );
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollDebounceTimer) {
        clearTimeout(scrollDebounceTimer);
      }
    };
  }, [diningInformation?.selectedCategory, isManualSelection]);

  const handleCategoryChange = (event: any, el: any) => {
    if (manualSelectionTimeoutRef.current) {
      clearTimeout(manualSelectionTimeoutRef.current);
    }
    diningInformationStorage(
      produce(diningInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedCategory = el?.id ?? '';
          draft.categoryName = el?.value ?? '';
        }
      }),
    );
    setIsManualSelection(true);
    setUserScrolling(true);
    isScrollingToCategory.current = true;

    const categoryElement = document.getElementById(`Category${el?.id}`);
    if (categoryElement) {
      setScrollHide(false);
      const headerOffset = 150;
      const elementPosition = categoryElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo(0, 0);
    }
    manualSelectionTimeoutRef.current = setTimeout(() => {
      setScrollHide(true);
      setUserScrolling(false);
      setIsManualSelection(false);
      isScrollingToCategory.current = false;
    }, 1500);

    setScrollPosition(0, 0);
  };

  const filteredCategories = categories?.filter(
    (category: any) =>
      category?.items?.filter((item: any) => item?.isActive && item?.price > 0)?.length > 0 ||
      category?.subCategories?.some(
        (subCategory: any) =>
          subCategory?.items?.filter((item: any) => item?.isActive && item?.price > 0)?.length > 0,
      ),
  );

  const CatogoryTimingsView: React.FC<{ el: any }> = ({ el }) => {
    const category = getIRDStatus(
      el?.hours?.timings,
      hotelInformation?.getPropertyDetailsByHotelId?.hotel?.location?.timezone,
    );

    return (
      <div>
        <StyledButton
          className={cx(styles.DiningCategoryOptionInActive, {
            [styles.DiningCategoryOptionInActiveV2]: isIRDv2,
            [styles.DiningCategoryOptionActive]:
              el?.id === diningInformation?.selectedCategory && !isIRDv2,
            [styles.DiningCategoryOptionActiveV2]:
              el?.id === diningInformation?.selectedCategory && isIRDv2,
          })}
          onClick={(e) => {
            handleCategoryChange(e, el);
          }}
        >
          {el?.name}
        </StyledButton>
        <p className={cx(styles.catTiming)}> {category}</p>
      </div>
    );
  };

  return (
    <>
      <div ref={stickyHeader} className={cx(styles.menuOptionsWrapper)}>
        {filteredCategories?.map((el: any, index: number) => (
          <div
            id={el?.id}
            className={cx(styles.diningMenuFilterButtonWrapper, {
              [styles.diningMenuFilterButtonWrapperV2]: isIRDv2,
            })}
            key={`${el}-${index}`}
          >
            <CatogoryTimingsView el={el} />
          </div>
        ))}
      </div>
    </>
  );
};
