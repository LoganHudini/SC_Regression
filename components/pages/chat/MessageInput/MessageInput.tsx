import React, { useCallback, useState } from 'react';
import styles from './MessageInput.module.scss';
import SendMessageIcon from '@icons/sendMessage.svg';
import { useTranslation } from 'react-i18next';
import { IMessageInputProps } from './MessageInput.types';
import { ApolloError, useMutation } from '@apollo/client';
import { SEND_MESSAGE } from 'core/graphql/queries/SEND_MESSAGE';
import { processError } from 'utils/processError';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

export const MessageInput: React.FC<IMessageInputProps> = ({
  threadId,
  refreshMessages,
  guestId,
  sendMessage,
}) => {
  const { t } = useTranslation(['chat', 'common']);

  const [sendMessageRequest] = useMutation(SEND_MESSAGE, { context: { clientName: 'messages' } });

  const [message, setMessage] = useState('');

  const onMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage('');
      try {
        const messagePayload = {
          body: message,
          created: dayjs().toString(),
          direction: 'outgoing',
          id: uuidv4(),
          updated: dayjs().toString(),
          threadId: threadId as string,
        };
        sendMessage(messagePayload);
        await sendMessageRequest({ variables: { body: message, threadId, guestId } });
        await refreshMessages();
      } catch (error) {
        processError(t, error as ApolloError);
      }
    },
    [guestId, message, refreshMessages, sendMessage, sendMessageRequest, t, threadId],
  );

  return (
    <form onSubmit={handleSubmit} className={styles.wrapper}>
      <input
        value={message}
        onChange={onMessageChange}
        placeholder={t('Type your message') as string}
        className={styles.input}
      />
      <button disabled={!guestId} type='submit' className={styles.sendMessageButton}>
        <SendMessageIcon />
      </button>
    </form>
  );
};
