import apiClient from './api';

export type DisbursementStatus =
    | 'Pending'
    | 'Processing'
    | 'Completed'
    | 'Failed'
    | 'Reversed';

export interface Disbursement {
    id: string;
    loanId: string;
    loanProductId: string;
    disbursementNumber: string;
    amount: number;
    channel: string;
    recipientAccount?: string | null;
    recipientName?: string | null;
    status: DisbursementStatus | string;
    transactionId?: string | null;
    externalReference?: string | null;
    failureReason?: string | null;
    retryCount: number;
    maxRetries: number;
    disbursedAt?: string | null;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDisbursementRequest {
    loanId: string;
    amount: number;
    channel: string;
    recipientAccount?: string;
    recipientName?: string;
}

export interface RetryDisbursementRequest {
    alternativeChannel?: string;
}

export interface ReverseDisbursementRequest {
    reversalReason: string;
}

export const disbursementService = {
    create: async (data: CreateDisbursementRequest): Promise<Disbursement> => {
        const response = await apiClient.post<Disbursement>('/disbursements', data);
        return response.data;
    },

    findAll: async (): Promise<Disbursement[]> => {
        const response = await apiClient.get<Disbursement[]>('/disbursements');
        return response.data;
    },

    findOne: async (id: string): Promise<Disbursement> => {
        const response = await apiClient.get<Disbursement>(`/disbursements/${id}`);
        return response.data;
    },

    findByLoan: async (loanId: string): Promise<Disbursement[]> => {
        const response = await apiClient.get<Disbursement[]>(
            `/disbursements/loan/${loanId}`,
        );
        return response.data;
    },

    getStatus: async (
        id: string,
    ): Promise<{ status: string; details: Disbursement }> => {
        const response = await apiClient.get<{ status: string; details: Disbursement }>(
            `/disbursements/${id}/status`,
        );
        return response.data;
    },

    retry: async (
        id: string,
        data?: RetryDisbursementRequest,
    ): Promise<Disbursement> => {
        const response = await apiClient.patch<Disbursement>(
            `/disbursements/${id}/retry`,
            data,
        );
        return response.data;
    },

    reverse: async (
        id: string,
        data: ReverseDisbursementRequest,
    ): Promise<Disbursement> => {
        const response = await apiClient.patch<Disbursement>(
            `/disbursements/${id}/reverse`,
            data,
        );
        return response.data;
    },
};

