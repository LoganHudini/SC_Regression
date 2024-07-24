import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const POST_REQUEST = gql`
query postRequest( $body: AddAccompanyDetailsPayload) {
  postRequest(body: $body)
    @rest(
      type: "RequestPayload"
      path: "/guestRequest/hotel/${HOTEL_ID}/request"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;
