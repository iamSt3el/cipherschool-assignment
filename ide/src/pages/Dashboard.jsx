import { useTheme } from "../context/ThemeContext";
import {useState, useEffect} from "react"
import { Folder, Plus, Search, Clock, Code2, Trash2, FolderOpen, Settings, Sparkles, Calendar, FileCode, MoreVertical, Edit, ArrowUpDown, Moon, Sun } from 'lucide-react';
import { NewProjectModal } from "../components/NewProjectModal";
import { projectAPI } from "../api/projects";
import { fileAPI } from "../api/files";
import { REACT_TEMPLATE } from "../constants/templates";

export const Dashboard = ({ onProjectOpen }) => {
    const { theme } = useTheme();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [projects, setProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [creatingProject, setCreatingProject] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectAPI.getAll();
            if (response.success) {
                setProjects(response.data);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

   const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) {
            setError('Project name is required');
            return;
        }

        try {
            setCreatingProject(true);

            // 1. Create the project
            const response = await projectAPI.create({
                name: newProjectName,
                description: newProjectDesc || '',
                template: 'react'
            });

            if (response.success) {
                const newProject = response.data;
                await saveTemplateToDatabase(newProject._id);
                setProjects([newProject, ...projects]);
                setShowNewProjectModal(false);
                setNewProjectName('');
                setNewProjectDesc('');
                setError('');
            }
        } catch (err) {
            console.error('Error creating project:', err);
            setError('Failed to create project');
        } finally {
            setCreatingProject(false);
        }
    };

    const saveTemplateToDatabase = async (projectId) => {
        const folderMap = new Map();

        for (const [filePath, fileData] of Object.entries(REACT_TEMPLATE)) {
            const cleanPath = filePath.replace(/^\//, '');
            const parts = cleanPath.split('/');
            const fileName = parts[parts.length - 1];
            const folders = parts.slice(0, -1);

            let currentParentId = null;
            for (const folderName of folders) {
                const folderKey = currentParentId ? `${currentParentId}/${folderName}` : folderName;

                if (!folderMap.has(folderKey)) {
                    const folderResponse = await fileAPI.create({
                        projectId,
                        parentId: currentParentId,
                        name: folderName,
                        type: 'folder'
                    });
                    if (folderResponse.success) {
                        folderMap.set(folderKey, folderResponse.data._id);
                        currentParentId = folderResponse.data._id;
                    }
                } else {
                    currentParentId = folderMap.get(folderKey);
                }
            }

            await fileAPI.create({
                projectId,
                parentId: currentParentId,
                name: fileName,
                type: 'file',
                content: fileData.code,
                language: getLanguageFromFilename(fileName)
            });
        }
    };

    const getLanguageFromFilename = (filename) => {
        if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
        if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
        if (filename.endsWith('.css')) return 'css';
        if (filename.endsWith('.html')) return 'html';
        if (filename.endsWith('.json')) return 'json';
        return 'javascript';
    };

    const handleDeleteProject = async (projectId, e) => {
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        try {
            const response = await projectAPI.delete(projectId);
            if (response.success) {
                setProjects(projects.filter(p => p._id !== projectId));
            }
        } catch (err) {
            console.error('Error deleting project:', err);
            setError('Failed to delete project');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className={`w-full h-full overflow-y-auto ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <main className="max-w-7xl mx-auto px-8 py-10 min-h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    My Projects
                    </h2>
                <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </p>
            </div>

            <button
                onClick={() => setShowNewProjectModal(true)}
                className="flex items-center gap-2.5 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl transition-all font-semibold shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-105 cursor-pointer"
            >
                <Sparkles className="w-5 h-5"/>
                Create Project
            </button>
            </div>

            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}/>
                <input
                    type="text"
                    placeholder="Search projects..."
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none transition-all ${
                        theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800/50 text-white placeholder-gray-500 focus:border-orange-500/50 focus:bg-zinc-900':
                            'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white'
                    }`}
                />    
            </div>
            </div>

            <div className={`border rounded-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-zinc-900/30 border-zinc-800/50':
                    'bg-white border-gray-200 shadow-sm'
            }`}>

                <div className={`grid grid-cols-12 gap-4 px-6 py-4 border-b text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800/50 text-gray-400':'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                    <div className="col-span-4 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-orange-500"/>
                        Project Name
                    </div>
                    <div className="col-span-3">Description</div>
                        <div className="col-span-2 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5"/>
                            Last Modified
                        </div>
                        <div className="col-span-1 flex items-center gap-2">
                            <FileCode className="w-3.5 h-3.5"/>
                            Files
                        </div>
                        <div className="col-span-1">
                            Type
                        </div>
                        <div className="col-span-1 text-center">
                            Actions
                        </div>
                </div>

                <div className={`divide-y ${theme === 'dark' ? 'divide-zinc-800/30' : 'divide-gray-100'}`}>
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading projects...</p>
                    </div>
                ) : filteredProjects.map((project) => (
                    <div
                        key={project._id}
                        onClick={() => onProjectOpen(project)}
                        className={`grid grid-cols-12 gap-4 px-6 py-5 transition-colors cursor-pointer group ${theme === 'dark' ? 'hover:bg-zinc-800/30' : 'hover:bg-gray-50'}`}>
                    <div className="col-span-4 flex items-center gap-3">
                        <div className={`p-2.5 border rounded-lg transition-colors ${
                            theme === 'dark' ? 'bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500/20':'bg-orange-50 border-orange-200 group-hover:bg-orange-100'
                        }`}>
                            <Folder className="w-5 h-5 text-orange-500"/>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`font-semibold transition-colors truncate ${theme === 'dark' ? 'text-white group-hover:text-orange-500':
                            'text-gray-900 group-hover:text-orange-600'}`}>
                            {project.name}
                    </span>
                    <span className={`text-xm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        Created {formatDate(project.createdAt)}
                    </span>
                    </div>
                    </div>

                    <div className="col-span-3 flex items-center">
                        <p className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {project.description || 'No description'}
                        </p>
                    </div>

                    <div className="col-span-2 flex items-center">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(project.lastModified)}
                        </span>
                    </div>

                    <div className="col-span-1 flex items-center">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {project.fileCount || 0}
                        </span>
                    </div>

                    <div className="col-span-1 flex items-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-semibold ${theme == 'dark' ?
                        'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                         'bg-orange-50 border-orange-200 text-orange-600'}`}>
                        <Code2 className="w-3 h-3"/>
                        {project.template || 'React'}
                    </span>
                    </div>

                    <div className="col-span-1 flex items-center justify-center gap-1">
                    <button
                        onClick={(e) => handleDeleteProject(project._id, e)}
                        className={`p-2 opacity-0 group-hover:opacity-100 rounded-lg transition-all cursor-pointer ${
                            theme === 'dark' ? 'hover:bg-red-500/10 hover:text-red-500'
                            : 'hover:bg-red-50 hover:text-red-600'
                        }`}
                        title = "Delete Project"
                    >
                        <Trash2 className="w-4 h-4"/>
                    </button>

                    <button
                    onClick={(e) => e.stopPropagation()}
                    className={`p-2 opacity-0 group-hover:opacity-100 rounded-lg transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'hover:bg-zinc-700/50'
                        : 'hover:bg-gray-100'
                    }`}
                    title="More Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                        
                    </div>

                    </div>
                ))}
                    
                </div>
                
            </div>

        {filteredProjects.length === 0 && <div className={`flex flex-col items-center justify-center py-24 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${
              theme === 'dark' ? 'bg-zinc-900/50' : 'bg-gray-100'
            }`}>
              <Folder className="w-10 h-10 opacity-40" />
            </div>
            <p className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No projects found
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>
              Try a different search or create a new project
            </p>
          </div>}

        </main>

        <NewProjectModal
          showModal={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          newProjectName={newProjectName}
          setNewProjectName={setNewProjectName}
          newProjectDesc={newProjectDesc}
          setNewProjectDesc={setNewProjectDesc}
          onCreateProject={handleCreateProject}
          loading={creatingProject}
        />
        </div>
    )
}
