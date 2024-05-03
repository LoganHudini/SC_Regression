import { gql } from '@apollo/client';

export const GET_SLOT_DETAILS = gql`
  query MyQuery(
    $date: String!
    $hotelId: String!
    $startTime: Int
    $duration: Int
    $requestType: String!
    $treatmentId: String!
    $spaCode: String
    $startDate: String
  ) {
    getSpaSlotAvailability(
      input: {
        date: $date
        hotelId: $hotelId
        startTime: $startTime
        duration: $duration
        requestType: $requestType
        treatmentId: $treatmentId
        spaCode: $spaCode
        startDate: $startDate
      }
    ) {
      availabilitySlots {
        employeesId
        endDateTime
        startDateTime
      }
      duration
      endDateTime
      facilityId
      firstName
      gender
      lastName
      price
      startDateTime
      staffId
      startTime
      technicianId
      treatmentId
    }
  }
`;
