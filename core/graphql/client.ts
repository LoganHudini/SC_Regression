import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { RestLink } from 'apollo-link-rest';
import {
  PROPERTY_C,
  API_KEY_PROPERTY_C,
  REST_API_URL,
  REST_E_API_URL,
  API_KEY_PROPERTY_A,
  PROPERTY_A,
  API_KEY_PROPERTY_B,
  PROPERTY_B,
  API_KEY_PROPERTY_D,
  PROPERTY_D,
  INTEGRATION_D,
  INTEGRATION_API_KEY_PROPERTY_D,
  PROPERTY_E,
  API_KEY_PROPERTY_E,
  INTEGRATION_API_KEY_PROPERTY_B,
  INTEGRATION_B,
  ONPREM_API_URL,
  INTEGRATION_C,
  INTEGRATION_API_KEY_PROPERTY_C,
  INTEGRATION_API_KEY_PROPERTY_A,
  INTEGRATION_A,
  X_API_TOKEN_D,
  X_API_GROUP_D,
  X_API_TOKEN,
  X_API_GROUP,
  INTEGRATION_API_KEY_F,
  INTEGRATION_F,
  INTEGRATION_H,
  INTEGRATION_API_KEY_H,
  INTEGRATION_G,
  INTEGRATION_API_KEY_G,
  API_KEY_PROPERTY_G,
  PROPERTY_G,
  PROPERTY_F,
  API_KEY_PROPERTY_F,
  INTEGRATION_API_KEY_K,
  INTEGRATION_K,
} from './endpoints';
import { onError } from '@apollo/client/link/error';
import { GET_RESERVATION, IGetReservationApiResponse } from './queries/GET_RESERVATION';
import { logError } from 'core/api/functions/errorLogs';

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 500,
  },
  attempts: {
    max: 2,
    retryIf: (error) => {
      return error?.statusCode >= 500 && error?.statusCode < 600;
    },
  },
});

const propertyALink = new HttpLink({
  uri: PROPERTY_A as string,
  headers: {
    ['x-api-key']: API_KEY_PROPERTY_A as string,
    ['Content-Type']: 'application/json',
  },
});

const propertyBLink = new HttpLink({
  uri: PROPERTY_B as string,
  headers: {
    ['x-api-key']: API_KEY_PROPERTY_B as string,
    ['Content-Type']: 'application/json',
  },
});

const propertyCLink = new HttpLink({
  uri: PROPERTY_C as string,
  headers: {
    ['x-api-key']: API_KEY_PROPERTY_C as string,
    ['Content-Type']: 'application/json',
  },
});

const propertyDLink = new HttpLink({
  uri: PROPERTY_D as string,
  headers: {
    ['x-api-key']: API_KEY_PROPERTY_D as string,
    ['Content-Type']: 'application/json',
  },
});

const propertyELink = new HttpLink({
  uri: PROPERTY_E as string,
  headers: {
    ['x-api-key']: API_KEY_PROPERTY_E as string,
    ['Content-Type']: 'application/json',
  },
});

const propertyFLink = new HttpLink({
  uri: PROPERTY_F as string,
  headers: {
    ['x-api-key']: API_KEY_PROPERTY_F as string,
    ['Content-Type']: 'application/json',
  },
});

const propertGLink = new HttpLink({
  uri: PROPERTY_G as string,
  headers: {
    ['x-api-key']: API_KEY_PROPERTY_G as string,
    ['Content-Type']: 'application/json',
  },
});

const integrationCLink = new HttpLink({
  uri: INTEGRATION_C as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_PROPERTY_C as string,
    ['Content-Type']: 'application/json',
  },
});

const integrationALink = new HttpLink({
  uri: INTEGRATION_A as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_PROPERTY_A as string,
    ['Content-Type']: 'application/json',
  },
});

const integrationBLink = new HttpLink({
  uri: INTEGRATION_B as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_PROPERTY_B as string,
    ['Content-Type']: 'application/json',
  },
});

const integrationDLink = new HttpLink({
  uri: INTEGRATION_D as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_PROPERTY_D as string,
    ['Content-Type']: 'application/json',
  },
});

const integrationFLink = new HttpLink({
  uri: INTEGRATION_F as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_F as string,
    ['Content-Type']: 'application/json',
  },
});

const integrationGLink = new HttpLink({
  uri: INTEGRATION_G as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_G as string,
    ['Content-Type']: 'application/json',
  },
});

const integrationHLink = new HttpLink({
  uri: INTEGRATION_H as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_H as string,
  },
});

