import { gql } from '@apollo/client';
import { HOTEL_ID } from '../endpoints';

export interface IUploadDocumentTypesApiResponse {
  getDocumentTypes: { status: string; data: null | { code: string; name: string }[] };
}

export const GET_UPLOAD_DOC_TYPES = gql`
  query GetDocumentTypes {
    getDocumentTypes @rest(
        type: "GetDocumentTypesPayload"
        path: "/booking/hotel/${HOTEL_ID}/document/types"
      ) {
      errors
      data
      status
    }
  }
`;
