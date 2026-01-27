import apiClient from './api';

export type LoanStatus =
    | 'Pending'
    | 'Approved'
    | 'Rejected'
    | 'Disbursed'
    | 'Active';

export interface Loan {
    id: string;
    loanNumber: string;
    loanProductId: string;
    customerId: string;
    applicationDate: string;
    requestedAmount: number;
    approvedAmount?: number | null;
    interestRate: number;
    tenureMonths: number;
    status: LoanStatus;
    approvalDate?: string | null;
    approvedBy?: string | null;
    rejectionReason?: string | null;
    disbursedAmount?: number | null;
    disbursedDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LoanQuery {
    status?: LoanStatus | 'All';
    customerId?: string;
    productCode?: string;
}

export interface CreateLoanRequest {
    loanProductId: string;
    customerId: string;
    requestedAmount: number;
    interestRate?: number;
    tenureMonths?: number;
}

export interface EligibilityCheckRequest {
    loanProductId: string;
    customerId: string;
    requestedAmount: number;
    customerIncome?: number;
    customerCreditScore?: number;
    customerAge?: number;
}

export interface EligibilityCheckResponse {
    isEligible: boolean;
    reasons: string[];
    productDetails: {
        productCode: string;
        productName: string;
        minLoanAmount: number;
        maxLoanAmount: number;
        interestRate: number;
        tenureMonths: number;
    };
}

export interface ApproveLoanRequest {
    approvedBy: string;
    approvedAmount: number;
    approvalDate?: string;
}

export interface RejectLoanRequest {
    rejectedBy: string;
    rejectionReason: string;
}

export const loanService = {
    create: async (data: CreateLoanRequest): Promise<Loan> => {
        const response = await apiClient.post<Loan>('/loans', data);
        return response.data;
    },

    checkEligibility: async (
        data: EligibilityCheckRequest,
    ): Promise<EligibilityCheckResponse> => {
        const response = await apiClient.post<EligibilityCheckResponse>(
            '/loans/eligibility-check',
            data,
        );
        return response.data;
    },

    submitForApproval: async (id: string): Promise<Loan> => {
        const response = await apiClient.patch<Loan>(`/loans/${id}/submit`);
        return response.data;
    },

    approve: async (id: string, data: ApproveLoanRequest): Promise<Loan> => {
        const response = await apiClient.patch<Loan>(`/loans/${id}/approve`, data);
        return response.data;
    },

    reject: async (id: string, data: RejectLoanRequest): Promise<Loan> => {
        const response = await apiClient.patch<Loan>(`/loans/${id}/reject`, data);
        return response.data;
    },

    findAll: async (params?: LoanQuery): Promise<Loan[]> => {
        const response = await apiClient.get<Loan[]>('/loans', { params });
        return response.data;
    },

    findOne: async (id: string): Promise<Loan> => {
        const response = await apiClient.get<Loan>(`/loans/${id}`);
        return response.data;
    },
};

