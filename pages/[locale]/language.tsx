import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { Header } from 'components/shared/Header/Header';
import cx from 'classnames';

import styles from '../../styles/language/language.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { RadioGroup } from '@mui/material';
import { StyledRadio } from 'components/shared/StyledRadio/StyledRadio';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import languageDetector from 'utils/languageDetector';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

export { getStaticPaths };

const Language = () => {
  const router = useRouter();

  const { t } = useTranslation('language');

  const locale = router.query.locale;

  const [selectedLanguage, setSelechedLanguage] = useState(locale);

  const handleSelectedLanguageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const lang = event.target.value;

    setSelechedLanguage(lang);
  }, []);

  const changeLanguage = useCallback(async () => {
    if (languageDetector.cache) {
      languageDetector.cache(selectedLanguage as string);
    }

    await router.push(`/${selectedLanguage}/language`);
    toast(t('Language Changed'), { type: 'success' });
  }, [router, selectedLanguage, t]);

  return (
    <>
      <Head>
        <title>{t('Language')}</title>
      </Head>
      <Header displayBackButton screenTitle={t('Language') as string} />
      <PageWrapper displayBottomMenu className={styles.radioWrapper}>
        <p className={styles.criteria}>{t('Choose Language')}</p>
        <div className={styles.languagesWrapper}>
          <RadioGroup
            value={selectedLanguage}
            onChange={handleSelectedLanguageChange}
            name='housekeeping-services'
          >
            <div className={styles.radioItemWrapper}>
              <StyledRadio value={'en'} label={`English (${t('Default Language')})`} />
            </div>
            <div className={styles.radioItemWrapper}>
              <StyledRadio value={'es'} label={'Español'} />
            </div>
            <div className={styles.radioItemWrapper}>
              <StyledRadio value={'fr'} label={'Francais'} />
            </div>
          </RadioGroup>
        </div>
        <StyledButton
          onClick={changeLanguage}
          className={cx(styles.button, { [styles.buttonActive]: locale !== selectedLanguage })}
        >
          {t('Save changes')}
        </StyledButton>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['language', 'common'], i18nConfig)),
    },
  };
};

export default Language;
