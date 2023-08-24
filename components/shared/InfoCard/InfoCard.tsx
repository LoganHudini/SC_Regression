import React, { useState } from 'react';
import styles from './InfoCard.module.scss';
import CheckMarkIcon from '@icons/checkMark.svg';
import EditMarkIcon from '@icons/editMark.svg';
import { IInfoCardProps } from './InfoCard.types';
import CreditCardIcon from '@icons/credit-cards.svg';
import IdCard from '@icons/id-card.svg';
import GuestUSer from '@icons/guestUser.svg';
import GuestIcon from '@icons/traveling.svg';
import EditIcon from '@icons/commonEditIcon.svg';
import DownArrow from '@icons/downArrowCard.svg';
import GuestGroup from '@icons/guestsGroupCard.svg';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';

export const InfoCard: React.FC<IInfoCardProps> = ({
  icon,
  title,
  details,
  status,
  isCardOpened,
  children,
}) => {
  const [cardOpened, setCardOpened] = useState(isCardOpened);
  const [exapnded, setExpanded] = useState(false);
  const navigate = useLocalizedRouter();

  const toggleCard = () => {
    setExpanded((state) => !state)
    if (icon === 'creditCard' && !status) {
      navigate(availablePaths.CHECK_IN_PAYMENT);
    } else {
      setCardOpened(!cardOpened);
    }
  };

  return (
    <div className={styles.infoCardStyles}>
      <>
        <div className={styles.homeCard} onClick={toggleCard}>
          <div className={styles.homeCardInner}>
            <div className={styles.firstSection}>
              <div className={styles.homeIcon}>
                {icon === 'creditCard' ? (
                  <CreditCardIcon className={styles.okIcon} />
                ) : icon === 'guestIcon' ? (
                  <GuestIcon className={styles.okIcon} />
                ) : icon === 'guest' ? (
                  <GuestUSer className={styles.okIcon} />
                ) : icon === 'userGroup' ? (
                  <GuestGroup className={styles.okIcon} />
                ) : (
                  <IdCard className={styles.okIcon} />
                )}
              </div>
              <div className={styles.homeCardInfo}>
                <div className={styles.titeText}>{title}</div>

                {status ? (
                  <div className={styles.detailsText}>{details}</div>
                ) : (
                  <div className={styles.errorText}>Please update</div>
                )}
              </div>
            </div>
            <div>{status && (exapnded ? <DownArrow /> : <EditIcon />)}</div>
          </div>
        </div>
        {cardOpened && <div>{children}</div>}
      </>
    </div>
  );
};
