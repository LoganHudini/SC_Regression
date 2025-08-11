import styles from './PhoneEmail.module.scss';
import PhoneIcon from '@icons/phone.svg';
import EmailIcon from '@icons/email.svg';
import URLIcon from '@icons/url.svg';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { EMAILCAPS, PHONECAPS, URL } from 'utils/constants';

export const PhoneEmail = (props: any) => {
  const {
    phone,
    email,
    phoneTitle,
    emailTitle,
    url,
    urlTitle,
    phoneDisplayTitle,
    emailDisplayTitle,
    urlDisplayTitle,
  } = props;
  const { t } = useTranslation(['common']);
  return (
    <div className={styles.thirdRow}>
      <>
        {phone && (
          <a aria-label={`${t('Phone')}`} href={`tel:${phone}`} className={styles.callRow}>
            <PhoneIcon className={styles.icon} />{' '}
            <span className={styles.icon_contact}>
              {phoneDisplayTitle || phoneTitle || PHONECAPS}
            </span>
          </a>
        )}
        {email && (
          <a aria-label={`${t('Email')}`} href={`mailto:${email}`} className={styles.emailRow}>
            <EmailIcon className={styles.icon} />{' '}
            <span className={styles.icon_contact}>
              {emailDisplayTitle || emailTitle || EMAILCAPS}
            </span>
          </a>
        )}
        {url && (
          <a
            aria-label={`${t('URL')}`}
            href={url}
            className={styles.urlRow}
            target='_blank'
            rel='noopener noreferrer'
          >
            <URLIcon className={cx(styles.check, styles.icon)} />{' '}
            <span className={styles.icon_contact}>{urlDisplayTitle || urlTitle || URL}</span>
          </a>
        )}
      </>
    </div>
  );
};
