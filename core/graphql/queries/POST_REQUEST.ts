import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export const PostRequest = gql`
query postRequest( $body: AddAccompanyDetailsPayload) {
  postRequest(body: $body)
    @rest(
      type: "RequestPayload"
      path: "/${ENVIRONMENT}/guestRequest/hotel/${HOTEL_ID}/request"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;
