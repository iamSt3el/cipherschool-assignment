import {X} from "lucide-react";
import { useState } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";

export const ModalDialog = ({setIsModalDialogOpen}) => {
    const [fileName, setFileName] = useState("");
    const { sandpack } = useSandpack();

    const handleCreate = () => {
        if (fileName.trim()) {
            const path = fileName.startsWith('/') ? fileName : '/' + fileName;
            sandpack.addFile(path, '');
            setIsModalDialogOpen(false);
            setFileName("");
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-96 overflow-hidden">
                <div className="px-5 py-5 border-b border-zinc-800 flex items-center justify-between">
                   <h2 className="text-base font-semibold">Create new File/Folder</h2> 
                   <button className="p-1 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        onClick={() => setIsModalDialogOpen(false)}
                    >
                        <X className="w-4 h-4"/>
                    </button>
                </div>
                
                <div className="p-5">
                    <label className="block text-sm text-gray-400 mb-2">
                        File/Folder
                    </label>
                    <input
                        type="text"
                        placeholder="file/folder name"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className="w-full px-4 py-2.5 bg-black border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                        autoFocus
                    />
                </div>

                <div className="px-5 py-4 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-2">
                    <button className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors curosr-pointer"
                    onClick={() => setIsModalDialogOpen(false)}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all font-medium shadow-lg shadow-orange-500/25 cursor-pointer">
                        Create
                    </button>
                    
                </div>
                
            </div>
            
        </div>
    )
}
