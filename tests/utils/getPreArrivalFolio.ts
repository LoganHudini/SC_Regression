import { APIRequestContext, expect } from '@playwright/test';
import { BaseApiHelper } from './BaseApiHelper';
import { ApiResponseError } from './errors/CustomErrors';

export interface PreArrivalFolioParams {
  hotelId: string;
  reservationId: string;
  bearerToken: string;
}

const GET_PRE_ARRIVAL_FOLIO_QUERY = `query GetPreArrivalFolio($hotelId: String!, $reservationId: String!) {
  getPreArrivalFolio(input: {hotelId: $hotelId, reservationId: $reservationId}) {
    hotelId
    reservationId
    summary {
      currencyCode
      deposit
      fixedCharges
      gross
      net
      outStandingCostOfStay
      totalCostOfStay
      details {
        summaryDate
        ratePlanCode
        net
        package
        gross
        tax
        revenue
        currencyCode
      }
    }
  }
}`;

export class GetPreArrivalFolio extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchPreArrivalFolio(params: PreArrivalFolioParams): Promise<any> {
    const { hotelId, reservationId, bearerToken } = params;

    if (!bearerToken) {
      throw new Error('bearerToken is required for pre-arrival folio API. Generate it using AuthenticateApi.fetchAuthToken()');
    }

    const payload = JSON.stringify({
      operationName: 'GetPreArrivalFolio',
      variables: { hotelId, reservationId },
      query: GET_PRE_ARRIVAL_FOLIO_QUERY,
    });

    const response = await this.request.post('https://vcfrckxvfbfzndsas5oqic6dje.appsync-api.ap-south-1.amazonaws.com/graphql', {
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
        'x-api-key': 'da2-enebtdhwubhzfjekvpy4u2ir3i',
      },
      data: payload,
    });

    console.log('Get Pre-Arrival Folio API Response Status Code=' + response.status());

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new ApiResponseError(
        `Failed to fetch pre-arrival folio: ${response.status()} - ${errorBody}`,
        response.status(),
        'https://vcfrckxvfbfzndsas5oqic6dje.appsync-api.ap-south-1.amazonaws.com/graphql',
      );
    }

    const responseBody = await response.json();
    await this.saveResponseToFile(responseBody, 'preArrivalFolio.json');
    return responseBody;
  }
}
