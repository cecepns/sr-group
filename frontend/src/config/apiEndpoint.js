// Util untuk menentukan base URL API.
// Bisa diatur lewat environment variable VITE_API_URL, misalnya:
// VITE_API_URL="http://localhost:5000/api"

export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const { origin } = window.location;
    // Default fallback: backend di port 5000
    return `${origin.replace(/:\\d+$/, ':5000')}/api`;
  }

  return 'https://api-inventory.isavralabel.com/srgroup-kas-stok/api';
}

