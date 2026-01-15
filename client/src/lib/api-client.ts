import { initClient } from '@ts-rest/core';
import { contract } from '../../../shared/contracts';

export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5013',
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    // CRITICAL: Use getter property for dynamic auth headers (ts-rest v3 requirement)
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});
