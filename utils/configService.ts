import { makeVar, gql } from '@apollo/client';
import { decryptData } from './crypto';
import { configErrorVar } from './configState';

export const configurationVar = makeVar<any[]>([]);

export const loadConfiguration = async (pwaURLCode: string): Promise<void> => {
  if (!pwaURLCode) return;
  const hotelId = pwaURLCode;

  const LIST_APP_CONFIG = gql`
    query listAppConfigurations($hotelId: String!, $pwaURLCode: String!, $channelType: String!) {
      listAppConfigurations(
        input: { hotelId: $hotelId, pwaURLCode: $pwaURLCode, channelType: $channelType }
      ) {
        configuration
      }
    }
  `;

  try {
    const { client } = await import('core/graphql/client');
    const { data: result }: any = await client.query({
      query: LIST_APP_CONFIG,
      variables: {
        hotelId,
        pwaURLCode,
        channelType: 'PWA',
      },
      context: {
        clientName: 'property_g',
      },
    });

    const configsArray = result?.listAppConfigurations as Array<{ configuration: any }> | undefined;
    const configData = Array.isArray(configsArray) ? configsArray[0]?.configuration : undefined;

    if (!configData) {
      configErrorVar('api-fail');
      return;
    }

    // encrypted or plain JSON
    let parsedConfig: any;
    try {
      parsedConfig = typeof configData === 'string' ? JSON.parse(configData) : configData;
    } catch {
      // Attempt to decrypt then parse
      const decrypted = decryptData(configData);
      parsedConfig = decrypted;
    }

    if (parsedConfig && !parsedConfig.hotelId) {
      parsedConfig.hotelId = hotelId;
    }
    const configArray = Array.isArray(parsedConfig) ? parsedConfig : [parsedConfig];
    configurationVar(configArray);
    configErrorVar(undefined);
  } catch (err) {
    configErrorVar('api-fail');
  }
};
