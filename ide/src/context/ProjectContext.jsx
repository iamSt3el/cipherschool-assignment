import { createContext, useContext, useState } from 'react';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);

  const value = {
    currentProject,
    setCurrentProject,
    projectFiles,
    setProjectFiles,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
