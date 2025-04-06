import { api } from './apiClient';

// Core API functions
export const Core = {
  // Add core functionality here
};

// LLM Integration
export const InvokeLLM = async (prompt, options = {}) => {
  return api.post('/llm/invoke', { prompt, ...options });
};

// Email Integration
export const SendEmail = async (to, subject, content, options = {}) => {
  return api.post('/email/send', { to, subject, content, ...options });
};

// SMS Integration
export const SendSMS = async (to, message, options = {}) => {
  return api.post('/sms/send', { to, message, ...options });
};

// File Upload Integration
export const UploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options,
  });
};

// Image Generation Integration
export const GenerateImage = async (prompt, options = {}) => {
  return api.post('/images/generate', { prompt, ...options });
};

// Data Extraction Integration
export const ExtractDataFromUploadedFile = async (fileId, options = {}) => {
  return api.post(`/files/${fileId}/extract`, options);
};






