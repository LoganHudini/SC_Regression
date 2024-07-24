import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IPreSignDocUploadApiRequest {
  groupId: string;
  type: string;
  propertyType: string;
  confirmationId: string;
  filename: string;
  contentType: string;
  contentLength: 8196;
  body: null;
  contents: string;
  isDocUpload: boolean;
}
export interface IPreSignDocUploadApiResponse {
  preSignDocUpload: {
    status: string;
    data: {
      method: string;
      url: string;
      key: string;
      headers: {
        'Content-Type': string[];
        Expires: string[];
        Host: string[];
        'X-Amz-Acl': string[];
        'X-Amz-Meta-Filename': string[];
        'X-Amz-Server-Side-Encryption': string[];
      };
    };
  };
}

export const PRE_SIGN_DOC_UPLOAD = gql`
query InitiatePayment( $body: IInitiatePaymentApiRequest, $confirmationNumber: String) {
    preSignDocUpload(body: $body, confirmationNumber: $confirmationNumber)
    @rest(
      type: "PreSignDocUploadPayload"
      path: "/hotels/${HOTEL_ID}/reservations/{args.confirmationNumber}/pre-sign-doc-upload"
      method: "POST"
      bodyKey: "body"
    ) {
    errors
    data
    status
  }
}
`;
