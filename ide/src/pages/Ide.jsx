import { useState, useEffect } from "react";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { EditorLayout } from "../components/EditorLayout";
import { Dashboard } from "./Dashboard";
import { IdeHeader } from "../components/IdeHeader";
import { useTheme } from "../context/ThemeContext";
import { ProjectProvider } from "../context/ProjectContext";
import { fileAPI } from "../api/files";
import { convertDBFilesToSandpack } from "../utils/fileHelpers";

export const Ide = () => {
    const { theme } = useTheme();
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectFiles, setProjectFiles] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleProjectOpen = async (project) => {
        setSelectedProject(project);
        setCurrentView('editor');
        setIsLoading(true);

        try {
            const response = await fileAPI.getByProject(project._id);
            const dbFiles = response.success ? response.data : [];

            if (dbFiles.length > 0) {
                const sandpackFiles = convertDBFilesToSandpack(dbFiles);
                setProjectFiles(sandpackFiles);
            } else {
                setProjectFiles(null);
            }
        } catch (err) {
            setProjectFiles(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setSelectedProject(null);
        setProjectFiles(null);
    };

    return (
        <ProjectProvider>
            <div className={`w-full h-full flex-col ${theme === 'dark' ? 'bg-white' : 'bg-gray-50'} text-white`}>
                <IdeHeader
                    currentView={currentView}
                    onBackToDashboard={handleBackToDashboard}
                    selectedProject={selectedProject}
                />

                <div className="w-full h-[92%]">
                    {currentView === 'dashboard' ? (
                        <Dashboard onProjectOpen={handleProjectOpen} />
                    ) : selectedProject && !isLoading ? (
                        <SandpackProvider
                            key={selectedProject._id}
                            template="react"
                            theme={theme === 'dark' ? 'dark' : 'light'}
                            style={{ height: '100%' }}
                            files={projectFiles}
                            options={{
                                autorun: true,
                                recompileMode: 'immediate',
                                recompileDelay: 300
                            }}
                        >
                            <EditorLayout selectedProject={selectedProject} />
                        </SandpackProvider>
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                            theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'
                        }`}>
                            <p>Loading project...</p>
                        </div>
                    )}
                </div>
            </div>
        </ProjectProvider>
    );
};
