/* eslint-disable @next/next/no-img-element */
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import styles from '../../styles/404/404.module.scss';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation('common');
  const navigate = useLocalizedRouter();
  return (
    <>
      <Head>
        <title>{t('Page Not Found')}</title>
      </Head>
      <Header displayHome />
      <div className={styles.wrapper}>
        <img
          src={'https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif'}
          alt='404'
        />
        <h2>Oops! Looks like you are lost</h2>
        <StyledButton className={styles.findWayBtn} onClick={() => navigate(availablePaths?.HOME)}>
          GO HOME
        </StyledButton>
      </div>
    </>
  );
}
