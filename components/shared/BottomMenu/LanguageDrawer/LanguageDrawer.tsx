import React from 'react';
import styles from '../MenuItem/MenuItem.module.scss';
import cx from 'classnames';
import CheckIcon from '@icons/checkIcon.svg';
import { useTranslation } from 'react-i18next';
import { CustomDrawer } from 'components/shared/CustomDrawer/CustomDrawer';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useRouter } from 'next/router';
import { setDayjsLocale } from 'storage/home.storage';

export const LanguageDrawer: React.FC<any> = ({ openLanguage, setOpenLanguage }) => {
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const config = useConfig();

  const renderLanguage = () => (
    <div className={styles.wrapper}>
      <p className={styles.title}>{t('Choose Your Preferred Language')}</p>
      <div className={styles.optionsList}>
        {config?.languages?.map((language: any, index: number) => (
          <div key={index} className={cx(styles.optionsListItem)}>
            <p
              className={cx(styles.inActiveDiningText, {
                [styles.activeText]: language?.code === router?.query?.locale,
              })}
              onClick={async () => {
                setOpenLanguage(false);
                setDayjsLocale(false);
                await router.push(`/${language?.code}/${router?.asPath?.slice(4)}`);
              }}
            >
              {/* translation is not required  */}
              {language?.name}
            </p>
            {language?.code === router?.query?.locale && <CheckIcon className={styles.icon} />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <CustomDrawer
      open={openLanguage}
      content={renderLanguage()}
      onClose={() => setOpenLanguage(false)}
    />
  );
};
