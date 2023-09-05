import React, { useState } from 'react';
import styles from './InfoCard.module.scss';
import CheckMarkIcon from '@icons/checkMark.svg';
import EditMarkIcon from '@icons/editMark.svg';
import CheckMark from '@icons/checkMarkProduct.svg';
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
import { CREDITCARD, CYBERSOURCE, GUEST, GUESTICON, USERGROUP } from 'utils/constants';

export const InfoCard: React.FC<IInfoCardProps> = ({
  icon,
  title,
  details,
  status,
  isCardOpened,
  children,
  completedCheck,
  paymentType
}) => {
  const [cardOpened, setCardOpened] = useState(isCardOpened);
  const [expanded, setExpanded] = useState(false);
  const navigate = useLocalizedRouter();

  const toggleCard = () => {
    setExpanded((state) => !state);
    setCardOpened(!cardOpened);

    if (icon === CREDITCARD && !status) {
      if (paymentType === CYBERSOURCE) {
        // navigate(availablePaths.CHECK_IN_PAYMENT);
      }
    }
    else {
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
                {icon === CREDITCARD ? (
                  <CreditCardIcon className={styles.okIcon} />
                ) : icon === GUESTICON ? (
                  <GuestIcon className={styles.okIcon} />
                ) : icon === GUEST ? (
                  <GuestUSer className={styles.okIcon} />
                ) : icon === USERGROUP ? (
                  <GuestGroup className={styles.okIcon} />
                ) : (
                  <IdCard className={styles.okIcon} />
                )}
              </div>
              <div className={styles.homeCardInfo}>
                <div className={styles.titleText}>{title}</div>

                {status ? (
                  <div className={styles.detailsText}>{details}</div>
                ) : (
                  <div className={styles.errorText}>Please update</div>
                )}
              </div>
            </div>
            <div>
              {status && (
                expanded && !completedCheck ? <DownArrow /> :
                  completedCheck ? <CheckMark /> :
                    <EditIcon />
              )}
            </div>
          </div>
        </div>
        {cardOpened && <div>{children}</div>}
      </>
    </div>
  );
};
