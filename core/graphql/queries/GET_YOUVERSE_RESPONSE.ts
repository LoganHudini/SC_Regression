import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export const GET_YOUVERSE_RESPONSE = gql`
    query GetYoonikResponse($docId:any, $confirmationId: string) {
        getyoonikresponse(docId: $docId,  confirmationId: $confirmationId)
        @rest(
          type: "GetYoonikResponsePayload"
          path: "/uat/kycdocstatus/{args.docId}/hotel/${HOTEL_ID}/info?confirmationId={args.confirmationId}"
          method: "GET"
        ) {
        errors
        data
        status
      }
    }
    `;
