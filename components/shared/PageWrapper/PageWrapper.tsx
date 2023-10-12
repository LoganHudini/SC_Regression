import React from 'react';
import cx from 'classnames';
import { BottomMenu } from 'components/shared/BottomMenu/BottomMenu';
import styles from './PageWrapper.module.scss';
import { IPageWrapperProps } from './PageWrapper.types';
import { useHideOnScroll } from 'utils/hooks/useHideOnScroll';

export const PageWrapper: React.FC<IPageWrapperProps> = ({
  children,
  displayBottomMenu,
  className,
}) => {
  const hideOnScroll = useHideOnScroll();
  return (
    <div
      className={cx(styles.wrapper, className, {
        [styles.wrapperWithBottomMenu]: displayBottomMenu,
        [styles.hideOnScroll]: hideOnScroll,
      })}
    >
      {children}
      {displayBottomMenu && <BottomMenu />}
    </div>
  );
};
