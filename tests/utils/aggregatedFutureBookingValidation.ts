import { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { BaseApiHelper } from './BaseApiHelper';
import { ApiResponseError, ConfigurationError } from './errors/CustomErrors';

interface TestDataConfig {
  AGGREGATED_BOOKING_API_URL?: string;
  AUTH_BEARER_TOKEN?: string;
  HOTEL_ID?: string;
}

function loadTestData(): TestDataConfig {
  try {
    const dataPath = path.resolve(__dirname, '../testData.json');
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8')) as TestDataConfig;
    }
  } catch (error) {
    console.warn('Unable to load test data from tests/testData.json:', error);
  }

  return {};
}

export class AggregatedFutureBookingValidation extends BaseApiHelper {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async fetchAggregatedFutureBookingRaw(
    hotelId: string,
    recordType: string = 'arrival',
    noShow: boolean = true
  ): Promise<any> {
    const testData = loadTestData();
    const endpoint = testData.AGGREGATED_BOOKING_API_URL || '';

    if (!endpoint) {
      throw new ConfigurationError('AGGREGATED_BOOKING_API_URL is not configured', 'AGGREGATED_BOOKING_API_URL');
    }

    if (!hotelId) {
      throw new ConfigurationError('hotelId must be provided', 'hotelId');
    }

    const response = await this.request.post(
      endpoint,
      {
        headers: this.getHeaders(),
        data: this.buildGraphQlPayload(hotelId, recordType, noShow),
      },
    );

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new ApiResponseError(
        `Failed to fetch aggregated future booking: ${response.status()} - ${errorBody}`,
        response.status(),
        endpoint,
      );
    }

    return await response.json();
  }

  private buildGraphQlPayload(
    hotelId: string,
    recordType: string,
    noShow: boolean
  ): string {
    const query = `query GetAggregatedFutureBooking($fetchFromDb: String, $hotelId: String, $nextKey: String, $recordType: String, $searchQuery: String, $roomType: String, $status: String, $roomAssigned: String, $confirmationId: String, $firstName: String, $lastName: String, $toDate: String, $key: String, $value: String, $startDate: String, $endDate: String, $customDate: String, $noShow: Boolean) {
  getAggregatedFutureBookingGQL(
    input: {fetchFromDb: $fetchFromDb, hotelId: $hotelId, nextKey: $nextKey, recordType: $recordType, searchQuery: $searchQuery, search: {confirmationId: $confirmationId, firstName: $firstName, lastName: $lastName, toDate: $toDate, startDate: $startDate, endDate: $endDate}, filter: {roomType: $roomType, status: $status, roomAssigned: $roomAssigned, noShow: $noShow}, sort: {key: $key, value: $value}, customDate: $customDate}
  ) {
    hotelId
    arrivalList {
      accompanySignUpLoyalty
      arrivalTime
      channel
      checkInStatus
      comments
      computedReservationStatus
      confirmationId
      confirmationType
      details {
        adultGuestCount
        checkInDate
        checkOutDate
        childGuestCount
        hotelId
        hotel_name
        id
        nightCount
        totalGuestCount
        contactPerson {
          IdType
          addressOperaId
          email
          emailOperaId
          firstName
          id
          lastName
          phoneNumber
          phoneOperaId
          title
        }
        holdAmount {
          currency
          depositAmount
          holdAmount
        }
      }
      documentScan
      eregStatus
      guests {
        addressOperaId
        arabicName
        arrivalTime
        birthCountry
        birthPlace
        cityName
        code
        countryCode
        dob
        docImage {
          type
          value
        }
        docNo
        docType
        documentId
        documentStatus
        emails
        emailOperaId
        emirateCode
        expiry
        firstName
        gender
        guestType
        id
        idType
        incodeInterviewId
        isEregComplete
        issueCountry
        issueDate
        language
        lastName
        membershipNumber
        membershipType
        membershipLevel
        nationality
        otherAccessibilityType
        phone
        phoneCountryCode
        phoneOperaId
        placeOfIssue
        postalCode
        profession
        purposeOfVisit
        relationshipCode
        requiresAccessibility
        residenceCountryPhone
        stateProv
        title
        uaePhoneNumber
        uid
        vipCode
        vipDescription
        accessibilityTypes {
          code
        }
        addressLine2
        addressLine
      }
      houseKeepingStatus
      indicators {
        alerts
        fixedCharges
      }
      internalPaymentStatus
      isPreCheckedIn
      kyc
      mainMealPlanCode
      paymentStatus
      personalisation
      reservationId
      reservationStatus
      roomStatus
      signUpLoyalty
      source
      bookingSourceDesc
      specialInstructions
      tdStatus
      uniqueBookingId
      packages {
        amount
        code
        description
        name
        source
      }
      reservationComments {
        createDateTime
        id
        lastModifyDateTime
        note
        title
      }
      reservePayments {
        cardExpiryDate
        cardHolderName
        cardID
        cardNumber
        cardType
        lastFourDigits
        paymentType
        vaultedCardID
      }
      travelAgent {
        id
        name
      }
      roomType {
        blockCode
        blockId
        blockName
        code
        count
        currency
        name
        price
        ratePlan
        roomClass
        roomNumber
        roomRates {
          effectiveDate
          price
        }
        roomToChargeCode
        roomToChargeName
        roomToChargeShortName
        shortName
        suppressRate
        totalCharge
      }
      roomTypes {
        blockCode
        blockId
        blockName
        code
        count
        currency
        price
        name
        ratePlan
        roomClass
        roomNumber
        roomRates {
          effectiveDate
          price
        }
        roomToChargeCode
        roomToChargeName
        roomToChargeShortName
        shortName
        suppressRate
        totalCharge
      }
    }
    nextKey
    count
    roomTypeCodes
  }
}`;

    return JSON.stringify({
      operationName: 'GetAggregatedFutureBooking',
      variables: {
        fetchFromDb: 'yes',
        hotelId,
        recordType,
        noShow,
      },
      query,
    });
  }

  private getHeaders(): Record<string, string> {
    const testData = loadTestData();
    const authToken = (testData.AUTH_BEARER_TOKEN || '').trim();
    const normalizedToken = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;

    return {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      authorization: normalizedToken,
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
    };
  }
}

export class ValidateAggregatedFutureBooking {
  constructor(private request: APIRequestContext) {}

  async fetchAndSaveBookingResponse(
    hotelId: string,
    recordType: string = 'arrival',
    noShow: boolean = true
  ) {
    const api = new AggregatedFutureBookingValidation(this.request);
    
    // Fetch aggregated future booking API response
    const bookingResponse = await api.fetchAggregatedFutureBookingRaw(hotelId, recordType, noShow);

    // Save response to JSON file
    const outputDir = path.resolve(__dirname, '../api-responses');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'aggregated-future-booking-response.json'),
      JSON.stringify(bookingResponse, null, 2)
    );

    console.log('Aggregated future booking API response saved to api-responses directory');

    return bookingResponse;
  }
}
