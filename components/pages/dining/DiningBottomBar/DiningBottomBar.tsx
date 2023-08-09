import React from 'react';
import cx from 'classnames';
import styles from './DiningBottomBar.module.scss';
import CloseOutlinedIcon from '@icons/ExitDiningBottomMenu.svg';
import { IDiningBottomBarProps } from './DiningBottomBar.types';
import LinkComponent from 'utils/link';
import { StableImage } from 'components/shared/StableImage/StableImage';

export const DiningBottomBar: React.FC<IDiningBottomBarProps> = ({
  toggleDiningBottomBarOpened,
  opened,
}) => {
  return (
    <>
      <div
        className={cx(styles.blurOverlay, { [styles.blurOverlayDisplayed]: opened })}
        onClick={toggleDiningBottomBarOpened}
      />

      <div className={cx(styles.wrapper, { [styles.wrapperDisplayed]: opened })}>
        <button onClick={toggleDiningBottomBarOpened} className={styles.closeBtn}>
          <CloseOutlinedIcon />
        </button>

        <div className={styles.elementsWrapper}>
          <LinkComponent href='/' className={styles.diningElementWrapper}>
            <div className={styles.diningElementBlurOverlay} />
            <StableImage
              className={styles.diningElementImage}
              src='/images/default/edenRestaurant.png'
              alt=''
            />
            <p className={styles.diningElementText}>Eden Restaurant</p>
          </LinkComponent>

          <LinkComponent href='/atelier-lounge/' className={styles.diningElementWrapper}>
            <div className={styles.diningElementBlurOverlay} />
            <StableImage
              className={styles.diningElementImage}
              src='/images/default/atelierLounge.png'
              alt=''
            />
            <p className={styles.diningElementText}>Atelier Lounge</p>
          </LinkComponent>

          <LinkComponent href='/beach-club-page/' className={styles.diningElementWrapper}>
            <div className={styles.diningElementBlurOverlay} />
            <StableImage
              className={styles.diningElementImage}
              src='/images/default/psoBeachClub.png'
              alt=''
            />
            <p className={styles.diningElementText}>
              PSO
              <br />
              Beach Club
            </p>
          </LinkComponent>

          <LinkComponent href='/dining/' className={styles.diningElementWrapper}>
            <div className={styles.diningElementBlurOverlay} />
            <StableImage
              className={styles.diningElementImage}
              src='/images/default/inRoomDining.png'
              alt=''
            />
            <p className={styles.diningElementText}>IN-ROOM DINING</p>
          </LinkComponent>
        </div>
      </div>
    </>
  );
};
