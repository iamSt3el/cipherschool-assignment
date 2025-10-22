import { Plus, PanelLeftClose, Download, Copy, PanelLeft, Play, Save, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    useSandpack,
    useActiveCode,
    FileTabs
} from "@codesandbox/sandpack-react";
import { FileTree } from "./FileTree";
import { ModalDialog } from "./ModalDialog";
import { useTheme } from "../context/ThemeContext";
import { fileAPI } from "../api/files";
import { parseFilePath, getLanguageFromExtension } from "../utils/fileHelpers";

export const EditorLayout = ({ selectedProject }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isModalDialogOpen, setIsModalDialogOpen] = useState(false);
    const { sandpack } = useSandpack();
    const { code, updateCode } = useActiveCode();
    const { theme } = useTheme();

    const [saving, setSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

    const autoSaveTimeoutRef = useRef(null);
    const previousCodeRef = useRef(code);
    const fileCacheRef = useRef(new Map()); 


    useEffect(() => {
        const loadFileCache = async () => {
            if (!selectedProject) return;

            try {
                const response = await fileAPI.getByProject(selectedProject._id);
                if (response.success) {
                    const cache = new Map();
                    response.data.forEach(file => {
                        const key = `${file.parentId || 'root'}_${file.name}`;
                        cache.set(key, file);
                    });
                    fileCacheRef.current = cache;
                    console.log(`Loaded ${cache.size} files into cache`);
                }
            } catch (error) {
                console.error('Error loading file cache:', error);
            }
        };

        loadFileCache();
    }, [selectedProject]);

  
    const handleSave = async () => {
        if (!selectedProject || !sandpack.activeFile || saving) return;

        try {
            setSaving(true);
            const filePath = sandpack.activeFile;
            const content = sandpack.files[filePath].code;

            await saveFileToDatabase(filePath, content);

            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } catch (error) {
            console.error('save failed:', error);
        } finally {
            setSaving(false);
        }
    };

 
    const saveFileToDatabase = async (filePath, content) => {
        const { folders, fileName } = parseFilePath(filePath);

        if (fileName.endsWith('.json')) {
            if (!content.trim()) {
                console.warn(`Skipping empty JSON file: ${filePath}`);
                return;
            }
            try {
                JSON.parse(content);
            } catch (e) {
                console.warn(`Skipping invalid JSON file: ${filePath}`, e.message);
                return;
            }
        }

        let currentParentId = null;
        for (const folderName of folders) {
            const cacheKey = `${currentParentId || 'root'}_${folderName}`;
            let folder = fileCacheRef.current.get(cacheKey);

            if (!folder) {
                const response = await fileAPI.create({
                    projectId: selectedProject._id,
                    parentId: currentParentId,
                    name: folderName,
                    type: 'folder'
                });
                if (response.success) {
                    folder = response.data;
                    fileCacheRef.current.set(cacheKey, folder);
                }
            }
            currentParentId = folder._id;
        }

        const cacheKey = `${currentParentId || 'root'}_${fileName}`;
        const existingFile = fileCacheRef.current.get(cacheKey);

        if (existingFile && existingFile.type === 'file') {
            if (existingFile.content !== content) {
                await fileAPI.update(existingFile._id, { content });
                existingFile.content = content; // Update cache
            } 
        } else {
            const response = await fileAPI.create({
                projectId: selectedProject._id,
                parentId: currentParentId,
                name: fileName,
                type: 'file',
                content,
                language: getLanguageFromExtension(fileName)
            });

            if (response.success) {
                fileCacheRef.current.set(cacheKey, response.data);
                console.log(`created: ${filePath}`);
            }
        }
    };


    useEffect(() => {
        if (!autoSaveEnabled || !sandpack.activeFile || !selectedProject) return;

        const currentCode = sandpack.files[sandpack.activeFile]?.code;
        if (previousCodeRef.current === currentCode) return;

        previousCodeRef.current = currentCode;

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set new timeout for auto-save (3 seconds after last change)
        autoSaveTimeoutRef.current = setTimeout(() => {
            handleSave();
        }, 3000);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [code, sandpack.activeFile, autoSaveEnabled, selectedProject]);


    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sandpack.activeFile, selectedProject]);

    return (
        <div className="w-full h-full flex">
            {isModalDialogOpen && <ModalDialog setIsModalDialogOpen={setIsModalDialogOpen} />}

            {/* File Explorer */}
            {isPanelOpen && (
                <div className="flex-col h-full w-[15%]">
                    <div className={`w-full h-[5%] flex items-center justify-between pl-4 pr-1 ${
                        theme === 'dark' ? 'bg-zinc-900 border-b border-zinc-800' : 'bg-gray-100 border-b border-gray-300'
                    }`}>
                        <span className={`text-xs text-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            EXPLORER
                        </span>
                        <div>
                            <button
                                className={`p-1 rounded cursor-pointer ${
                                    theme === 'dark' ? 'hover:bg-zinc-800 text-white' : 'hover:bg-gray-200 text-gray-700'
                                }`}
                                onClick={() => setIsPanelOpen(false)}
                                title="Hide Explorer"
                            >
                                <PanelLeftClose className="w-4 h-4" />
                            </button>
                            <button
                                className={`p-1 rounded cursor-pointer ${
                                    theme === 'dark' ? 'hover:bg-zinc-800 text-white' : 'hover:bg-gray-200 text-gray-700'
                                }`}
                                onClick={() => setIsModalDialogOpen(true)}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className={`h-[95%] ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
                        <FileTree />
                    </div>
                </div>
            )}

            {/* Editor and Preview */}
            <div className={`${isPanelOpen ? 'w-[85%]' : 'w-full'} h-full ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                <SandpackLayout style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
                    <PanelGroup direction="horizontal" style={{ width: '100%', height: '100%' }}>
                        <Panel defaultSize={50} minSize={20}>
                            <div className="flex flex-col h-full">
                                <FileTabs closableTabs={true} />

                                {/* Toolbar */}
                                <div className={`w-full h-[5%] flex items-center justify-between pr-4 pl-4 gap-2 ${
                                    theme === 'dark' ? 'bg-zinc-900 border-b border-zinc-800' : 'bg-gray-100 border-b border-gray-300'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {!isPanelOpen && (
                                            <button
                                                className={`p-1 rounded cursor-pointer ${
                                                    theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                }`}
                                                onClick={() => setIsPanelOpen(true)}
                                                title="Show Explorer"
                                            >
                                                <PanelLeft className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Save Button */}
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded cursor-pointer text-xs font-medium transition-all ${
                                                justSaved
                                                    ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                                    : saving
                                                    ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 cursor-wait'
                                                    : theme === 'dark'
                                                    ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30'
                                                    : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200'
                                            }`}
                                            title={justSaved ? "Saved!" : "Save (Ctrl+S)"}
                                        >
                                            {justSaved ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    Saved
                                                </>
                                            ) : saving ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-3.5 h-3.5" />
                                                    Save
                                                </>
                                            )}
                                        </button>

                                        {/* Auto-save Toggle */}
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autoSaveEnabled}
                                                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                                className="w-3.5 h-3.5 rounded accent-orange-500"
                                            />
                                            <span className={`text-xs font-medium ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                Auto-save
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <SandpackCodeEditor
                                        showTabs={false}
                                        showLineNumbers={true}
                                        wrapContent
                                        showRunButton={false}
                                        style={{ height: '100%' }}
                                    />
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className={`w-1 transition cursor-col-resize ${
                            theme === 'dark' ? 'bg-zinc-700 hover:bg-orange-500' : 'bg-gray-300 hover:bg-orange-500'
                        }`} />

                        <Panel defaultSize={50} minSize={20}>
                            <SandpackPreview showNavigator={true} style={{ height: '100%' }} />
                        </Panel>
                    </PanelGroup>
                </SandpackLayout>
            </div>
        </div>
    );
};
