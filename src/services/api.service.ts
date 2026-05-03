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
  lga_code: string | null;
  sch_email: string | null;
  accreditation_type: string | null;
}

export type ExamType = 'ssce' | 'bece';

const _recordsCache: Record<string, {data: DataRecord[], time: number}> = {};

export const dataService = {
  _clearCache(examType?: ExamType) {
    if (examType) {
      Object.keys(_recordsCache).forEach(key => {
        if (key.startsWith(examType)) delete _recordsCache[key];
      });
    } else {
      Object.keys(_recordsCache).forEach(key => delete _recordsCache[key]);
    }
  },

  async uploadCSV(examType: ExamType, file: File) {
    this._clearCache(examType);
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

  async listRecords(examType: ExamType, skip = 0, limit = 1000000): Promise<DataRecord[]> {
    const cacheKey = `${examType}_${skip}_${limit}`;
    if (_recordsCache[cacheKey] && (Date.now() - _recordsCache[cacheKey].time) < 60000) { // 1 min cache
      return _recordsCache[cacheKey].data;
    }

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

    const data = await response.json();
    _recordsCache[cacheKey] = { data, time: Date.now() };
    return data;
  },

  async bulkDelete(examType: ExamType, ids: number[]) {
    this._clearCache(examType);
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

  async deleteRecord(examType: ExamType, id: number) {
    this._clearCache(examType);
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${examType}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to delete ${examType.toUpperCase()} record`);
    }

    return await response.json();
  },

  async updateRecord(examType: ExamType, id: number, data: Partial<DataRecord>) {
    this._clearCache(examType);
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/${examType}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Failed to update ${examType.toUpperCase()} record`);
    }

    return await response.json();
  }
};

// ─── LGA Service ───────────────────────────────────────────────────

export interface LGARecord {
  id: number;
  state_name: string;
  state_code: string;
  lga_name: string;
  lga_code: string;
}

export const lgaService = {
  async listLGAs(skip = 0, limit = 1000): Promise<LGARecord[]> {
    // Check cache first
    const cacheKey = `lgas_${skip}_${limit}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_time`);
    
    // Cache for 1 hour (3600000 ms)
    if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < 3600000) {
      return JSON.parse(cachedData);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/lga/?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LGAs');
    }

    const data = await response.json();
    
    // Update cache
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
    
    return data;
  },

  async createLGA(data: Omit<LGARecord, 'id'>): Promise<LGARecord> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/lga/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create LGA');
    }

    return await response.json();
  },

  async updateLGA(id: number, data: Partial<Omit<LGARecord, 'id'>>): Promise<LGARecord> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/lga/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update LGA');
    }

    return await response.json();
  },

  async deleteLGA(id: number) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/lga/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete LGA');
    }

    return await response.json();
  },

  async bulkDeleteLGAs(ids: number[]) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/lga/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to bulk delete LGAs');
    }

    return await response.json();
  },

  async uploadLGAsCSV(file: File) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/lga/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload LGA CSV');
    }

    return await response.json();
  }
};
