import { Settings, Sun, Moon, ArrowLeft, Home, LogOut, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const IdeHeader = ({ currentView, onBackToDashboard, selectedProject }) => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className={`w-full h-[8%] min-h-[60px] flex flex-row px-2 sm:px-4 justify-between items-center ${
            theme === 'dark' ? 'bg-zinc-900 border-b border-zinc-800' : 'bg-white border-b border-gray-200'
        }`}>
            <div className="flex flex-row items-center gap-2 sm:gap-3 font-bold">
                <span className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded flex items-center justify-center text-sm sm:text-lg">
                    {'</>'}
                </span>
                <h1 className={`text-sm sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    CipherStudio
                </h1>

                {currentView === 'editor' && selectedProject && (
                    <>
                        <span className={`hidden sm:inline text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>/</span>
                        <span className={`hidden sm:inline text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} truncate max-w-[150px] md:max-w-[200px]`}>
                            {selectedProject.name}
                        </span>
                    </>
                )}
            </div>
            <div className="flex justify-center align-center gap-1 sm:gap-2">
                {currentView === 'editor' && (
                    <button
                        onClick={onBackToDashboard}
                        className={`flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl cursor-pointer transition-colors ${
                            theme === 'dark' ? 'hover:bg-zinc-800 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                        title="Back to Dashboard"
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
                    </button>
                )}
                <button
                    onClick={toggleTheme}
                    className={`p-1.5 sm:p-2 rounded-xl cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                    }`}
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    ) : (
                        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    )}
                </button>
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl cursor-pointer transition-colors ${
                        theme === 'dark' ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-500' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                    }`}
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">Logout</span>
                </button>
            </div>
        </header>
    );
};
