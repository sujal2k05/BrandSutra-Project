import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('brandsutra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('brandsutra_token');
        localStorage.removeItem('brandsutra_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getOrganizations: () => api.get('/auth/organizations'),
};

export const organizationService = {
  getOrg: (id) => api.get(`/organizations/${id}`),
  updateOrg: (id, data) => api.put(`/organizations/${id}`, data),
  getMembers: (id) => api.get(`/organizations/${id}/members`),
  addMember: (id, data) => api.post(`/organizations/${id}/members`, data),
};

export const brandDnaService = {
  getProfile: (orgId) => api.get(`/brands/${orgId}/dna`),
  updateProfile: (orgId, data) => api.put(`/brands/${orgId}/dna`, data),
  getFacts: (orgId) => api.get(`/brands/${orgId}/facts`),
  addFact: (orgId, data) => api.post(`/brands/${orgId}/facts`, data),
  updateFact: (factId, data) => api.put(`/brands/facts/${factId}`, data),
  deleteFact: (factId) => api.delete(`/brands/facts/${factId}`),
  getRules: (orgId) => api.get(`/brands/${orgId}/rules`),
  addRule: (orgId, data) => api.post(`/brands/${orgId}/rules`, data),
  deleteRule: (ruleId) => api.delete(`/brands/rules/${ruleId}`),
  getGuidelines: (orgId) => api.get(`/brands/${orgId}/guidelines`),
  addGuideline: (orgId, data) => api.post(`/brands/${orgId}/guidelines`, data),
  uploadPdfGuideline: (orgId, formData) => api.post(`/brands/${orgId}/guidelines/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const contentService = {
  createSubmission: (data) => api.post('/content', data),
  getSubmissions: (orgId) => api.get('/content', { params: { orgId } }),
  getSubmissionById: (id) => api.get(`/content/${id}`),
  createRevision: (id, data) => api.post(`/content/${id}/revisions`, data),
  getVersions: (id) => api.get(`/content/${id}/versions`),
  analyzeContent: (id) => api.post(`/content/${id}/analyze`),
  getFindings: (id) => api.get(`/content/${id}/findings`),
  getVersionFindings: (versionId) => api.get(`/content/versions/${versionId}/findings`),
  dismissFinding: (findingId) => api.post(`/content/findings/${findingId}/dismiss`),
  analyzeVisual: (formData) => api.post('/content/analyze-visual', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const approvalService = {
  getPendingApprovals: (orgId) => api.get('/approvals/pending', { params: { orgId } }),
  submitForReview: (id) => api.post(`/approvals/${id}/submit`),
  approveSubmission: (id, data) => api.post(`/approvals/${id}/approve`, data),
  rejectSubmission: (id, data) => api.post(`/approvals/${id}/reject`, data),
  requestChanges: (id, data) => api.post(`/approvals/${id}/request-changes`, data),
  getApprovalHistory: (id) => api.get(`/approvals/${id}/history`),
};

export const dashboardService = {
  getSummary: (orgId) => api.get('/dashboard/summary', { params: { orgId } }),
  getAnalytics: (orgId) => api.get('/dashboard/analytics', { params: { orgId } }),
};

export default api;
