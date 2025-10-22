import { Sparkles, Plus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const NewProjectModal = ({
  showModal,
  onClose,
  newProjectName,
  setNewProjectName,
  newProjectDesc,
  setNewProjectDesc,
  onCreateProject,
  loading
}) => {
  const { theme } = useTheme();

  if (!showModal) return null;

  const handleCreateProject = () => {
    if (newProjectName.trim() && !loading) {
      onCreateProject();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className={`border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden ${
        theme === 'dark'
          ? 'bg-zinc-900 border-zinc-800/50'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`px-7 py-5 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-zinc-800/50' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'
            }`}>
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Create New Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-zinc-800/50' : 'hover:bg-gray-100'
            }`}
          >
            <Plus className={`w-5 h-5 rotate-45 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="p-7 space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-2.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Project Name <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && newProjectName && handleCreateProject()}
              placeholder="my-awesome-project"
              className={`w-full px-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-black/50 border-zinc-700 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              autoFocus
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2.5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}>(optional)</span>
            </label>
            <textarea
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Brief description of your project..."
              rows="3"
              className={`w-full px-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none ${
                theme === 'dark'
                  ? 'bg-black/50 border-zinc-700 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          <div className={`p-5 border rounded-xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-orange-500/5 to-orange-600/5 border-orange-500/20'
              : 'bg-orange-50 border-orange-200'
          }`}>
            <p className={`text-xs font-semibold mb-3 uppercase tracking-wide ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Project Template
            </p>
            <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                React 18 with modern hooks
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                Pre-configured file structure
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                Package.json with dependencies
              </li>
            </ul>
          </div>
        </div>

        <div className={`px-7 py-5 border-t flex justify-end gap-3 ${
          theme === 'dark'
            ? 'bg-zinc-950/50 border-zinc-800/50'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateProject}
            disabled={!newProjectName.trim() || loading}
            className="px-6 py-2.5 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all font-semibold shadow-lg shadow-orange-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};
