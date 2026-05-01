const BASE_URL = (import.meta.env.VITE_API_URL || 'https://vmi2848672.contaboserver.net/data-app') + '/api/v1';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  state_code: string;
  state_name: string;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.saveSession(data, username);
    return data;
  },

  async register(email: string, password: string, state_code: string, state_name: string): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, state_code, state_name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data = await response.json();
    this.saveSession(data, email);
    return data;
  },

  async createUser(email: string, password: string, state_code: string, state_name: string) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, state_code, state_name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create user');
    }

    return await response.json();
  },

  saveSession(data: LoginResponse, email: string) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('state_code', data.state_code);
    localStorage.setItem('state_name', data.state_name);
    localStorage.setItem('user_email', email);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('state_code');
    localStorage.removeItem('state_name');
    localStorage.removeItem('user_email');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getEmail() {
    return localStorage.getItem('user_email') || '';
  },

  getStateName() {
    return localStorage.getItem('state_name') || 'UNKNOWN STATE';
  },

  async changePassword(old_password: string, new_password: string, confirm_new_password: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ old_password, new_password, confirm_new_password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change password');
    }

    return await response.json();
  },

  async listUsers() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/auth/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return await response.json();
  },

  async resetPassword(email: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reset password');
    }

    return await response.json();
  },

  async updateUser(userId: number, data: { email?: string; password?: string; state_code?: string; state_name?: string }) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/auth/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update user');
    }

    return await response.json();
  },

  async deleteUser(email: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/auth/users/${email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete user');
    }

    return await response.json();
  }
};

// ─── Data Service (SSCE & BECE) ────────────────────────────────────

export interface DataRecord {
  id: number;
  state_code: string;
  state_name: string;
  sch_num: string;
  sch_name: string;
  cust_code: string;
  cust_name: string;
  cust_town: string;
  status: string | null;
  type: string | null;
  category: string | null;
  accd_year: string | null;
  lga: string | null;
}

export type ExamType = 'ssce' | 'bece';

export const dataService = {
  async uploadCSV(examType: ExamType, file: File) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/${examType}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to upload ${examType.toUpperCase()} CSV`);
    }

    return await response.json();
  },

  async listRecords(examType: ExamType, skip = 0, limit = 10000): Promise<DataRecord[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${examType}/?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${examType.toUpperCase()} records`);
    }

    return await response.json();
  },

  async bulkDelete(examType: ExamType, ids: number[]) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${examType}/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to delete ${examType.toUpperCase()} records`);
    }

    return await response.json();
  },
};
