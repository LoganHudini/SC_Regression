import { client } from 'core/graphql/client';
import { HOTEL_ID } from 'core/graphql/endpoints';
import { logErrors } from 'core/graphql/queries/LOG_ERRORS';

export const logError = async (
  code?: any,
  message?: any,
  page?: any,
  api?: any,
  confirmationId?: any,
) => {
  try {
    await client.query({
      query: logErrors,
      context: { clientName: 'rest' },
      variables: {
        body: {
          hotelId: HOTEL_ID as string,
          severity: 'ERROR',
          channel: 'PWA',
          message: `{
            code: ${code || (message === 'Failed to fetch' ? 'CORS' : '') || ''}, message: ${
            message || ''
          }, page: ${page}, api: ${api}, confirmationId: ${confirmationId}
        }`,
        },
      },
      fetchPolicy: 'no-cache',
    });
  } catch {
    console.error('logging error');
    return;
  }
};
