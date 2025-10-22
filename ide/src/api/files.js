import axios from './axios';

export const fileAPI = {
  create: async (fileData) => {
    const response = await axios.post('/files', fileData);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/files/${id}`);
    return response.data;
  },

  getByProject: async (projectId, parentId = null) => {
    const url = parentId
      ? `/files/project/${projectId}?parentId=${parentId}`
      : `/files/project/${projectId}`;
    const response = await axios.get(url);
    return response.data;
  },

  update: async (id, fileData) => {
    const response = await axios.put(`/files/${id}`, fileData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/files/${id}`);
    return response.data;
  },
};
