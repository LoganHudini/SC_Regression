import { APIRequestContext, expect } from '@playwright/test';
import { BaseApiHelper } from './BaseApiHelper';
import { ApiResponseError } from './errors/CustomErrors';
import { loadTestData } from './testData';

export class AuthenticateApi extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchAuthToken(options?: {
    hotelId?: string;
    confirmationId?: string;
    lastName?: string;
    type?: string;
  }): Promise<string> {
    const testData = loadTestData();
    const hotelId = options?.hotelId ?? testData.HOTEL_ID ?? process.env.HOTEL_ID;
    const confirmationId =
      options?.confirmationId ??
      testData.CONFIRMATION_NUMBER ??
      process.env.CONFIRMATION_NUMBER;
    const lastName = options?.lastName ?? testData.LAST_NAME ?? process.env.LAST_NAME;
    const type = options?.type ?? 'CHECK_IN';

    if (!hotelId) {
      throw new Error('hotelId is required for authenticate API. Set HOTEL_ID in testData.json or env.');
    }
    if (!confirmationId) {
      throw new Error(
        'confirmationId is required for authenticate API. Set CONFIRMATION_NUMBER in testData.json or env.',
      );
    }
    if (!lastName) {
      throw new Error('lastname is required for authenticate API. Set LAST_NAME in testData.json or env.');
    }

    const url = 'https://ba582eqxd2.execute-api.ap-south-1.amazonaws.com/staging/authenticate';
    const payload = {
      confirmationId: confirmationId.trim(),
      lastname: lastName,
      hotelId,
      type,
    };

    const response = await this.request.post(url, {
      headers: {
        accept: 'application/json',
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
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      },
      data: JSON.stringify(payload),
    });

    const responseBody = await response.json();
    await this.saveResponseToFile(responseBody, 'authenticate-response.json');

    if (!response.ok()) {
      throw new ApiResponseError(
        `Failed to authenticate: ${response.status()} - ${JSON.stringify(responseBody)}`,
        response.status(),
        url,
      );
    }

    const token = this.extractToken(responseBody);
    if (!token) {
      throw new Error(`Authentication succeeded but token was not found in response: ${JSON.stringify(responseBody)}`);
    }

    return token;
  }

  private extractToken(responseBody: any): string | null {
    if (!responseBody || typeof responseBody !== 'object') return null;
    if (typeof responseBody.token === 'string') return responseBody.token;
    if (responseBody.data && typeof responseBody.data.token === 'string') return responseBody.data.token;
    if (responseBody.accessToken && typeof responseBody.accessToken === 'string') return responseBody.accessToken;
    return null;
  }
}
