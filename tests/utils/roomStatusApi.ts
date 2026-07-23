import { APIRequestContext, expect } from '@playwright/test';
import { BaseApiHelper } from './BaseApiHelper';

export interface RoomStatusParams {
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  confirmationId: string;
  lastName: string;
  bearerToken: string;
}

export class RoomStatusApi extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchRoomStatus(params: RoomStatusParams): Promise<any> {
    const { hotelId, checkInDate, checkOutDate, confirmationId, lastName, bearerToken } = params;

    if (!bearerToken) {
      throw new Error('bearerToken is required for room status API. Generate it using AuthenticateApi.fetchAuthToken()');
    }

    const url = `https://api.hudinielevate-stage.io/booking/hotel/${encodeURIComponent(
      hotelId,
    )}/floor/any/rooms/status?checkInDate=${encodeURIComponent(checkInDate)}&checkOutDate=${encodeURIComponent(
      checkOutDate,
    )}&confirmationId=${encodeURIComponent(confirmationId)}&lastName=${encodeURIComponent(lastName)}`;

    const headers: Record<string, string> = {
      accept: '*/*',
      'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
      authorization: `Bearer ${bearerToken}`,
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
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    };

    const response = await this.request.get(url, { headers });

    expect(response.status()).toBe(200);

    const body = await response.json();
    await this.saveResponseToFile(body, 'roomStatus.json');
    return body;
  }
}
