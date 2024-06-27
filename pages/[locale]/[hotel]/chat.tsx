import React, { useEffect, useState } from 'react';
import styles from '@styles/chat/chat.module.scss';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import i18nConfig from 'next-i18next.config';
import { getStaticPaths } from 'utils/getStatic';
import Head from 'next/head';
import { Header } from 'components/shared/Header/Header';
import { useConfig } from 'utils/hooks/useConfiguration';
import { useTranslation } from 'react-i18next';
import { useCheckedIn } from 'storage/check-in.storage';
import { client } from 'core/graphql/client';
import { GET_MESSAGEBOX_URL } from 'core/graphql/queries/GET_MESSAGEBOX_URL';
import { Loader } from 'components/shared/Loaders/Loaders';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';

export { getStaticPaths };

const Chat = () => {
  const { t } = useTranslation(['common']);
  const config = useConfig();
  const checkInData = useCheckedIn();
  const hotelName = config?.name;
  const [url, setUrl] = useState('');
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    (async () => {
      if (checkInData?.roomNumber) {
        try {
          const data = await client.mutate({
            mutation: GET_MESSAGEBOX_URL,
            context: { clientName: 'integration_v7' },
            fetchPolicy: 'network-only',
            variables: {
              roomNo: checkInData?.roomNumber,
            },
          });
          setUrl(data?.data?.generateChatUrl?.url);
        } catch (err) {
          console.error(err);
        }
      } else {
        setUrl(
          'https://chatbot.getmymessage.co/login?l7pE1aXjORkCsHjSTC8F2McwnLG50IJS1VpUGtc3OSbHL3CcckTmYf0PcHwmkBphwv+It8r4AmHgtRWG0Zs8UDA9CwtrVCpVM5TQ2Gr+ef0=',
        );
      }
    })();
  });

  return (
    <>
      <Head>
        <title>
          {hotelName} | {t('Chat')}
        </title>
      </Head>
      <Header className={styles.header} displayHome screenTitle={t('Chat') as string} />
      <PageWrapper>
        {loader && <Loader />}
        {url && (
          <div className={styles.iframeWrapper}>
            <iframe
              title='chat'
              className={styles.chat}
              src={url}
              onLoad={() => setLoader(false)}
            />
          </div>
        )}
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'], i18nConfig)),
    },
  };
};

export default Chat;
