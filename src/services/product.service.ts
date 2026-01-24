import apiClient from './api';

// DTOs matching backend structure
export interface CreateProductFeeDto {
  feeType: string;
  feeName: string;
  feeAmount?: number;
  feePercentage?: number;
  isPercentage?: boolean;
}

export interface CreateEligibilityRuleDto {
  ruleName: string;
  ruleType: string;
  operator: string;
  value: string;
}

export interface CreateApprovalWorkflowDto {
  minAmount: number;
  maxAmount: number;
  approvalLevel: string;
  approverRole: string;
}

export interface CreateProductDto {
  productCode: string;
  productName: string;
  description?: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  interestRate: number;
  interestRateType: string;
  tenureMonths: number;
  repaymentScheduleType: string;
  requiresCollateral?: boolean;
  autoWriteoffLimit?: number;
  refundAcceptanceLimit?: number;
  defaultDisbursementAccount?: string;
  defaultGLAccount?: string;
  fees?: CreateProductFeeDto[];
  eligibilityRules?: CreateEligibilityRuleDto[];
  approvalWorkflows?: CreateApprovalWorkflowDto[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductFee {
  id: string;
  feeType: string;
  feeName: string;
  feeAmount?: number;
  feePercentage?: number;
  isPercentage: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EligibilityRule {
  id: string;
  ruleName: string;
  ruleType: string;
  operator: string;
  value: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalWorkflow {
  id: string;
  minAmount: number;
  maxAmount: number;
  approvalLevel: string;
  approverRole: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  productCode: string;
  productName: string;
  description?: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  interestRate: number;
  interestRateType: string;
  tenureMonths: number;
  repaymentScheduleType: string;
  requiresCollateral: boolean;
  autoWriteoffLimit?: number;
  refundAcceptanceLimit?: number;
  defaultDisbursementAccount?: string;
  defaultGLAccount?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  fees?: ProductFee[];
  eligibilityRules?: EligibilityRule[];
  approvalWorkflows?: ApprovalWorkflow[];
}

export const productService = {
  // Create Product
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  // List All Products
  findAll: async (includeInactive = false): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products', {
      params: { includeInactive: includeInactive.toString() },
    });
    return response.data;
  },

  // Get Product by ID
  findOne: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Get Product by Code
  findByCode: async (code: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/code/${code}`);
    return response.data;
  },

  // Update Product
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  // Delete Product
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // Activate Product
  activate: async (id: string): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}/activate`);
    return response.data;
  },

  // Deactivate Product
  deactivate: async (id: string): Promise<Product> => {
    const response = await apiClient.patch<Product>(
      `/products/${id}/deactivate`,
    );
    return response.data;
  },
};
