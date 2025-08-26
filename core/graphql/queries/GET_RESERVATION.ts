import { gql } from '@apollo/client';
import { FETCH_FROM_DB, HOTEL_ID, SAVE_TO_DB } from '../endpoints';

export interface IGetReservationApiResponse {
  getReservation: {
    status: string;
    data: {
      reservationId: string;
      uniqueBookingId: string;
      confirmationId: string;
      accountId: string;
      confirmationType: string;
      reservationStatus: string;
      paymentAmount?: string;
      details: {
        id: string;
        hotelId: string;
        hotel_name: string;
        contactPerson: {
          id: string;
          IdType: string;
          email: string;
          firstName: string;
          lastName: string;
          title: string;
          phoneNumber: string;
          emailOperaId: string;
          phoneOperaId: string;
          addressOperaId: string;
          docType: string;
          docNo: string;
          eta: string;
          etd: string;
        };
        checkInDate: string;
        checkOutDate: string;
        nightCount: number;
        adultGuestCount: number;
        childGuestCount: number;
        totalGuestCount: number;
        holdAmount: {
          holdAmount: number;
          currency: string;
          depositAmount: number;
        };
      };
      paymentRule: any;
      roomTypes: {
        roomNumber: string;
        code: string;
        name: string;
        shortName: string;
        count: number;
        price: string;
        totalCharge: string;
        balance: string;
      }[];
      reservePayments: {
        paymentType: string;
        cardType: string;
        cardNumber: string;
        cardHolderName: string;
        cardExpiryDate: string;
      }[];
      guarantees: {
        guaranteeType: string;
        cardNumber: string;
        cardHolderName: string;
        cardExpiryDate: string;
      }[];
      settlementTypes: {
        code: string;
        name: string;
        description: string;
      }[];
      guests: {
        arrivalTime: string;
        departureTime: string;
        firstName: string;
        lastName: string;
        title: string;
        gender: string;
        nationality: string;
        emails: string[];
        emailOperaId: string[];
        id: string;
        id_type: string;
        phone: string[];
        phoneOperaId: string[];
        arrivalTransport: string;
        departureTransport: string;
        addressLine: string;
        cityName: string;
        stateProv: string;
        countryCode: string;
        postalCode: string;
        addressOperaId: string;
        docNo: string;
        docType: string;
      }[];
      packages: {
        code: string;
        name: string;
        description: string;
      }[];
      reservationAddonItems: null;
      arrivalFlightCode: string;
      departureFlightCode: string;
      mainMealPlanCode: string;
      isPreCheckedIn: boolean;
      cashierNotes: string[];
      dateOfIssue: string;
      nights: string;
      membershipNumber: string;
      company: string;
    };
  };
}

export const GET_AUTHENTICATION = gql`
  query GetReservation($body: GetAuthenticationPayload) {
    getAuthentication(body: $body)
      @rest(
        type: "GetAuthenticationPayload"
        path: "/authenticate"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;

export const GET_RESERVATION = gql`
  query GetReservation($confirmationNumber: String, $lastName: String, $hotelId: String) {
    getReservation(confirmationNumber: $confirmationNumber, lastName: $lastName, hotelId: $hotelId)
      @rest(
        type: "GetReservationPayload"
        path: "/booking/hotel/{args.hotelId}/details/{args.confirmationNumber}?lastName={args.lastName}&arrivalDateRequired=no&fetchFromDb=${FETCH_FROM_DB}&saveToDb=${SAVE_TO_DB}&channel=PWA"
      ) {
      errors
      data
      status
    }
  }
`;

export const GET_RESERVATION_STATUS = gql`
  query GetReservation( $roomNo: String, $lastName: String) {
    getReservation(roomNo: $roomNo, lastName: $lastName)
      @rest(
        type: "GetReservationPayload"
        path: "/v7/booking/hotel/${HOTEL_ID}/reservationStatus/na?lastName={args.lastName}&roomNo={args.roomNo}&arrivalDateRequired=no&fetchFromDb=${FETCH_FROM_DB}&saveToDb=${SAVE_TO_DB}"
      ) {
      errors
      data
      status
    }
  }
`;
