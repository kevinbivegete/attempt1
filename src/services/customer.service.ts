import { customerApiClient } from './api';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  tenantId: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  monthlyIncome: number | null;
  creditScore: number | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

interface WrappedList<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

function unwrapData<T>(body: T | WrappedList<T>): T {
  if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
    return (body as WrappedList<T>).data;
  }
  return body as T;
}

export function customerAgeFromDateOfBirth(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export const customerService = {
  search: async (q: string, limit = 20): Promise<Customer[]> => {
    const response = await customerApiClient.get<Customer[] | WrappedList<Customer[]>>(
      '/customers/search',
      { params: { q, limit } },
    );
    return unwrapData(response.data);
  },

  findOne: async (id: string): Promise<Customer> => {
    const response = await customerApiClient.get<Customer | WrappedList<Customer>>(
      `/customers/${id}`,
    );
    return unwrapData(response.data);
  },

  findAll: async (): Promise<Customer[]> => {
    const response = await customerApiClient.get<Customer[] | WrappedList<Customer[]>>(
      '/customers',
    );
    return unwrapData(response.data);
  },
};
