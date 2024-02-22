import { ApolloError } from '@apollo/client';

export const processError = (error?: ApolloError) => {
  const networkError = error?.networkError as { result?: { errors?: string } };
  return networkError?.result?.errors && networkError.result.errors;
};

export const processStatusCode = (error?: ApolloError) => {
  const errorMessage = error?.networkError as { result?: { message?: string } };

  if (error instanceof ApolloError) {
    if (error.networkError && 'statusCode' in error.networkError) {
      const statusCode = (error.networkError as any).statusCode;

      return (
        errorMessage?.result?.message ===
          'User is not authorized to access this resource with an explicit deny' && statusCode
      );
    }
  }
};
