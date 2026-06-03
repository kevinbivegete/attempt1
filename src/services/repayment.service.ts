import apiClient from './api';

// ─── Enums / literal types ────────────────────────────────────────────────────
export type PaymentFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'BI_WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'CUSTOM';

export type InterestRateType = 'FLAT' | 'REDUCING_BALANCE';

export type InstallmentStatus =
  | 'Upcoming'
  | 'Due'
  | 'Paid'
  | 'Partial'
  | 'Overdue'
  | 'Defaulted'
  | 'Waived';

export type RevisionStatus = 'Pending' | 'Approved' | 'Rejected';

export type ScheduleStatus = 'Active' | 'Revised' | 'Completed' | 'Suspended';

// ─── Interfaces ───────────────────────────────────────────────────────────────
export interface RepaymentSchedule {
  id: string;
  loanId: string;
  frequency: PaymentFrequency;
  customDays?: number;
  totalInstallments: number;
  installmentAmount: number;
  interestRateType: InterestRateType;
  interestRate: number;
  gracePeriodDays: number;
  penaltyRate: number;
  startDate: string;
  endDate: string;
  status: ScheduleStatus;
  version: number;
  createdBy: string;
  installments?: RepaymentInstallment[];
  revisions?: ScheduleRevision[];
  createdAt: string;
  updatedAt: string;
}

export interface RepaymentInstallment {
  id: string;
  scheduleId: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  totalDue: number;
  paidAmount: number;
  outstandingAmount: number;
  paidDate?: string;
  status: InstallmentStatus;
  payments?: PaymentRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  installmentId: string;
  loanId: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  channel: string;
  reference?: string;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export interface ScheduleRevision {
  id: string;
  scheduleId: string;
  loanId: string;
  revisionNumber: number;
  reason: string;
  requestedBy: string;
  newFrequency?: PaymentFrequency;
  newCustomDays?: number;
  newInstallmentAmount?: number;
  newInterestRate?: number;
  newGracePeriodDays?: number;
  newPenaltyRate?: number;
  newStartDate?: string;
  status: RevisionStatus;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  effectiveDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRepaymentSummary {
  totalDue: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  nextDueDate?: string;
  nextDueAmount?: number;
  onTimePayments: number;
  latePayments: number;
  completionPercentage: number;
}

// ─── Request types ────────────────────────────────────────────────────────────
export interface CreateScheduleRequest {
  loanId: string;
  frequency: PaymentFrequency;
  customDays?: number;
  interestRateType: InterestRateType;
  interestRate: number;
  gracePeriodDays: number;
  penaltyRate: number;
  startDate: string;
  createdBy: string;
}

export interface RecordPaymentRequest {
  installmentId: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  channel: string;
  reference?: string;
  receivedBy: string;
  notes?: string;
}

export interface CreateRevisionRequest {
  scheduleId: string;
  loanId: string;
  reason: string;
  requestedBy: string;
  newFrequency?: PaymentFrequency;
  newCustomDays?: number;
  newInstallmentAmount?: number;
  newInterestRate?: number;
  newGracePeriodDays?: number;
  newPenaltyRate?: number;
  newStartDate?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const repaymentService = {
  /** POST /repayment/schedules */
  createSchedule: async (data: CreateScheduleRequest): Promise<RepaymentSchedule> => {
    const response = await apiClient.post<RepaymentSchedule>('/repayment/schedules', data);
    return response.data;
  },

  /** GET /repayment/schedules/:loanId */
  getSchedule: async (loanId: string): Promise<RepaymentSchedule> => {
    const response = await apiClient.get<RepaymentSchedule>(`/repayment/schedules/${loanId}`);
    return response.data;
  },

  /** GET /repayment/installments/:loanId?status=... */
  getInstallments: async (
    loanId: string,
    status?: InstallmentStatus,
  ): Promise<RepaymentInstallment[]> => {
    const response = await apiClient.get<RepaymentInstallment[]>(
      `/repayment/installments/${loanId}`,
      { params: status ? { status } : undefined },
    );
    return response.data;
  },

  /** GET /repayment/summary/:loanId */
  getSummary: async (loanId: string): Promise<LoanRepaymentSummary> => {
    const response = await apiClient.get<LoanRepaymentSummary>(`/repayment/summary/${loanId}`);
    return response.data;
  },

  /** POST /repayment/payments */
  recordPayment: async (data: RecordPaymentRequest): Promise<PaymentRecord> => {
    const response = await apiClient.post<PaymentRecord>('/repayment/payments', data);
    return response.data;
  },

  /** GET /repayment/payments/:loanId */
  getPayments: async (loanId: string): Promise<PaymentRecord[]> => {
    const response = await apiClient.get<PaymentRecord[]>(`/repayment/payments/${loanId}`);
    return response.data;
  },

  /** POST /repayment/revisions */
  requestRevision: async (data: CreateRevisionRequest): Promise<ScheduleRevision> => {
    const response = await apiClient.post<ScheduleRevision>('/repayment/revisions', data);
    return response.data;
  },

  /** PATCH /repayment/revisions/:id/approve */
  approveRevision: async (id: string, approvedBy: string): Promise<ScheduleRevision> => {
    const response = await apiClient.patch<ScheduleRevision>(
      `/repayment/revisions/${id}/approve`,
      { approvedBy },
    );
    return response.data;
  },

  /** PATCH /repayment/revisions/:id/reject */
  rejectRevision: async (
    id: string,
    approvedBy: string,
    reason: string,
  ): Promise<ScheduleRevision> => {
    const response = await apiClient.patch<ScheduleRevision>(
      `/repayment/revisions/${id}/reject`,
      { approvedBy, rejectionReason: reason },
    );
    return response.data;
  },

  /** GET /repayment/revisions/:loanId */
  getRevisions: async (loanId: string): Promise<ScheduleRevision[]> => {
    const response = await apiClient.get<ScheduleRevision[]>(`/repayment/revisions/${loanId}`);
    return response.data;
  },
};
