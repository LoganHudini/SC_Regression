import { APIRequestContext, expect } from '@playwright/test';
import { BaseApiHelper } from './BaseApiHelper';
import { loadTestData } from './testData';

export class FetchReservationApi extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchReservationDetails(HOTEL_ID: string, CONFIRMATION_NUMBER: string) {
    const response = await this.request.get(
      `https://ba582eqxd2.execute-api.ap-south-1.amazonaws.com/staging/booking/hotel/${HOTEL_ID}/details/${CONFIRMATION_NUMBER}?lastNameRequired=no&saveToDb=yes&fetchFromDb=yes`,
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    const data = body?.data ?? body;

    let normalizedData;
    if (Array.isArray(data)) {
      normalizedData = data.map((item) => this.normalizeRecord(item));
    } else {
      normalizedData = this.normalizeRecord(data);
    }

    await this.saveResponseToFile(normalizedData, 'fetchReservation.json');
    return normalizedData;
  }

  private normalizeRecord(record: any): any {
    if (!record || typeof record !== 'object') {
      return record;
    }

    const normalized: Record<string, any> = {};

    for (const [key, value] of Object.entries(record)) {
      if (Array.isArray(value)) {
        normalized[key] = value.map((item) => this.normalizeRecord(item));
      } else if (value && typeof value === 'object') {
        normalized[key] = this.normalizeRecord(value);
      } else {
        normalized[key] = value;
      }
    }

    return normalized;
  }
}
