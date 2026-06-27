const DEFAULT_API_ORIGIN = import.meta.env.PROD ? '/api' : 'http://localhost:4000';

const isLocalhostUrl = (rawUrl = '') => (
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(rawUrl)
);

const normalizeApiUrl = (rawUrl) => {
  const configuredUrl = import.meta.env.PROD && isLocalhostUrl(rawUrl)
    ? DEFAULT_API_ORIGIN
    : rawUrl;
  const baseUrl = (configuredUrl || DEFAULT_API_ORIGIN).replace(/\/+$/, '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

const SESSION_EXPIRED_MESSAGE = 'Sessão expirada. Faça login novamente.';
const NO_SERVER_SAVE_MESSAGE = 'Não foi possível salvar no servidor. Verifique a conexão/API e tente novamente.';

const isAdminEndpoint = (endpoint = '') => endpoint.startsWith('/admin');

const redirectToLogin = () => {
  localStorage.removeItem('mayclick_auth_token');
  if (window.location.pathname.startsWith('/app')) {
    window.location.href = '/login?session=expired';
  }
};

const logApiError = ({ endpoint, status, body }) => {
  console.error('[apiClient] Request failed', {
    endpoint,
    status,
    body,
  });
};

const createApiError = ({ message, status, endpoint, details }) => {
  const error = new Error(message);
  error.status = status;
  error.endpoint = endpoint;
  error.details = details;
  return error;
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => '');
  return text ? { message: text } : null;
};

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('mayclick_auth_token');

  if (isAdminEndpoint(endpoint) && !token) {
    redirectToLogin();
    throw createApiError({
      message: SESSION_EXPIRED_MESSAGE,
      status: 401,
      endpoint,
      details: null,
    });
  }

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (fetchError) {
    const details = { message: fetchError.message };
    logApiError({ endpoint, status: 0, body: details });
    throw createApiError({
      message: NO_SERVER_SAVE_MESSAGE,
      status: 0,
      endpoint,
      details,
    });
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      redirectToLogin();
    }

    logApiError({ endpoint, status: response.status, body: responseBody });

    throw createApiError({
      message: response.status === 401 || response.status === 403
        ? SESSION_EXPIRED_MESSAGE
        : responseBody?.error || responseBody?.message || `API request failed with status ${response.status}`,
      status: response.status,
      endpoint,
      details: responseBody,
    });
  }

  return responseBody;
};

// AUTH
export const login = async (email, password) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!data?.token) {
    throw new Error('Login response did not include an authentication token.');
  }
  localStorage.setItem('mayclick_auth_token', data.token);
  return data;
};

