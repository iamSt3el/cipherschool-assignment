import {X} from "lucide-react";
import { useState } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import { useTheme } from "../context/ThemeContext";

export const ModalDialog = ({setIsModalDialogOpen, onFileCreated}) => {
    const [fileName, setFileName] = useState("");
    const [creating, setCreating] = useState(false);
    const { sandpack } = useSandpack();
    const { theme } = useTheme();

    const handleCreate = async () => {
        if (fileName.trim() && !creating) {
            try {
                setCreating(true);
                const path = fileName.startsWith('/') ? fileName : '/' + fileName;

                sandpack.addFile(path, '');

                await new Promise(resolve => setTimeout(resolve, 100));

                if (onFileCreated) {
                    await onFileCreated(path);
                }

                setIsModalDialogOpen(false);
                setFileName("");
            } catch (error) {
                console.error('Failed to create file:', error);
                alert('Failed to create file: ' + error.message);
            } finally {
                setCreating(false);
            }
        }
    };
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4 ${
            theme === 'dark' ? 'bg-black/20' : 'bg-black/40'
        }`}>
            <div className={`rounded-lg shadow-2xl w-full max-w-md sm:w-96 overflow-hidden ${
                theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-200'
            }`}>
                <div className={`px-4 sm:px-5 py-4 sm:py-5 flex items-center justify-between ${
                    theme === 'dark' ? 'border-b border-zinc-800' : 'border-b border-gray-200'
                }`}>
                   <h2 className={`text-sm sm:text-base font-semibold ${
                       theme === 'dark' ? 'text-white' : 'text-gray-900'
                   }`}>Create new File/Folder</h2>
                   <button className={`p-1 rounded transition-colors cursor-pointer ${
                       theme === 'dark' ? 'hover:bg-zinc-800 text-white' : 'hover:bg-gray-100 text-gray-700'
                   }`}
                        onClick={() => setIsModalDialogOpen(false)}
                    >
                        <X className="w-4 h-4"/>
                    </button>
                </div>

                <div className="p-4 sm:p-5">
                    <label className={`block text-sm mb-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        File/Folder
                    </label>
                    <input
                        type="text"
                        placeholder="file/folder name"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm focus:outline-none focus:border-orange-500 transition-colors ${
                            theme === 'dark'
                                ? 'bg-black border-zinc-700 text-white placeholder-gray-500'
                                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                        autoFocus
                    />
                </div>

                <div className={`px-4 sm:px-5 py-3 sm:py-4 flex justify-end gap-2 ${
                    theme === 'dark' ? 'bg-zinc-950 border-t border-zinc-800' : 'bg-gray-50 border-t border-gray-200'
                }`}>
                    <button className={`px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                        theme === 'dark'
                            ? 'text-gray-400 hover:text-white hover:bg-zinc-800'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                    onClick={() => setIsModalDialogOpen(false)}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className={`px-3 sm:px-4 py-2 text-sm rounded-lg transition-all font-medium shadow-lg shadow-orange-500/25 ${
                            creating
                                ? 'bg-orange-400 cursor-wait'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 cursor-pointer'
                        } text-white`}>
                        {creating ? 'Creating...' : 'Create'}
                    </button>

                </div>

            </div>

        </div>
    )
}
