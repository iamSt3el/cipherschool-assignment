import axios from './axios';

export const projectAPI = {
  create: async (projectData) => {
    const response = await axios.post('/projects', projectData);
    return response.data;
  },

  getAll: async () => {
    const response = await axios.get('/projects');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/projects/${id}`);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await axios.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/projects/${id}`);
    return response.data;
  },
};