// PUBLIC
export const createPublicSubmission = (submissionData) => {
  return apiFetch('/public/submissions', {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
};

export const getPublicPackages = () => {
  return apiFetch('/public/packages');
};

export const getPublicExtras = () => {
  return apiFetch('/public/extras');
};

// ADMIN - SUBMISSIONS
export const getAdminSubmissions = () => {
  return apiFetch('/admin/submissions');
};

export const getAdminSubmissionById = (id) => {
  return apiFetch(`/admin/submissions/${id}`);
};

export const deleteAdminSubmission = (id) => {
  return apiFetch(`/admin/submissions/${id}`, {
    method: 'DELETE',
  });
};

export const updateAdminSubmission = (id, data) => {
  return apiFetch(`/admin/submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// ADMIN - SETTINGS
export const getBusinessSettings = () => {
  return apiFetch('/admin/settings');
};

export const updateBusinessSettings = (settings) => {
  return apiFetch('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

// ADMIN - PACKAGES
export const getPackages = () => {
  return apiFetch('/admin/packages');
};

export const getPackageById = (id) => {
  return apiFetch(`/admin/packages/${id}`);
};

export const createPackage = (packageData) => {
  return apiFetch('/admin/packages', {
    method: 'POST',
    body: JSON.stringify(packageData),
  });
};

export const updatePackage = (id, packageData) => {
  return apiFetch(`/admin/packages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(packageData),
  });
};

export const deletePackage = (id) => {
  return apiFetch(`/admin/packages/${id}`, {
    method: 'DELETE',
  });
};

export const togglePackageActive = (id) => {
  return apiFetch(`/admin/packages/${id}/toggle-active`, {
    method: 'PATCH',
  });
};

// ADMIN - EXTRAS
export const getExtras = () => {
  return apiFetch('/admin/extras');
};

export const createExtra = (extraData) => {
  return apiFetch('/admin/extras', {
    method: 'POST',
    body: JSON.stringify(extraData),
  });
};

export const updateExtra = (id, extraData) => {
  return apiFetch(`/admin/extras/${id}`, {
    method: 'PUT',
    body: JSON.stringify(extraData),
  });
};

export const deleteExtra = (id) => {
  return apiFetch(`/admin/extras/${id}`, {
    method: 'DELETE',
  });
};

// ADMIN - DOCUMENTS
export const saveGeneratedDocument = async ({ submissionId, budgetId, documentType, file, fileName }) => {
  const token = localStorage.getItem('mayclick_auth_token');
  if (!token) {
    redirectToLogin();
    throw createApiError({
      message: SESSION_EXPIRED_MESSAGE,
      status: 401,
      endpoint: '/admin/documents',
      details: null,
    });
  }

  const formData = new FormData();
  formData.append('pdf', file, fileName);
  formData.append('submissionId', submissionId || '');
  formData.append('budgetId', budgetId || '');
  formData.append('documentType', documentType);
  formData.append('fileName', fileName);

  let response;
  try {
    response = await fetch(`${API_URL}/admin/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
  } catch (fetchError) {
    const details = { message: fetchError.message };
    logApiError({ endpoint: '/admin/documents', status: 0, body: details });
    throw createApiError({
      message: NO_SERVER_SAVE_MESSAGE,
      status: 0,
      endpoint: '/admin/documents',
      details,
    });
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      redirectToLogin();
    }

    logApiError({ endpoint: '/admin/documents', status: response.status, body: responseBody });

    throw createApiError({
      message: response.status === 401 || response.status === 403
        ? SESSION_EXPIRED_MESSAGE
        : responseBody?.error || responseBody?.message || 'Failed to save document to server',
      status: response.status,
      endpoint: '/admin/documents',
      details: responseBody,
    });
  }

  return responseBody;
};

export const getGeneratedDocuments = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/admin/documents?${params}`);
};

export const downloadGeneratedDocument = async (id, fileName) => {
  const token = localStorage.getItem('mayclick_auth_token');
  if (!token) {
    redirectToLogin();
    throw createApiError({
      message: SESSION_EXPIRED_MESSAGE,
      status: 401,
      endpoint: `/admin/documents/${id}/download`,
      details: null,
    });
  }

  const response = await fetch(`${API_URL}/admin/documents/${id}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const responseBody = await parseResponseBody(response);
    if (response.status === 401 || response.status === 403) {
      redirectToLogin();
    }
    logApiError({ endpoint: `/admin/documents/${id}/download`, status: response.status, body: responseBody });
    throw createApiError({
      message: response.status === 401 || response.status === 403
        ? SESSION_EXPIRED_MESSAGE
        : responseBody?.error || responseBody?.message || 'Failed to download document',
      status: response.status,
      endpoint: `/admin/documents/${id}/download`,
      details: responseBody,
    });
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'document.pdf';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// ADMIN - BUDGETS
export const getBudgets = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/admin/budgets?${params}`);
};

export const getBudgetById = (id) => {
  return apiFetch(`/admin/budgets/${id}`);
};

export const createBudget = (budgetData) => {
  return apiFetch('/admin/budgets', {
    method: 'POST',
    body: JSON.stringify(budgetData),
  });
};

export const updateBudget = (id, budgetData) => {
  return apiFetch(`/admin/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(budgetData),
  });
};

export const getBudgetsStats = () => {
  return apiFetch('/admin/budgets/stats');
};

// ADMIN - UPLOAD
export const uploadImage = async (file) => {
  const token = localStorage.getItem('mayclick_auth_token');
  if (!token) {
    redirectToLogin();
    throw createApiError({
      message: SESSION_EXPIRED_MESSAGE,
      status: 401,
      endpoint: '/admin/upload',
      details: null,
    });
  }

  const formData = new FormData();
  formData.append('image', file);

  let response;
  try {
    response = await fetch(`${API_URL}/admin/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
  } catch (fetchError) {
    const details = { message: fetchError.message };
    logApiError({ endpoint: '/admin/upload', status: 0, body: details });
    throw createApiError({
      message: NO_SERVER_SAVE_MESSAGE,
      status: 0,
      endpoint: '/admin/upload',
      details,
    });
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) redirectToLogin();
    logApiError({ endpoint: '/admin/upload', status: response.status, body: responseBody });
    throw createApiError({
      message: responseBody?.error || responseBody?.message || 'Falha ao fazer upload da imagem.',
      status: response.status,
      endpoint: '/admin/upload',
      details: responseBody,
    });
  }

  return responseBody; // { url, filename }
};

// Upload múltiplas imagens de uma vez
export const uploadImagesBulk = async (files) => {
  const token = localStorage.getItem('mayclick_auth_token');
  if (!token) {
    redirectToLogin();
    throw createApiError({
      message: SESSION_EXPIRED_MESSAGE,
      status: 401,
      endpoint: '/admin/upload/bulk',
      details: null,
    });
  }

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });

  let response;
  try {
    response = await fetch(`${API_URL}/admin/upload/bulk`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
  } catch (fetchError) {
    const details = { message: fetchError.message };
    logApiError({ endpoint: '/admin/upload/bulk', status: 0, body: details });
    throw createApiError({
      message: NO_SERVER_SAVE_MESSAGE,
      status: 0,
      endpoint: '/admin/upload/bulk',
      details,
    });
  }

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) redirectToLogin();
    logApiError({ endpoint: '/admin/upload/bulk', status: response.status, body: responseBody });
    throw createApiError({
      message: responseBody?.error || responseBody?.message || 'Falha ao fazer upload das imagens.',
      status: response.status,
      endpoint: '/admin/upload/bulk',
      details: responseBody,
    });
  }

  return responseBody; // { uploaded: [{ url, filename, originalName }], count }
};

