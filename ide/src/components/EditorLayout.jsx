import { Plus, PanelLeftClose, Download, Copy, PanelLeft, Play, Save, Check, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
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
    // Check if mobile/tablet (below md breakpoint - 768px)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isPanelOpen, setIsPanelOpen] = useState(!isMobile); // Hide file explorer on mobile by default
    const [isModalDialogOpen, setIsModalDialogOpen] = useState(false);
    const { sandpack } = useSandpack();
    const { code, updateCode } = useActiveCode();
    const { theme } = useTheme();

    const [saving, setSaving] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

    const saveTimeoutRef = useRef(null);
    const fileCacheRef = useRef(new Map());
    const lastSavedContentRef = useRef({});

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Auto-close file explorer on mobile if it was open
            if (mobile && isPanelOpen) {
                setIsPanelOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isPanelOpen]);

    const loadFileCache = useCallback(async () => {
        if (!selectedProject) return;

        try {
            const response = await fileAPI.getByProject(selectedProject._id);
            if (response.success) {
                const cache = new Map();
                response.data.forEach(file => {
                    const key = `${file.parentId || 'root'}_${file.name}`;
                    cache.set(key, file);

                    if (file.type === 'file') {
                        const filePath = buildFilePath(file, response.data);
                        lastSavedContentRef.current[filePath] = file.content || '';
                    }
                });
                fileCacheRef.current = cache;
            }
        } catch (error) {
            console.error('Failed to load file cache:', error);
            fileCacheRef.current = new Map();
        }
    }, [selectedProject]);

    const buildFilePath = (file, allFiles) => {
        if (!file.parentId) {
            return `/${file.name}`;
        }

        const parent = allFiles.find(f => f._id === file.parentId);
        if (parent && parent.type === 'folder') {
            const parentPath = buildFilePath(parent, allFiles);
            return `${parentPath}/${file.name}`;
        }

        return `/${file.name}`;
    };

    useEffect(() => {
        loadFileCache();
    }, [selectedProject, loadFileCache]);

    const handleSave = useCallback(async (filePath = null, showFeedback = true) => {
        if (!selectedProject) return;
        if (saving && showFeedback) return;

        const targetFile = filePath || sandpack.activeFile;
        if (!targetFile || !sandpack.files[targetFile]) return;

        try {
            if (showFeedback) setSaving(true);
            setSaveError(null);

            const content = sandpack.files[targetFile].code;

            if (!showFeedback && lastSavedContentRef.current[targetFile] === content) {
                return;
            }

            await saveFileToDatabase(targetFile, content);

            lastSavedContentRef.current[targetFile] = content;

            if (showFeedback) {
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 2000);
            }
        } catch (error) {
            console.error('Save error:', error);
            setSaveError(error.message || 'Failed to save');
            setTimeout(() => setSaveError(null), 5000);
        } finally {
            if (showFeedback) setSaving(false);
        }
    }, [selectedProject, sandpack.activeFile, sandpack.files, saving]);

    const saveAllFiles = useCallback(async () => {
        if (!selectedProject || saving) return;

        setSaving(true);
        setSaveError(null);

        try {
            const savePromises = Object.keys(sandpack.files).map(async (filePath) => {
                const content = sandpack.files[filePath].code;

                if (lastSavedContentRef.current[filePath] !== content) {
                    await saveFileToDatabase(filePath, content);
                    lastSavedContentRef.current[filePath] = content;
                }
            });

            await Promise.all(savePromises);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } catch (error) {
            console.error('Save all error:', error);
            setSaveError(error.message || 'Failed to save all files');
            setTimeout(() => setSaveError(null), 5000);
        } finally {
            setSaving(false);
        }
    }, [selectedProject, sandpack.files, saving]);

 
    const saveFileToDatabase = async (filePath, content) => {
        const { folders, fileName } = parseFilePath(filePath);

        if (fileName.endsWith('.json')) {
            if (!content.trim()) return;
            try {
                JSON.parse(content);
            } catch (e) {
                throw new Error('Invalid JSON syntax');
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

                if (!response.success) {
                    throw new Error('Failed to create folder: ' + folderName);
                }

                folder = response.data;
                fileCacheRef.current.set(cacheKey, folder);
            }
            currentParentId = folder._id;
        }

        const cacheKey = `${currentParentId || 'root'}_${fileName}`;
        const existingFile = fileCacheRef.current.get(cacheKey);

        if (existingFile && existingFile.type === 'file') {
            if (existingFile.content !== content) {
                const response = await fileAPI.update(existingFile._id, { content });

                if (!response.success) {
                    throw new Error('Failed to update file');
                }

                existingFile.content = content;
                fileCacheRef.current.set(cacheKey, existingFile);
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

            if (!response.success) {
                throw new Error('Failed to create file');
            }

            fileCacheRef.current.set(cacheKey, response.data);
        }
    };

    useEffect(() => {
        if (!autoSaveEnabled || !sandpack.activeFile || !selectedProject) return;

        const currentContent = sandpack.files[sandpack.activeFile]?.code;
        const lastSavedContent = lastSavedContentRef.current[sandpack.activeFile];

        if (currentContent === lastSavedContent) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            setAutoSaving(true);
            try {
                await handleSave(sandpack.activeFile, false);
            } finally {
                setAutoSaving(false);
            }
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [sandpack.files, sandpack.activeFile, autoSaveEnabled, selectedProject, handleSave]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    const handleFileCreated = useCallback(async (filePath) => {
        try {
            await saveFileToDatabase(filePath, '');
            lastSavedContentRef.current[filePath] = '';
            await loadFileCache();
        } catch (error) {
            console.error('Failed to save new file:', error);
            throw error;
        }
    }, [loadFileCache]);

    return (
        <div className="w-full h-full flex">
            {isModalDialogOpen && (
                <ModalDialog
                    setIsModalDialogOpen={setIsModalDialogOpen}
                    onFileCreated={handleFileCreated}
                />
            )}

            {/* File Explorer - responsive width and positioning */}
            {isPanelOpen && (
                <div className={`flex-col h-full ${
                    isMobile
                        ? 'absolute left-0 top-0 z-50 w-[80%] max-w-[280px] shadow-xl'
                        : 'relative w-[280px] md:w-[15%] min-w-[200px]'
                }`}>
                    <div className={`w-full h-[5%] min-h-[40px] flex items-center justify-between pl-3 pr-1 ${
                        theme === 'dark' ? 'bg-zinc-900 border-b border-zinc-800' : 'bg-gray-100 border-b border-gray-300'
                    }`}>
                        <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            EXPLORER
                        </span>
                        <div className="flex items-center gap-1">
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
                                title="New File"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className={`h-[95%] overflow-y-auto ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-50'}`}>
                        <FileTree
                            selectedProject={selectedProject}
                            fileCache={fileCacheRef.current}
                            onFileDeleted={() => {
                                loadFileCache();
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Backdrop for mobile file explorer */}
            {isPanelOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsPanelOpen(false)}
                />
            )}

            <div className={`${isPanelOpen && !isMobile ? 'w-[calc(100%-280px)] md:w-[85%]' : 'w-full'} h-full ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                <SandpackLayout style={{ height: '100%', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
                    <PanelGroup direction={isMobile ? "vertical" : "horizontal"} style={{ width: '100%', height: '100%' }}>
                        <Panel defaultSize={isMobile ? 60 : 50} minSize={isMobile ? 30 : 20}>
                            <div className="flex flex-col h-full">
                                <FileTabs closableTabs={true} />

                                <div className={`w-full min-h-[40px] flex items-center justify-between px-2 sm:px-4 gap-1 sm:gap-2 ${
                                    theme === 'dark' ? 'bg-zinc-900 border-b border-zinc-800' : 'bg-gray-100 border-b border-gray-300'
                                }`}>
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                        {!isPanelOpen && (
                                            <button
                                                className={`p-1 sm:p-1.5 rounded cursor-pointer ${
                                                    theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                }`}
                                                onClick={() => setIsPanelOpen(true)}
                                                title="Show Explorer"
                                            >
                                                <PanelLeft className="w-4 h-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleSave()}
                                            disabled={saving}
                                            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded cursor-pointer text-xs font-medium transition-all ${
                                                saveError
                                                    ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                                    : justSaved
                                                    ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                                    : saving
                                                    ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 cursor-wait'
                                                    : theme === 'dark'
                                                    ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30'
                                                    : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200'
                                            }`}
                                            title={saveError ? saveError : justSaved ? "Saved!" : "Save (Ctrl+S)"}
                                        >
                                            {saveError ? (
                                                <>
                                                    <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    <span className="hidden sm:inline">Error</span>
                                                </>
                                            ) : justSaved ? (
                                                <>
                                                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    <span className="hidden sm:inline">Saved</span>
                                                </>
                                            ) : saving ? (
                                                <>
                                                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="hidden sm:inline">Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    <span className="hidden sm:inline">Save</span>
                                                </>
                                            )}
                                        </button>

                                        <label className="flex items-center gap-1 sm:gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autoSaveEnabled}
                                                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded accent-orange-500"
                                            />
                                            <span className={`text-xs font-medium ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                <span className="hidden sm:inline">Auto-save {autoSaveEnabled && '(2s)'}</span>
                                                <span className="sm:hidden">Auto</span>
                                            </span>
                                        </label>

                                        {autoSaving && (
                                            <span className="text-xs text-orange-500 flex items-center gap-1 sm:gap-1.5">
                                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="hidden sm:inline">Auto-saving...</span>
                                            </span>
                                        )}

                                        {saveError && (
                                            <span className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                <span className="hidden sm:inline">{saveError}</span>
                                            </span>
                                        )}
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

                        <PanelResizeHandle className={`${
                            isMobile ? 'h-2 cursor-row-resize' : 'w-1 cursor-col-resize'
                        } transition ${
                            theme === 'dark' ? 'bg-zinc-700 hover:bg-orange-500 active:bg-orange-500' : 'bg-gray-300 hover:bg-orange-500 active:bg-orange-500'
                        }`} />

                        <Panel defaultSize={isMobile ? 40 : 50} minSize={isMobile ? 20 : 20}>
                            <SandpackPreview showNavigator={true} style={{ height: '100%' }} />
                        </Panel>
                    </PanelGroup>
                </SandpackLayout>
            </div>
        </div>
    );
};
