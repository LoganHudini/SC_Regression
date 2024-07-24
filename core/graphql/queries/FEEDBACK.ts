import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const PostFeedback = gql`
query Feedback( $body: AddAccompanyDetailsPayload) {
  addAccompanyDetails(body: $body)
    @rest(
      type: "FeedbackPayload"
      path: "/v3/email/hotel/${HOTEL_ID}/feedback"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;
