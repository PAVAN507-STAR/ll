import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => API.post('/auth/login', credentials);

// Books
export const fetchBooks = () => API.get('/books');
export const addBook = (data) => API.post('/books', data);
export const updateBook = (id, data) => API.put(`/books/${id}`, data);
export const deleteBook = (id) => API.delete(`/books/${id}`);
export const issueBook = (data) => API.post('/books/issue', data);
export const returnBook = (data) => API.post('/books/return', data);
export const sendReminder = (data) => {
  console.log('API sending reminder data:', data);
  const requestData = {
    bookId: data.bookId,
    studentName: data.userName,
    phone: data.phone
  };

  return API.post('books/reminder', requestData);
};

// Users
export const fetchUsers = () => API.get('/users');
export const addUser = (data) => API.post('/users', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Finance
export const fetchBalance = () => API.get('/finance/balance');
export const fetchTransactions = () => API.get('/finance');

export const searchStudents = async (query) => {
  return await API.get(`/students/search?name=${encodeURIComponent(query)}`);
};

// Coupons
export const fetchCoupons = () => API.get('/coupons');
export const addCoupon = (data) => API.post('/coupons', data);
export const updateCoupon = (id, data) => API.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => API.delete(`/coupons/${id}`);
export const validateCoupon = (code) => API.post('/coupons/validate', { code });

export default API;
