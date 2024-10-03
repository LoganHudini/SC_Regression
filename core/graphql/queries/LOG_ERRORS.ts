import { gql } from '@apollo/client';

export const logErrors = gql`
  query LogErrors($body: ILogErrorsApiRequest) {
    errorLog(body: $body)
      @rest(type: "LogErrorsPayload", path: "/log", method: "POST", bodyKey: "body") {
      errors
      data
      status
    }
  }
`;
