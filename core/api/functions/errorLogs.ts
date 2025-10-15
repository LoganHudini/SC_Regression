import { client } from 'core/graphql/client';
import { logErrors } from 'core/graphql/queries/LOG_ERRORS';
import { getHotelId } from 'utils/fetchConfigs';

export const logError = async (
  code?: any,
  message?: any,
  page?: any,
  api?: any,
  confirmationId?: any,
) => {
  try {
    const hotelId = getHotelId();
    await client.query({
      query: logErrors,
      context: { clientName: 'rest' },
      variables: {
        body: {
          hotelId: hotelId,
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
