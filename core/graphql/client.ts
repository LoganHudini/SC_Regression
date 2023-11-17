import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, useReactiveVar } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { RestLink } from 'apollo-link-rest';
import {
  HOST_V2,
  API_KEY_V2,
  REST_API_URL,
  REST_V4_API_URL,
  API_KEY_V0,
  HOST_V0,
  API_KEY_V1,
  HOST_V1,
  API_KEY_V3,
  HOST_V3,
  HOST_MESSAGES,
  API_KEY_MESSAGES,
  HOST_V4,
  API_KEY_V4,
  API_KEY_HOUSEKEEPING_ORDER,
  HOST_HOUSEKEEPING_ORDER,
  API_KEY_SIMPHONY,
  HOST_SIMPHONY,
  ONPREM_API_URL,
  HOST_V5,
  API_KEY_V5,
  API_KEY_V6,
  HOST_V6,
  X_API_TOKEN_V3,
  X_API_GROUP_V3,
  X_API_TOKEN,
  X_API_GROUP,
  INTEGRATION_API_KEY_V5,
  INTEGRATION_HOST_V5,
} from './endpoints';
import { checkinStorage } from 'storage/check-in.storage';

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

const messagesLink = new HttpLink({
  uri: HOST_MESSAGES as string,
  headers: {
    ['x-api-key']: API_KEY_MESSAGES as string,
    ['Content-Type']: 'application/json',
  },
});
const hostV0Link = new HttpLink({
  uri: HOST_V0 as string,
  headers: {
    ['x-api-key']: API_KEY_V0 as string,
    ['Content-Type']: 'application/json',
  },
});
const hostV1Link = new HttpLink({
  uri: HOST_V1 as string,
  headers: {
    ['x-api-key']: API_KEY_V1 as string,
    ['Content-Type']: 'application/json',
  },
});
const hostV2Link = new HttpLink({
  uri: HOST_V2 as string,
  headers: {
    ['x-api-key']: API_KEY_V2 as string,
    ['Content-Type']: 'application/json',
  },
});
const hostV3Link = new HttpLink({
  uri: HOST_V3 as string,
  headers: {
    ['x-api-key']: API_KEY_V3 as string,
    ['Content-Type']: 'application/json',
  },
});
const hostV5Link = new HttpLink({
  uri: HOST_V5 as string,
  headers: {
    ['x-api-key']: API_KEY_V5 as string,
    ['Content-Type']: 'application/json',
  },
});
const hostv4Link = new HttpLink({
  uri: HOST_V4 as string,
  headers: {
    ['x-api-key']: API_KEY_V4 as string,
    ['Content-Type']: 'application/json',
  },
});
const housekeepingLink = new HttpLink({
  uri: HOST_HOUSEKEEPING_ORDER as string,
  headers: {
    ['x-api-key']: API_KEY_HOUSEKEEPING_ORDER as string,
    ['Content-Type']: 'application/json',
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

const restv4Link = new RestLink({
  uri: REST_V4_API_URL,
  headers: {
    ['Content-Type']: 'application/json',
  },
});

const restv3Link = new RestLink({
  uri: REST_API_URL,
  headers: {
    ['x-api-token']: X_API_TOKEN_V3 as string,
    ['x-api-group']: X_API_GROUP_V3 as string,
    ['Content-Type']: 'application/json',
  },
});

const hostSimphonyLink = new HttpLink({
  uri: HOST_SIMPHONY as string,
  headers: {
    ['x-api-key']: API_KEY_SIMPHONY as string,
    ['Content-Type']: 'application/json',
  },
});

const hostV6Link = new HttpLink({
  uri: HOST_V6 as string,
  headers: {
    ['x-api-key']: API_KEY_V6 as string,
    ['Content-Type']: 'application/json',
  },
});

const integrationV5Link = new HttpLink({
  uri: INTEGRATION_HOST_V5 as string,
  headers: {
    ['x-api-key']: INTEGRATION_API_KEY_V5 as string,
    ['Content-Type']: 'application/json',
  },
});

const onPremLink = new RestLink({
  uri: ONPREM_API_URL as string,
});

export const client = new ApolloClient({
  link: ApolloLink.from([
    retryLink,
    ApolloLink.split(
      (operation) => operation.getContext().clientName === 'rest',
      restLink,
      ApolloLink.split(
        (operation) => operation.getContext().clientName === 'rest_v4',
        restv4Link,
        ApolloLink.split(
          (operation) => operation.getContext().clientName === 'host_v0',
          hostV0Link,
          ApolloLink.split(
            (operation) => operation.getContext().clientName === 'host_v1',
            hostV1Link,
            ApolloLink.split(
              (operation) => operation.getContext().clientName === 'host_v3',
              hostV3Link,
              ApolloLink.split(
                (operation) => operation.getContext().clientName === 'host_v5',
                hostV5Link,
                ApolloLink.split(
                  (operation) => operation.getContext().clientName === 'messages',
                  messagesLink,
                  ApolloLink.split(
                    (operation) => operation.getContext().clientName === 'host_v4',
                    hostv4Link,
                    ApolloLink.split(
                      (operation) => operation.getContext().clientName === 'simphony',
                      hostSimphonyLink,
                      ApolloLink.split(
                        (operation) => operation.getContext().clientName === 'onprem',
                        onPremLink,
                        ApolloLink.split(
                          (operation) => operation.getContext().clientName === 'integration_v5',
                          integrationV5Link,
                          ApolloLink.split(
                            (operation) => operation.getContext().clientName === 'host_v6',
                            hostV6Link,
                            ApolloLink.split(
                              (operation) => operation.getContext().clientName === 'rest_v3',
                              restv3Link,
                              ApolloLink.split(
                                (operation) => operation.getContext().clientName === 'housekeeping',
                                housekeepingLink,
                                hostV2Link,
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
