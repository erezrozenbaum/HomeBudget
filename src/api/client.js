// Base API client for making HTTP requests
class ApiClient {
  constructor(baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api') {
    this.baseURL = baseURL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    // Handle query parameters
    let url = `${this.baseURL}${endpoint}`;
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // Merge options properly
    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    };

    // Handle request body
    if (options.data) {
      fetchOptions.body = JSON.stringify(options.data);
    }

    console.log(`Making ${fetchOptions.method || 'GET'} request to ${url}`);
    console.log('Request headers:', headers);
    if (fetchOptions.body) {
      console.log('Request body:', fetchOptions.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      console.log(`Response status: ${response.status}`);
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.log('Unauthorized request - clearing token');
          this.setToken(null);
          window.location.href = '/login';
          return;
        }

        // Try to parse error response
        let errorMessage;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text);
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses (like for DELETE operations)
      if (response.status === 204) {
        return { message: 'Operation completed successfully' };
      }

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (!text) {
          return { message: 'Operation completed successfully' };
        }
        console.error('Unexpected non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // Auth operations
  async login(formData) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      data: formData,
    });
    this.setToken(response.token);
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      data: userData,
    });
    this.setToken(response.token);
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  // Generic CRUD operations
  async list(endpoint) {
    return this.request(`/${endpoint}`);
  }

  async get(endpoint, id) {
    return this.request(`/${endpoint}/${id}`);
  }

  async create(endpoint, data) {
    return this.request(`/${endpoint}`, {
      method: 'POST',
      data,
    });
  }

  async update(endpoint, id, data) {
    return this.request(`/${endpoint}/${id}`, {
      method: 'PUT',
      data,
    });
  }

  async delete(endpoint, id) {
    return this.request(`/${endpoint}/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient(); 