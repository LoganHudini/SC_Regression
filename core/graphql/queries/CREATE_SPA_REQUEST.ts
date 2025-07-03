import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const CREATE_SPA_BOOKING = gql`
  mutation createAppointment(
    $customerNotes: String
    $duration: Int!
    $requestType: String!
    $date: String!
    $treatmentId: String!
    $startTime: Int!
    $technicianId: Int!
    $firstName: String!
    $lastName: String!
    $emailAddress: String!
    $mobileNumber: String!
    $roomNo: String
    $genderPreference:String
  ) {
    createSpaAppointment(
      input: {
        customerNotes: $customerNotes
        duration: $duration
        hotelId: "${HOTEL_ID}"
        requestType: $requestType
        date: $date
        treatmentId: $treatmentId
        startTime: $startTime
        technicianId: $technicianId
        firstName: $firstName
        lastName: $lastName
        email: $emailAddress
        mobileNumber: $mobileNumber
        roomNo: $roomNo
        genderPreference: $genderPreference
        channel: "PWA"
      }
    ) {
      appointmentId
      conflictAppointmentId
      conflictSchedulerDate
      conflictServiceName
      conflictStartTime
      conflictStatusDescription
      conflictTechnicianName
      errorCode
      message
    }
  }
`;
