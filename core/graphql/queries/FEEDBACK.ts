import { gql } from '@apollo/client';

export const PostFeedback = gql`
  query Feedback($body: AddAccompanyDetailsPayload, $hotelId: String) {
    addAccompanyDetails(body: $body, hotelId: $hotelId)
      @rest(
        type: "FeedbackPayload"
        path: "/v3/email/hotel/{args.hotelId}/feedback"
        method: "POST"
        bodyKey: "body"
      ) {
      errors
      data
      status
    }
  }
`;
