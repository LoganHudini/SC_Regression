import { gql } from '@apollo/client';

export interface IGetActivityCategoriesApiResponse {
  getActivityCategories: {
    data: {
      categoryCode: string;
      createdAt: string;
      createdBy: string;
      hotelId: string;
      id: string;
      isActive: boolean;
      name: string;
      customAttributes: {
        key: string;
        value: string;
      }[];
      updatedAt: string;
      updatedBy: string;
      images: {
        fileName: string;
        index: number;
        master: string;
        ratio16to9: string;
        ratio1to1: string;
        ratio21to9: string;
        ratio9to16: string;
        ratio9to21: string;
      }[];
    }[];
  };
}

export const GET_ITINERARY = gql`
  query MyQuery(
    $arrivalDate: String
    $hotelId: String!
    $firstName: String
    $lastName: String
    $confirmationId: String!
    $limit: Int
    $activityBookingId: String
    $departureDate: String
    $pageToken: String
  ) {
    getGuestActivityBookings(
      input: {
        hotelId: $hotelId
        activityBookingId: $activityBookingId
        arrivalDate: $arrivalDate
        departureDate: $departureDate
        firstName: $firstName
        lastName: $lastName
        confirmationId: $confirmationId
        limit: $limit
        pageToken: $pageToken
      }
    ) {
      guests {
        room
        reservationId
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
    }
  }
`;

export const GET_ITINERARY_ALL = gql`
  query getItineraries(
    $reservationId: String!
    $hotelId: String!
    $confirmationId: String
    $roomNo: String
    $checkInTime: String!
    $checkOutTime: String!
    $lastName: String!
  ) {
    getItineraries(
      input: {
        reservationId: $reservationId
        hotelId: $hotelId
        confirmationId: $confirmationId
        roomNo: $roomNo
        checkInTime: $checkInTime
        checkOutTime: $checkOutTime
        lastName: $lastName
      }
    ) {
      itineraries {
        itineraryType
        itineraryId
        itineraryName
        description
        categoryId
        categoryName
        bookingId
        venue
        tags
        status
        slotId
        seats
        priceType
        location
      }
    }
  }
`;
