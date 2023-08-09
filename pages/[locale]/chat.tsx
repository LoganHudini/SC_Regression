import { IncomingMessage } from 'components/pages/chat/IncomingMessage/IncomingMessage';
import { MessageInput } from 'components/pages/chat/MessageInput/MessageInput';
import { OutgoingMessage } from 'components/pages/chat/OutgoingMessage/OutgoingMessage';
import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import Head from 'next/head';
import React, { useCallback, useEffect, useState } from 'react';
import styles from '../../styles/chat/chat.module.scss';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { GET_MESSAGES, IGetMessagesApiResponse, IMessage } from 'core/graphql/queries/GET_MESSAGES';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getStaticPaths } from 'utils/getStatic';
import { IncomingMessagePlaceholder } from 'components/pages/chat/IncomingMessagePlaceholder/IncomingMessagePlaceholder';
import { OutgoingMessagePlaceholder } from 'components/pages/chat/OutgoingMessagePlaceholder/OutgoingMessagePlaceholder';
import {
  IGetReservationApiResponse,
  GET_RESERVATION_NO_LAST_NAME,
} from 'core/graphql/queries/GET_RESERVATION';
import { useCheckedIn } from 'storage/check-in.storage';
import dayjs from 'dayjs';
import { IHamburgerProps, getHamburgerProps } from 'utils/hamburger/getHamburgerProps';
export { getStaticPaths };

const Chat: React.FC<IHamburgerProps> = ({ hamburger, pages }) => {
  const { t } = useTranslation('chat');

  const checkedInData = useCheckedIn();

  const [messages, setMessages] = useState<IMessage[]>([]);

  const { data: reservationData, loading: reservationLoading } =
    useQuery<IGetReservationApiResponse>(GET_RESERVATION_NO_LAST_NAME, {
      context: { clientName: 'rest' },
      variables: {
        confirmationNumber: checkedInData.reservationId,
      },
      skip: !checkedInData.reservationId,
    });

  const reservationInfo = reservationData?.getReservation.data;

  const {
    data,
    refetch,
    loading: messagesLoading,
  } = useQuery<IGetMessagesApiResponse>(GET_MESSAGES, {
    context: { clientName: 'messages' },
    variables: {
      email: reservationInfo?.details.contactPerson.email,
      firstName: reservationInfo?.details.contactPerson.firstName,
      lastName: reservationInfo?.details.contactPerson.lastName,
    },
    fetchPolicy: 'network-only',
    skip: !reservationInfo,
    pollInterval: 15000,
  });

  const loading = reservationLoading || messagesLoading;

  useEffect(() => {
    setMessages(
      data?.getChatMessages
        ?.slice()
        .sort((a, b) => (dayjs(a.updated).isAfter(dayjs(b.updated)) ? -1 : 1)) || [],
    );
  }, [data?.getChatMessages]);

  const sendMessage = useCallback(
    (message: IMessage) => {
      setMessages(
        [...messages, message]
          .slice()
          .sort((a, b) => (dayjs(a.updated).isAfter(dayjs(b.updated)) ? -1 : 1)),
      );
    },
    [messages],
  );

  const threadId = data?.getChatMessages[0].threadId;
  const guestEmail = reservationInfo?.details.contactPerson.email;

  return (
    <>
      <Head>
        <title>{t('Live Chat')}</title>
      </Head>
      <Header screenTitle={t('Live Chat') as string} />
      <PageWrapper className={styles.wrapper} displayBottomMenu hamburger={hamburger} pages={pages}>
        <div className={styles.messagesWrapper}>
          {loading ? (
            <>
              <IncomingMessagePlaceholder />
              <OutgoingMessagePlaceholder />
              <IncomingMessagePlaceholder />
              <OutgoingMessagePlaceholder />
              <IncomingMessagePlaceholder />
              <OutgoingMessagePlaceholder />
              <IncomingMessagePlaceholder />
            </>
          ) : (
            <>
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  {message.direction === 'outgoing' ? (
                    <OutgoingMessage body={message.body} createdAt={message.created} />
                  ) : (
                    <IncomingMessage body={message.body} createdAt={message.created} />
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
        <MessageInput
          sendMessage={sendMessage}
          refreshMessages={refetch}
          threadId={threadId}
          guestId={guestEmail}
        />
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;
  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['chat', 'common'], i18nConfig)),
      ...(await getHamburgerProps()),
    },
  };
};

export default Chat;
