import React, { useEffect } from 'react';
import cx from 'classnames';
import { BottomMenu } from 'components/shared/BottomMenu/BottomMenu';
import styles from './PageWrapper.module.scss';
import { IPageWrapperProps } from './PageWrapper.types';
import { useHideOnScroll } from 'utils/hooks/useHideOnScroll';
import { GET_HOTEL_INFORMATION } from 'core/graphql/queries/GET_HOTEL_INFORMATION';
import { useLazyQuery, useQuery, useReactiveVar } from '@apollo/client';
import { useLocale } from 'utils/hooks/useLocalizedRouter';
import { useConfig } from 'utils/hooks/useConfiguration';
import { hotelInfoStorage } from 'storage/home.storage';

export const PageWrapper: React.FC<IPageWrapperProps> = ({
  children,
  displayBottomMenu,
  className,
  disabled,
}) => {
  const locale = useLocale();
  const hotelId = useConfig()?.hotelId;
  const hotelInfoStorageList = useReactiveVar(hotelInfoStorage);

  const [hotelInfo, { data, loading }] = useLazyQuery(GET_HOTEL_INFORMATION, {
    context: { clientName: 'host_v0' },
    fetchPolicy: 'no-cache',
    variables: {
      hotelId: hotelId,
      lang: locale === 'en' ? '' : locale,
    },
  });

  useEffect(() => {
    if (hotelInfoStorageList?.length === 0) {
      hotelInfo();
    }
  }, [hotelInfoStorageList]);

  useEffect(() => {
    if (!loading && data) {
      hotelInfoStorage(data);
    }
  }, [loading]);

  const hideOnScroll = useHideOnScroll();
  return (
    <div
      className={cx(styles.wrapper, className, {
        [styles.wrapperWithBottomMenu]: displayBottomMenu,
        [styles.hideOnScroll]: hideOnScroll,
      })}
    >
      {children}
      {displayBottomMenu && <BottomMenu disabled={disabled} />}
    </div>
  );
};
