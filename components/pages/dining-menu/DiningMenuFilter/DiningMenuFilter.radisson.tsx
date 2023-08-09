import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './DiningMenuFilter.module.scss';
import { IDiningMenuFilterProps } from './DiningMenuFilter.types';
import { diningInformationStorage } from 'storage/dining.storage';
import { useReactiveVar } from '@apollo/client';
import Dropdown from '@icons/ird_category_dropdown.svg';
import { useTranslation } from 'react-i18next';
import Icondown from '@icons/ird_up_arrow.svg';
import cx from 'classnames';
import produce from 'immer';
import ScrollDown from '@icons/scrollDown.svg';

export const DiningMenuFilter: React.FC<IDiningMenuFilterProps> = ({
  categories,
  ordersData,
  openCategory,
}) => {
  const dropdownRef: any = useRef();
  const stickyHeader: any = useRef();
  const [scrollTop, setScrollTop] = useState(0);
  const [scroll, setScroll] = useState(false);
  const { t } = useTranslation('dining-menu');
  const filter = useReactiveVar(diningInformationStorage);
  const [value, setValue] = useState<any>(filter?.categoryName);
  const [filterView, setFilterView] = useState(false);

  useEffect(() => {
    setValue(filter?.categoryName || (categories && categories[0]?.title));
  }, [categories, filter?.categoryName]);

  useEffect(() => {
    const fixedTop = stickyHeader?.current?.offsetTop;
    const fixedHeader = () => {
      if (window?.scrollY > fixedTop) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };
    window.addEventListener('scroll', fixedHeader);
  }, []);

  const handleCategoryChange = (event: any, el: any) => {
    setValue(event.target.id);
    const categoryId = el?.value;
    const categoryName = event.target.id;
    diningInformationStorage(
      produce(diningInformationStorage(), (draft) => {
        if (draft) {
          draft.selectedCategory = categoryId;
          draft.categoryName = categoryName;
        }
      }),
    );
    setFilterView(!filterView);
  };
  useEffect(() => {
    if (openCategory) {
      setFilterView(false);
    }
  }, [openCategory, filterView]);

  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }
  function enableScroll() {
    document.body.style.overflow = '';
  }

  useEffect(() => {
    if (filterView || openCategory) {
      disableScroll();
    } else {
      enableScroll();
    }
  }, [filterView, openCategory]);

  const scrollToBottom = () => {
    dropdownRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  document
    ?.getElementById('container')
    ?.addEventListener('scroll', (evt: any) => setScrollTop(evt?.target?.scrollTop));

  return (
    <>
      {value && (
        <div
          ref={stickyHeader}
          onClick={() => {
            setFilterView(!filterView);
          }}
          className={cx(
            styles.fliterWrapper,
            {
              [styles.fliterWrapperSecondary]: (ordersData ?? [])?.length > 0 ? true : false,
            },
            {
              [styles.fixedTop]: scroll,
            },
          )}
        >
          <p className={styles.placeholderFilter}>{value}</p>
          <div
            className={cx(styles.dropDownicon, {
              [styles.dropDowniconActive]: filterView,
            })}
          >
            {' '}
            {filterView ? <Icondown /> : <Dropdown />}
          </div>
        </div>
      )}
      {filterView && (
        <div
          className={cx(styles.backdrop, {
            [styles.backdropOrder]: (ordersData ?? [])?.length > 0 ? true : false,
          })}
          onClick={() => setFilterView(!filterView)}
        ></div>
      )}
      <div className={styles.container}>
        {filterView && (
          <div
            className={cx(styles.filterView, {
              [styles.filterViewScroll]: scroll,
            })}
          >
            <div id='container' className={styles.filterViewOptionContainer}>
              {categories?.map((el: any, index: number) => (
                <div
                  ref={dropdownRef}
                  className={cx(styles.dropDowntext, {
                    [styles.selected]: value === el?.title,
                  })}
                  id={el?.title}
                  onClick={(e) => {
                    handleCategoryChange(e, el);
                  }}
                  placeholder={el?.title}
                  key={`${el}-${index}`}
                >
                  {el?.title}
                </div>
              ))}
            </div>
            <div className={styles.bottomScrollIcon}>
              {scrollTop !== 369 && <ScrollDown onClick={scrollToBottom} />}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