const integrationKLink = new HttpLink({
  uri: INTEGRATION_K as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_K as string,
  },
});

const restLink = new RestLink({
  uri: REST_API_URL,
  headers: {
    ['x-api-token']: X_API_TOKEN as string,
    ['x-api-group']: X_API_GROUP as string,
    ['Content-Type']: 'application/json',
  },
});

const restDLink = new RestLink({
  uri: REST_API_URL,
  headers: {
    ['x-api-token']: X_API_TOKEN_D as string,
    ['x-api-group']: X_API_GROUP_D as string,
    ['Content-Type']: 'application/json',
  },
});

const restELink = new RestLink({
  uri: REST_E_API_URL,
  headers: {
    ['Content-Type']: 'application/json',
  },
});

const onPremLink = new RestLink({
  uri: ONPREM_API_URL as string,
});

const errorLink = onError((error?: any) => {
  const reservationData = client.readQuery<IGetReservationApiResponse>({
    query: GET_RESERVATION,
  });
  const reservationInfo = reservationData?.getReservation?.data;
  const url = window.location.pathname;
  const page = url?.split('/')?.splice(3)?.join('/') || `${url}-homePage`;
  const networkError = error?.networkError as any;
  const statusCode = networkError?.statusCode || networkError?.response?.status;

  if (error?.operation?.operationName !== 'LogErrors') {
    if (networkError) {
      logError(
        statusCode as string,
        networkError?.result?.message || networkError?.result?.errors || networkError?.message,
        page,
        error?.operation?.operationName,
        error?.operation?.variables?.body?.confirmationId ||
          error?.operation?.variables?.confirmationNumber ||
          reservationInfo?.confirmationId?.toString()?.trim() ||
          '',
      );
    } else if (error?.graphQLErrors && typeof error?.graphQLErrors === 'object') {
      logError(
        '',
        error?.graphQLErrors[0]?.message || error?.graphQLErrors,
        page,
        error?.operation?.operationName,
        error?.operation?.variables?.body?.confirmationId ||
          error?.operation?.variables?.confirmationNumber ||
          reservationInfo?.confirmationId?.toString()?.trim() ||
          '',
      );
    }
  }
});

export const client = new ApolloClient({
  link: ApolloLink.from([
    errorLink,
    retryLink,
    ApolloLink.split(
      (operation) => operation.getContext().clientName === 'property_a',
      propertyALink,
      ApolloLink.split(
        (operation) => operation.getContext().clientName === 'property_b',
        propertyBLink,
        ApolloLink.split(
          (operation) => operation.getContext().clientName === 'property_c',
          propertyCLink,
          ApolloLink.split(
            (operation) => operation.getContext().clientName === 'property_d',
            propertyDLink,
            ApolloLink.split(
              (operation) => operation.getContext().clientName === 'property_e',
              propertyELink,
              ApolloLink.split(
                (operation) => operation.getContext().clientName === 'property_f',
                propertyFLink,
                ApolloLink.split(
                  (operation) => operation.getContext().clientName === 'property_g',
                  propertGLink,
                  ApolloLink.split(
                    (operation) => operation.getContext().clientName === 'integration_a',
                    integrationALink,
                    ApolloLink.split(
                      (operation) => operation.getContext().clientName === 'integration_b',
                      integrationBLink,
                      ApolloLink.split(
                        (operation) => operation.getContext().clientName === 'integration_c',
                        integrationCLink,
                        ApolloLink.split(
                          (operation) => operation.getContext().clientName === 'integration_d',
                          integrationDLink,
                          ApolloLink.split(
                            (operation) => operation.getContext().clientName === 'integration_f',
                            integrationFLink,
                            ApolloLink.split(
                              (operation) => operation.getContext().clientName === 'integration_g',
                              integrationGLink,
                              ApolloLink.split(
                                (operation) =>
                                  operation.getContext().clientName === 'integration_h',
                                integrationHLink,
                                ApolloLink.split(
                                  (operation) =>
                                    operation.getContext().clientName === 'integration_k',
                                  integrationKLink,
                                  ApolloLink.split(
                                    (operation) => operation.getContext().clientName === 'rest',
                                    restLink,
                                    ApolloLink.split(
                                      (operation) => operation.getContext().clientName === 'rest_d',
                                      restDLink,
                                      ApolloLink.split(
                                        (operation) =>
                                          operation.getContext().clientName === 'rest_e',
                                        restELink,
                                        ApolloLink.split(
                                          (operation) =>
                                            operation.getContext().clientName === 'onprem',
                                          onPremLink,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ]),
  cache: new InMemoryCache(),
});
