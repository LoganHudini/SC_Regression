import { APIRequestContext, expect } from '@playwright/test';

export class FetchReservationApi {

    constructor(private request: APIRequestContext) { }

    async fetchReservationDetails(
        HOTEL_ID: string,
        CONFIRMATION_NUMBER: string
    ) {

        const response = await this.request.get(
            `https://ba582eqxd2.execute-api.ap-south-1.amazonaws.com/staging/booking/hotel/${HOTEL_ID}/details/${CONFIRMATION_NUMBER}?lastNameRequired=no&saveToDb=yes&fetchFromDb=yes`
        );

        expect(response.status()).toBe(200);

        const body = await response.json();
        return body.data;
    }
}