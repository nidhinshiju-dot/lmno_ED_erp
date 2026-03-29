import { fetchWithAuth } from './api';

const cleanUrl = (url: string) => {
    // Some routes hardcoded /lms/api/v1, we need to strip it so fetchWithAuth appends properly
    return url.replace('/lms/api/v1', '');
};

const apiClient = {
    get: async (url: string) => {
        const response = await fetchWithAuth(cleanUrl(url), { method: 'GET' });
        return { data: response };
    },
    post: async (url: string, data?: any) => {
        const response = await fetchWithAuth(cleanUrl(url), {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
        return { data: response };
    },
    put: async (url: string, data?: any) => {
        const response = await fetchWithAuth(cleanUrl(url), {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
        return { data: response };
    },
    delete: async (url: string) => {
        const response = await fetchWithAuth(cleanUrl(url), { method: 'DELETE' });
        return { data: response };
    }
};

export default apiClient;
