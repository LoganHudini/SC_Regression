import React from 'react';
import cx from 'classnames';
import { BottomMenu } from 'components/shared/BottomMenu/BottomMenu';
import styles from './PageWrapper.module.scss';
import { IPageWrapperProps } from './PageWrapper.types';
import { IHamburgerProps } from 'utils/hamburger/getHamburgerProps';

export const PageWrapper: React.FC<IPageWrapperProps & Partial<IHamburgerProps>> = ({
  children,
  displayBottomMenu,
  className,
  hamburger,
  pages,
}) => {
  return (
    <div
      className={cx(styles.wrapper, className, {
        [styles.wrapperWithBottomMenu]: displayBottomMenu,
      })}
    >
      {children}
      {displayBottomMenu && (
        <BottomMenu
          pages={pages as IHamburgerProps['pages']}
          hamburger={hamburger as IHamburgerProps['hamburger']}
        />
      )}
    </div>
  );
};
