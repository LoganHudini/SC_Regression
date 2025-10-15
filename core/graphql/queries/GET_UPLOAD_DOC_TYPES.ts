import { gql } from '@apollo/client';

export interface IUploadDocumentTypesApiResponse {
  getDocumentTypes: { status: string; data: null | { code: string; name: string }[] };
}

export const GET_UPLOAD_DOC_TYPES = gql`
  query GetDocumentTypes($hotelId: String) {
    getDocumentTypes(hotelId: $hotelId)
      @rest(type: "GetDocumentTypesPayload", path: "/booking/hotel/{args.hotelId}/document/types") {
      errors
      data
      status
    }
  }
`;
