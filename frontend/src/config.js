const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Automatically ensure the URL ends with /api if it's a hosted URL (not localhost)
// and doesn't already have it.
const getFinalApiUrl = (url) => {
  if (url.includes('localhost')) return url;
  if (url.endsWith('/api')) return url;
  // Remove trailing slash if exists, then add /api
  return `${url.replace(/\/$/, '')}/api`;
};

const API_URL = getFinalApiUrl(rawApiUrl);

export default API_URL;
