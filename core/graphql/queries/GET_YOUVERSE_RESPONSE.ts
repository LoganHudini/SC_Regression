import { gql } from '@apollo/client';

export const GET_YOUVERSE_RESPONSE = gql`
  query GetYoonikResponse($docId: any, $confirmationId: string) {
    getyoonikresponse(docId: $docId, confirmationId: $confirmationId)
      @rest(
        type: "GetYoonikResponsePayload"
        path: "/kycdocstatus/{args.docId}/hotel/53c7081b-ecb9-4492-a5fa-8e3c55639967/info?confirmationId={args.confirmationId}"
        method: "GET"
      ) {
      errors
      data
      status
    }
  }
`;
