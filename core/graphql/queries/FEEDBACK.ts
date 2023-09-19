import { gql } from '@apollo/client';
import { ENVIRONMENT, HOTEL_ID } from '../endpoints';

export const PostFeedback = gql`
query Feedback( $body: AddAccompanyDetailsPayload) {
  addAccompanyDetails(body: $body)
    @rest(
      type: "FeedbackPayload"
      path: "/${ENVIRONMENT}/v3/email/hotel/${HOTEL_ID}/feedback"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;
