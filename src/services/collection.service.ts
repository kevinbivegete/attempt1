import apiClient from './api';

export interface CollectionActivity {
  id: string;
  collectionCaseId: string;
  activityType: string;
  outcome?: string | null;
  amount?: number | null;
  notes?: string | null;
  performedBy?: string | null;
  createdAt: string;
}

export interface CollectionCase {
  id: string;
  caseNumber: string;
  loanId: string;
  customerId: string;
  status: string;
  priority: string;
  overdueAmount: number;
  daysPastDue: number;
  originalDueDate?: string | null;
  assignedTo?: string | null;
  openedAt: string;
  closedAt?: string | null;
  closureReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: CollectionActivity[];
}

export interface CollectionCaseQuery {
  status?: string;
  loanId?: string;
  customerId?: string;
}

export interface CreateCollectionCaseRequest {
  loanId: string;
  overdueAmount: number;
  daysPastDue: number;
  priority?: string;
  status?: string;
  originalDueDate?: string;
  assignedTo?: string;
  notes?: string;
}

export interface UpdateCollectionCaseRequest {
  status?: string;
  priority?: string;
  overdueAmount?: number;
  daysPastDue?: number;
  originalDueDate?: string | null;
  assignedTo?: string | null;
  closureReason?: string;
  notes?: string;
}

export interface CreateCollectionActivityRequest {
  activityType: string;
  outcome?: string;
  amount?: number;
  notes?: string;
  performedBy?: string;
}

export const collectionService = {
  findAll: async (params?: CollectionCaseQuery): Promise<CollectionCase[]> => {
    const response = await apiClient.get<CollectionCase[]>('/collections/cases', {
      params,
    });
    return response.data;
  },

  findOne: async (id: string): Promise<CollectionCase> => {
    const response = await apiClient.get<CollectionCase>(`/collections/cases/${id}`);
    return response.data;
  },

  findByLoan: async (loanId: string): Promise<CollectionCase[]> => {
    const response = await apiClient.get<CollectionCase[]>(
      `/collections/cases/loan/${loanId}`,
    );
    return response.data;
  },

  create: async (data: CreateCollectionCaseRequest): Promise<CollectionCase> => {
    const response = await apiClient.post<CollectionCase>('/collections/cases', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateCollectionCaseRequest,
  ): Promise<CollectionCase> => {
    const response = await apiClient.patch<CollectionCase>(
      `/collections/cases/${id}`,
      data,
    );
    return response.data;
  },

  listActivities: async (caseId: string): Promise<CollectionActivity[]> => {
    const response = await apiClient.get<CollectionActivity[]>(
      `/collections/cases/${caseId}/activities`,
    );
    return response.data;
  },

  addActivity: async (
    caseId: string,
    data: CreateCollectionActivityRequest,
  ): Promise<CollectionActivity> => {
    const response = await apiClient.post<CollectionActivity>(
      `/collections/cases/${caseId}/activities`,
      data,
    );
    return response.data;
  },
};
