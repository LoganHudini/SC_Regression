import { APIRequestContext, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { BaseApiHelper } from './BaseApiHelper';
import { loadTestData } from './testData';

export interface Activity {
  activityId: string;
  bookingId: string;
  categoryId: string;
  location: string;
  priceType: string;
  seats: number;
  slotId: string;
  status: string;
  venue: string;
}

export interface GuestActivityBooking {
  room: string;
  confirmationId: string;
  nationality: string;
  mobile: string;
  lastName: string;
  hotelId: string;
  gender: string;
  firstName: string;
  email: string;
  dob: string;
  departureDate: string;
  country: string;
  arrivalDate: string;
  activities: Activity[];
}

export interface GetGuestActivityBookingsQueryVariables {
  hotelId: string;
  confirmationId?: string;
  arrivalDate: string;
  departureDate?: string;
  firstName?: string;
  lastName?: string;
  searchText?: string;
  sort?: string;
  limit: number;
  pageToken?: string;
}

export interface GuestActivityBookingsData {
  getGuestActivityBookings: {
    guests: GuestActivityBooking[];
    nextToken: string | null;
    currentPage: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface GuestActivityBookingResponse {
  data: GuestActivityBookingsData;
}

export interface GuestActivityBookingParams {
  hotelId: string;
  apiKey?: string;
  bearerToken?: string;
  arrivalDate: string;
  confirmationId?: string;
  departureDate?: string;
  firstName?: string;
  lastName?: string;
  searchText?: string;
  sort?: string;
  limit?: number;
  pageToken?: string;
  apiUrl?: string;
}

const GET_GUEST_ACTIVITY_BOOKINGS_QUERY = `query getGuestActivityBookings($hotelId: String!, $confirmationId: String, $arrivalDate: String, $departureDate: String, $firstName: String, $lastName: String, $searchText: String, $sort: String, $limit: Int, $pageToken: String) {
  getGuestActivityBookings(
    input: {hotelId: $hotelId, confirmationId: $confirmationId, arrivalDate: $arrivalDate, departureDate: $departureDate, firstName: $firstName, lastName: $lastName, searchText: $searchText, sort: $sort, limit: $limit, pageToken: $pageToken}
  ) {
    guests {
      room
      confirmationId
      nationality
      mobile
      lastName
      hotelId
      gender
      firstName
      email
      dob
      departureDate
      country
      arrivalDate
      activities {
        activityId
        bookingId
        categoryId
        location
        priceType
        seats
        slotId
        status
        venue
      }
    }
    nextToken
    currentPage
    totalRecords
    totalPages
  }
}`;

export class GetGuestActivityBookings extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchGuestActivityBookings(params: GuestActivityBookingParams): Promise<GuestActivityBookingResponse> {
    const {
      hotelId,
      apiKey,
      bearerToken,
      arrivalDate,
      confirmationId = '',
      departureDate = '',
      firstName = '',
      lastName = '',
      searchText = '',
      sort = '',
      limit = 0,
      pageToken = '',
      apiUrl,
    } = params;

    const testData = loadTestData();
    const endpoint = apiUrl || testData.AGGREGATED_BOOKING_API_URL || 'https://dbbaobb5gfbvbjd3twuw47hypq.appsync-api.ap-south-1.amazonaws.com/graphql';

    const authKey = apiKey || testData.API_KEY || bearerToken || testData.AUTH_BEARER_TOKEN;
    
    if (!authKey) {
      throw new Error('API key or bearer token is required for guest activity bookings API. Set API_KEY or AUTH_BEARER_TOKEN in env or test data.');
    }

    const useApiKey = apiKey || testData.API_KEY;
    const headers: Record<string, string> = {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      channel: 'STAFF_CONNECT',
      'content-type': 'application/json',
      origin: 'https://staff-copilot.hudinielevate-stage.io',
      priority: 'u=1, i',
      referer: 'https://staff-copilot.hudinielevate-stage.io/',
      'sec-ch-ua': '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    };

    if (useApiKey) {
      headers['x-api-key'] = authKey.trim();
      console.log('Using x-api-key header with API key:', authKey.substring(0, 50) + '...');
    } else {
      const normalizedToken = authKey.trim().startsWith('Bearer ')
        ? authKey.trim()
        : `Bearer ${authKey.trim()}`;
      headers['Authorization'] = normalizedToken;
      console.log('Using Authorization header with Bearer token:', normalizedToken.substring(0, 50) + '...');
    }

    const requestBody = JSON.stringify({
      operationName: 'getGuestActivityBookings',
      variables: {
        hotelId,
        confirmationId,
        arrivalDate,
        departureDate,
        firstName,
        lastName,
        searchText,
        sort,
        limit,
        pageToken,
      } as GetGuestActivityBookingsQueryVariables,
      query: GET_GUEST_ACTIVITY_BOOKINGS_QUERY,
    });

    const response = await this.request.post(endpoint, {
      headers,
      data: requestBody,
    });

    const responseText = await response.text();
    
    if (!response.ok()) {
      console.error('API Error Response:', responseText);
      throw new Error(`Guest activity bookings API failed with status ${response.status()}: ${responseText}`);
    }

    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse API response as JSON:', responseText);
      throw new Error(`Failed to parse API response as JSON: ${e}`);
    }
    
    await this.saveResponseToFile(responseBody, 'guestActivityBookings.json');

    return responseBody as GuestActivityBookingResponse;
  }
}
