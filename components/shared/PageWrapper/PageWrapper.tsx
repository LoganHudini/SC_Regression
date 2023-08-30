import React from 'react';
import cx from 'classnames';
import { BottomMenu } from 'components/shared/BottomMenu/BottomMenu';
import styles from './PageWrapper.module.scss';
import { IPageWrapperProps } from './PageWrapper.types';

export const PageWrapper: React.FC<IPageWrapperProps> = ({
  children,
  displayBottomMenu,
  className,
}) => {
  return (
    <div
      className={cx(styles.wrapper, className, {
        [styles.wrapperWithBottomMenu]: displayBottomMenu,
      })}
    >
      {children}
      {displayBottomMenu && <BottomMenu />}
    </div>
  );
};
