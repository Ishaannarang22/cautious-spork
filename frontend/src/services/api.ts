import { DiscoveredUserData, DiscoveredCompanyData, RedactoResult, DraftItem } from '@/context/AppContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    firecrawl: boolean;
    anthropic: boolean;
    resend?: boolean;
  };
}

export interface SendDraftResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

export interface AnalysisResponse {
  redactoResults: RedactoResult[];
  drafts: DraftItem[];
}

export interface FullScanResponse {
  userData: DiscoveredUserData;
  companyData?: DiscoveredCompanyData;
  redactoResults: RedactoResult[];
  drafts: DraftItem[];
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async health(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return response.json();
  }

  async discoverUser(name: string, email?: string, phone?: string): Promise<DiscoveredUserData> {
    const response = await fetch(`${this.baseUrl}/discover/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to discover user data');
    }

    return response.json();
  }

  async discoverCompany(company: string, name?: string): Promise<DiscoveredCompanyData> {
    const response = await fetch(`${this.baseUrl}/discover/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company, name }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to discover company data');
    }

    return response.json();
  }

  async analyze(
    userData: DiscoveredUserData,
    companyData?: DiscoveredCompanyData,
    userName?: string
  ): Promise<AnalysisResponse> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData, companyData, userName }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to analyze data');
    }

    return response.json();
  }

  async fullScan(
    name: string,
    email?: string,
    phone?: string,
    company?: string
  ): Promise<FullScanResponse> {
    const response = await fetch(`${this.baseUrl}/full-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, company }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to complete full scan');
    }

    return response.json();
  }

  async sendDraft(
    draft: DraftItem,
    recipientEmail: string,
    userName: string,
    userEmail: string
  ): Promise<SendDraftResponse> {
    const response = await fetch(`${this.baseUrl}/send-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ draft, recipientEmail, userName, userEmail }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to send draft');
    }

    return response.json();
  }
}

export const api = new ApiService();
export default api;
