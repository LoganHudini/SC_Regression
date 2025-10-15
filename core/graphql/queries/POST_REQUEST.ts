import { gql } from '@apollo/client';

export const POST_REQUEST = gql`
  query postRequest($body: AddAccompanyDetailsPayload, $hotelId: String) {
    postRequest(body: $body, hotelId: $hotelId)
      @rest(
        type: "RequestPayload"
        path: "/guestRequest/hotel/{args.hotelId}/request"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;
