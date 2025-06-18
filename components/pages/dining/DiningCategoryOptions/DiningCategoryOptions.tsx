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

  useEffect(() => {
    const scrollContainer = stickyHeader.current;

    if (scrollContainer) {
      const activeCategoryElement = scrollContainer.querySelector(
        `[id="${diningInformation?.selectedCategory}"]`,
      ) as HTMLElement;
      if (activeCategoryElement) {
        const containerWidth = scrollContainer.offsetWidth;
        const elementWidth = activeCategoryElement.offsetWidth;
        const elementOffsetLeft = activeCategoryElement.offsetLeft;
        const scrollPosition = elementOffsetLeft + elementWidth / 2 - containerWidth / 2;
        scrollContainer.scrollTo({
          left: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
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
  }, [setScroll]);

  useEffect(() => {
    const handleScroll = () => {
      if (isManualSelection) return;
      const scrollY = window.scrollY;
      const isAtBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50;
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [diningInformation?.selectedCategory, userScrolling]);

  const handleCategoryChange = (event: any, el: any) => {
    setIsManualSelection(true);
    setUserScrolling(true);

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
    setTimeout(() => {
      setScrollHide(true);
      setUserScrolling(false);
      setIsManualSelection(false);
    }, 1200);

    setScrollPosition(0, 0);
    diningInformationStorage(
      produce(diningInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedCategory = el?.id ?? '';
          draft.categoryName = el?.value ?? '';
        }
      }),
    );
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
