import { APIRequestContext, expect } from '@playwright/test';
import { BaseApiHelper } from './BaseApiHelper';
import { ApiResponseError } from './errors/CustomErrors';

export interface HotelPreferencesParams {
  hotelId: string;
  bearerToken: string;
  lang?: string;
}

const GET_HOTEL_PREFERENCES_QUERY = `query getHotelPreferences($hotelId: String!, $lang: String) {
  getHotelPreferences(input: {hotelId: $hotelId, lang: $lang}) {
    code
    createdAt
    createdBy
    customAttributes {
      key
      value
    }
    description
    hotelId
    id
    isActive
    allowMultipleSelection
    name
    preferenceItems {
      code
      description
      isActive
      name
    }
    updatedAt
    updatedBy
    version
  }
}`;

export class GetHotelPreferences extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchHotelPreferences(params: HotelPreferencesParams): Promise<any> {
    const { hotelId, bearerToken, lang = 'en' } = params;

    if (!bearerToken) {
      throw new Error('bearerToken is required for hotel preferences API. Generate it using AuthenticateApi.fetchAuthToken()');
    }

    const payload = JSON.stringify({
      operationName: 'getHotelPreferences',
      variables: { hotelId, lang },
      query: GET_HOTEL_PREFERENCES_QUERY,
    });

    const response = await this.request.post('https://rn6kznjopzgshgwcp7picsxzia.appsync-api.ap-south-1.amazonaws.com/graphql', {
      headers: {
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
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        'x-api-key': 'da2-3ci2gv3dcre5xiad7eaorn3kum',
      },
      data: payload,
    });

    console.log('Get Hotel Preferences API Response Status Code=' + response.status());

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new ApiResponseError(
        `Failed to fetch hotel preferences: ${response.status()} - ${errorBody}`,
        response.status(),
        'https://rn6kznjopzgshgwcp7picsxzia.appsync-api.ap-south-1.amazonaws.com/graphql',
      );
    }

    const responseBody = await response.json();
    await this.saveResponseToFile(responseBody, 'hotelPreferences.json');
    return responseBody;
  }
}
