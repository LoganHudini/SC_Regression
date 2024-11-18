import styles from './PhoneEmail.module.scss';
import PhoneIcon from '@icons/phone.svg';
import EmailIcon from '@icons/email.svg';
import { useTranslation } from 'react-i18next';

export const PhoneEmail = (props: any) => {
  const { phone, email, phoneTitle, emailTitle } = props;
  const { t } = useTranslation(['common']);
  return (
    <div className={styles.thirdRow}>
      <>
        {phone && (
          <a aria-label={`${t('Phone')}`} href={`tel:${phone}`} className={styles.callRow}>
            <PhoneIcon /> <span className={styles.icon_contact}>{phoneTitle || t('Call')}</span>
          </a>
        )}
        {email && (
          <a aria-label={`${t('Email')}`} href={`mailto:${email}`} className={styles.emailRow}>
            <EmailIcon /> <span className={styles.icon_contact}>{emailTitle || t('Email')}</span>
          </a>
        )}
      </>
    </div>
  );
};