// ADMIN - HOMEPAGE (TESTIMONIALS, CATEGORIES, PHOTOS)
export const getTestimonials = () => apiFetch('/admin/homepage/testimonials');
export const createTestimonial = (data) => apiFetch('/admin/homepage/testimonials', { method: 'POST', body: JSON.stringify(data) });
export const updateTestimonial = (id, data) => apiFetch(`/admin/homepage/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTestimonial = (id) => apiFetch(`/admin/homepage/testimonials/${id}`, { method: 'DELETE' });

export const getPortfolioCategories = () => apiFetch('/admin/homepage/categories');
export const createPortfolioCategory = (data) => apiFetch('/admin/homepage/categories', { method: 'POST', body: JSON.stringify(data) });
export const updatePortfolioCategory = (id, data) => apiFetch(`/admin/homepage/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePortfolioCategory = (id) => apiFetch(`/admin/homepage/categories/${id}`, { method: 'DELETE' });
// items: [{id, sort_order}]
export const reorderCategories = (items) => apiFetch('/admin/homepage/categories/reorder', { method: 'PATCH', body: JSON.stringify(items) });

export const getPortfolioPhotos = () => apiFetch('/admin/homepage/photos');
export const createPortfolioPhoto = (data) => apiFetch('/admin/homepage/photos', { method: 'POST', body: JSON.stringify(data) });
export const updatePortfolioPhoto = (id, data) => apiFetch(`/admin/homepage/photos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePortfolioPhoto = (id) => apiFetch(`/admin/homepage/photos/${id}`, { method: 'DELETE' });

// ADMIN - HIGHLIGHTS
export const getHomeHighlights = () => apiFetch('/admin/homepage/highlights');
export const createHomeHighlight = (data) => apiFetch('/admin/homepage/highlights', { method: 'POST', body: JSON.stringify(data) });
export const updateHomeHighlight = (id, data) => apiFetch(`/admin/homepage/highlights/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteHomeHighlight = (id) => apiFetch(`/admin/homepage/highlights/${id}`, { method: 'DELETE' });

// PUBLIC COMBINED DATA
export const getPublicHomeData = () => apiFetch('/public/home-data');

// PUBLIC PORTFOLIO
export const getPublicPortfolio = () => apiFetch('/public/portfolio');
export const getPublicCategoryGallery = (slug) => apiFetch(`/public/portfolio/${slug}`);
