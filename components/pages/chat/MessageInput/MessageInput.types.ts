import { IMessage } from 'core/graphql/queries/GET_MESSAGES';

export interface IMessageInputProps {
  threadId?: string;
  guestId?: string;
  sendMessage: (message: IMessage) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshMessages: () => Promise<any>;
}
