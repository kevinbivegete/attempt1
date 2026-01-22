import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Extracts user-friendly error messages from API errors
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Check if it's an Axios error
    if ('response' in error) {
      const axiosError = error as AxiosError<any>;
      const response = axiosError.response;

      if (response) {
        // Try to get error message from response
        const data = response.data;

        // Handle different error response formats
        if (data?.message) {
          return data.message;
        }

        if (data?.error) {
          return typeof data.error === 'string'
            ? data.error
            : data.error.message || 'An error occurred';
        }

        // Handle validation errors (array of messages)
        if (Array.isArray(data?.errors)) {
          return data.errors.join(', ');
        }

        // Handle field-specific validation errors
        if (data?.errors && typeof data.errors === 'object') {
          const errorMessages = Object.values(data.errors).flat();
          return errorMessages.join(', ');
        }

        // Fallback to status-based messages
        switch (response.status) {
          case 400:
            return 'Invalid request. Please check your input.';
          case 401:
            return 'Invalid email or password. Please try again.';
          case 403:
            return 'You do not have permission to perform this action.';
          case 404:
            return 'The requested resource was not found.';
          case 409:
            return 'This email is already registered.';
          case 422:
            return 'Validation failed. Please check your input.';
          case 500:
            return 'Server error. Please try again later.';
          default:
            return data?.message || `Error ${response.status}: ${response.statusText}`;
        }
      }

      // Network error
      if (axiosError.code === 'ECONNABORTED') {
        return 'Request timeout. Please check your connection and try again.';
      }

      if (axiosError.code === 'ERR_NETWORK') {
        return 'Network error. Please check your connection.';
      }
    }

    // Generic error message
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Extracts field-specific validation errors
 */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<any>;
    const response = axiosError.response;

    if (response?.data?.errors && typeof response.data.errors === 'object') {
      Object.keys(response.data.errors).forEach((field) => {
        const messages = response.data.errors[field];
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[field] = messages[0]; // Take first error message
        }
      });
    }
  }

  return fieldErrors;
};
