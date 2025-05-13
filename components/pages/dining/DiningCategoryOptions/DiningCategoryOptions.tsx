import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './DiningCategoryOptions.module.scss';
import { IDiningMenuFilterProps } from './DiningCategoryOptions.types';
import { diningInformationStorage } from 'storage/dining.storage';
import { useReactiveVar } from '@apollo/client';
import cx from 'classnames';
import produce from 'immer';
import { setScrollPosition } from 'utils/functions';

export const DiningCategoryOptions: React.FC<IDiningMenuFilterProps> = ({
  categories,
  ordersData,
  scroll,
  setScroll,
  setScrollHide,
}) => {
  const stickyHeader: any = useRef();

  const diningInformation = useReactiveVar(diningInformationStorage);

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

  const handleCategoryChange = (event: any, el: any) => {
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
    }, 1000);
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
      category?.items?.filter((item: any) => item?.isActive)?.length > 0 ||
      category?.subCategories?.some(
        (subCategory: any) => subCategory?.items?.filter((item: any) => item?.isActive)?.length > 0,
      ),
  );

  return (
    <>
      <div ref={stickyHeader} className={cx(styles.menuOptionsWrapper)}>
        {filteredCategories?.map((el: any, index: number) => (
          <div id={el?.id} className={styles.diningMenuFilterButtonWrapper} key={`${el}-${index}`}>
            <StyledButton
              className={cx(styles.DiningCategoryOptionInActive, {
                [styles.DiningCategoryOptionActive]: el?.id === diningInformation?.selectedCategory,
              })}
              onClick={(e) => {
                handleCategoryChange(e, el);
              }}
            >
              {el?.name}
            </StyledButton>
          </div>
        ))}
      </div>
    </>
  );
};
