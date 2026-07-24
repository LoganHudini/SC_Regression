import { APIRequestContext } from '@playwright/test';
import * as CryptoJS from 'crypto-js';
import { BaseApiHelper } from './BaseApiHelper';
import { ApiResponseError, ConfigurationError, DecryptionError } from './errors/CustomErrors';
import { AppConfiguration, AppConfigurationApiResponse } from './types/interfaces';
import { loadTestData } from './testData';

const LIST_APP_CONFIGURATIONS_QUERY = `query listAppConfigurationsQuery($hotelId: String!) {
  listAppConfigurations(input: {hotelId: $hotelId}) {
    id
    type
    configuration
    createdAt
    createdBy
    hotelId
    description
    name
    updatedBy
    updatedAt
    userName
  }
}`;

export class FetchAppConfiguration extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchAndSaveConfiguration(): Promise<AppConfiguration> {
    const testData = loadTestData();
    const hotelId = testData.HOTEL_ID || process.env.hotelId;
    const apiKey = testData.APP_CONFIG_API_KEY || process.env.APP_CONFIG_API_KEY || 'da2-bywwabawibgmzajkze4qj57xze';
    const secretKey = testData.NEXT_PUBLIC_SECRET_KEY || process.env.NEXT_PUBLIC_SECRET_KEY;

    if (!hotelId) {
      throw new ConfigurationError('hotelId must be set in testData.json or .env', 'hotelId');
    }
    if (!apiKey) {
      throw new ConfigurationError('APP_CONFIG_API_KEY must be set in testData.json or .env', 'APP_CONFIG_API_KEY');
    }
    if (!secretKey) {
      throw new ConfigurationError('NEXT_PUBLIC_SECRET_KEY must be set in testData.json or .env', 'NEXT_PUBLIC_SECRET_KEY');
    }

    const payload = JSON.stringify({
      operationName: 'listAppConfigurationsQuery',
      variables: { hotelId },
      query: LIST_APP_CONFIGURATIONS_QUERY,
    });

    const response = await this.request.post('https://aevntsl5nbbktmjv6otsfn3dcu.appsync-api.ap-south-1.amazonaws.com/graphql', {
      headers: {
        accept: '*/*',
        'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
        channel: 'STAFF_CONNECT',
        'content-type': 'application/json',
        origin: 'https://staff-copilot.hudinielevate-stage.io',
        priority: 'u=1, i',
        referer: 'https://staff-copilot.hudinielevate-stage.io/',
        'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        'x-api-key': apiKey,
      },
      data: payload,
    });

    console.log('Fetch App Configuration API Response Status Code=' + response.status());

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new ApiResponseError(
        `Failed to fetch app configuration: ${response.status()} - ${errorBody}`,
        response.status(),
        'https://aevntsl5nbbktmjv6otsfn3dcu.appsync-api.ap-south-1.amazonaws.com/graphql',
      );
    }

    const responseBody: AppConfigurationApiResponse = await response.json();
    const encryptedConfig = responseBody?.data?.listAppConfigurations?.[5]?.configuration;

    if (!encryptedConfig) {
      throw new ConfigurationError(`Configuration not found in response: ${JSON.stringify(responseBody)}`, 'configuration');
    }

    const decryptedConfig = this.decryptData(encryptedConfig, secretKey);

    if (!decryptedConfig) {
      throw new DecryptionError('Failed to decrypt configuration — verify NEXT_PUBLIC_SECRET_KEY is correct');
    }

    await this.saveResponseToFile(decryptedConfig, 'Staff_app_configuration.json');

    console.log('App configuration fetched, decrypted, and saved to Staff_app_configuration.json');
    return decryptedConfig;
  }

  private decryptData(encryptedData: string, secretKey: string): AppConfiguration | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  }
}
