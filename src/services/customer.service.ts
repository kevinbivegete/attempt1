import { customerApiClient } from './api';

export interface Customer {
  id: string;
  customer_number: string;
  full_name: string;
  national_id: string;
  email: string;
  phone_number: string;
  age: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  is_verified: boolean;
  registration_date: string;
}

export interface IndividualCustomerDetail extends Customer {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE';
  marital_status: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  physical_address: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

export interface BusinessCustomer {
  id: string;
  customer_number: string;
  company_name: string;
  trading_name: string;
  registration_number: string;
  tin: string;
  business_type: string;
  industry: string;
  date_of_incorporation: string;
  business_address: string;
  province: string;
  district: string;
  sector: string;
  phone_number: string;
  email: string;
  website: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
  is_verified: boolean;
  registration_date: string;
}

export interface CreateIndividualPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  national_id: string;
  phone: string;
  email?: string;
  physical_address: string;
  province: string;
  district: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface CreateBusinessPayload {
  company_name: string;
  trading_name?: string;
  registration_number: string;
  tin: string;
  business_type: string;
  industry: string;
  date_of_incorporation: string;
  business_address: string;
  province: string;
  district: string;
  sector: string;
  phone_number: string;
  email: string;
  website?: string;
}

interface DjangoList<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const customerService = {
  /* ── Individual Customers ── */
  findAll: async (params?: { status?: string; search?: string }): Promise<Customer[]> => {
    const response = await customerApiClient.get<DjangoList<Customer>>(
      '/api/customers/individual-customers/',
      { params },
    );
    return response.data.results;
  },

  findOne: async (id: string): Promise<IndividualCustomerDetail> => {
    const response = await customerApiClient.get<IndividualCustomerDetail>(
      `/api/customers/individual-customers/${id}/`,
    );
    return response.data;
  },

  createIndividual: async (payload: CreateIndividualPayload): Promise<Customer> => {
    const response = await customerApiClient.post<Customer>(
      '/api/customers/individual-customers/',
      payload,
    );
    return response.data;
  },

  updateIndividual: async (id: string, payload: Partial<CreateIndividualPayload>): Promise<Customer> => {
    const response = await customerApiClient.patch<Customer>(
      `/api/customers/individual-customers/${id}/`,
      payload,
    );
    return response.data;
  },

  searchBusiness: async (q: string, limit = 20): Promise<BusinessCustomer[]> => {
    const all = await customerService.findAllBusiness();
    const lower = q.toLowerCase();
    return all
      .filter(
        (c) =>
          c.company_name.toLowerCase().includes(lower) ||
          c.customer_number.toLowerCase().includes(lower) ||
          (c.email && c.email.toLowerCase().includes(lower)) ||
          c.phone_number.includes(lower) ||
          c.tin.includes(lower),
      )
      .slice(0, limit);
  },

  search: async (q: string, limit = 20): Promise<Customer[]> => {
    const all = await customerService.findAll();
    const lower = q.toLowerCase();
    return all
      .filter(
        (c) =>
          c.full_name.toLowerCase().includes(lower) ||
          c.customer_number.toLowerCase().includes(lower) ||
          c.email.toLowerCase().includes(lower) ||
          c.phone_number.includes(lower) ||
          c.national_id.toLowerCase().includes(lower),
      )
      .slice(0, limit);
  },

  /* ── Business Customers ── */
  findAllBusiness: async (params?: { status?: string; search?: string }): Promise<BusinessCustomer[]> => {
    const response = await customerApiClient.get<DjangoList<BusinessCustomer>>(
      '/api/customers/business-customers/',
      { params },
    );
    return response.data.results;
  },

  findOneBusiness: async (id: string): Promise<BusinessCustomer> => {
    const response = await customerApiClient.get<BusinessCustomer>(
      `/api/customers/business-customers/${id}/`,
    );
    return response.data;
  },

  createBusiness: async (payload: CreateBusinessPayload): Promise<BusinessCustomer> => {
    const response = await customerApiClient.post<BusinessCustomer>(
      '/api/customers/business-customers/',
      payload,
    );
    return response.data;
  },

  updateBusiness: async (id: string, payload: Partial<CreateBusinessPayload>): Promise<BusinessCustomer> => {
    const response = await customerApiClient.patch<BusinessCustomer>(
      `/api/customers/business-customers/${id}/`,
      payload,
    );
    return response.data;
  },
};
