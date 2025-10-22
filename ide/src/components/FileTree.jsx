import React, { useState } from 'react'
import { useSandpack } from "@codesandbox/sandpack-react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Trash2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { fileAPI } from "../api/files";

const buildFileTree = (files) => {
    const tree = {};

    Object.keys(files).forEach((filePath) => {
        const parts = filePath.split('/').filter(Boolean);
        let current = tree;

        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = {
                    name: part,
                    path: '/' + parts.slice(0, index + 1).join('/'),
                    isFile: index === parts.length - 1,
                    children: {}
                };
            }
            current = current[part].children;
        });
    });

    return tree;
};

const TreeNode = ({ node, activeFile, onFileClick, onDelete, level = 0, theme }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const hasChildren = Object.keys(node.children).length > 0;
    const isActive = node.path === activeFile;

    const handleClick = () => {
        if (node.isFile) {
            onFileClick(node.path);
        } else {
            setIsOpen(!isOpen);
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        const confirmMsg = node.isFile
            ? `Are you sure you want to delete "${node.name}"?`
            : `Are you sure you want to delete folder "${node.name}" and all its contents?`;

        if (window.confirm(confirmMsg)) {
            onDelete(node.path, node.isFile);
        }
    };

    return (
        <div>
            <div
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`flex items-center justify-between gap-2 px-2 sm:px-3 py-2 sm:py-1.5 cursor-pointer transition group touch-manipulation ${
                    theme === 'dark' ? 'hover:bg-zinc-800 active:bg-zinc-800' : 'hover:bg-gray-200 active:bg-gray-200'
                } ${
                    isActive ? `${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'} border-l-2 border-orange-500` : ''
                }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {node.isFile ? (
                        <>
                            <div className="w-4" />
                            <File className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                        </>
                    ) : (
                        <>
                            {isOpen ? (
                                <ChevronDown className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
                            ) : (
                                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
                            )}
                            {isOpen ? <FolderOpen className="w-4 h-4 flex-shrink-0 text-orange-500" /> : <Folder className="w-4 h-4 flex-shrink-0 text-orange-500" />}
                        </>
                    )}
                    <span className={`text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{node.name}</span>
                </div>

                {isHovered && (
                    <button
                        onClick={handleDelete}
                        className={`p-1.5 sm:p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${
                            theme === 'dark' ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                )}
            </div>

            {!node.isFile && isOpen && hasChildren && (
                <div>
                    {Object.values(node.children)
                        .sort((a, b) => {
                            if (a.isFile === b.isFile) {
                                return a.name.localeCompare(b.name);
                            }
                            return a.isFile ? 1 : -1;
                        })
                        .map((child) => (
                            <TreeNode
                                key={child.path}
                                node={child}
                                activeFile={activeFile}
                                onFileClick={onFileClick}
                                onDelete={onDelete}
                                level={level + 1}
                                theme={theme}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export const FileTree = ({ selectedProject, onFileDeleted, fileCache }) => {
    const { sandpack, deleteFile } = useSandpack();
    const { files, activeFile, openFile } = sandpack;
    const { theme } = useTheme();

    const fileTree = buildFileTree(files);

    const handleFileClick = (filePath) => {
        openFile(filePath);
    };

    const handleDelete = async (filePath, isFile) => {
        try {
            const pathParts = filePath.split('/').filter(Boolean);
            let fileId = null;

            let currentParentId = null;
            for (let i = 0; i < pathParts.length; i++) {
                const partName = pathParts[i];
                const cacheKey = `${currentParentId || 'root'}_${partName}`;
                const cachedFile = fileCache?.get(cacheKey);

                if (!cachedFile) {
                    alert('File not found in cache');
                    return;
                }

                if (i === pathParts.length - 1) {
                    fileId = cachedFile._id;
                } else {
                    currentParentId = cachedFile._id;
                }
            }

            if (fileId) {
                await fileAPI.delete(fileId);

                if (isFile) {
                    sandpack.deleteFile(filePath);
                } else {
                    const filesToDelete = Object.keys(files).filter(key =>
                        key.startsWith(filePath + '/') || key === filePath
                    );

                    filesToDelete.forEach(fileToDelete => {
                        sandpack.deleteFile(fileToDelete);
                    });
                }

                if (onFileDeleted) {
                    onFileDeleted();
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file/folder: ' + (error.message || 'Unknown error'));
        }
    };

    return (
        <div>
            {Object.values(fileTree)
                .sort((a, b) => {
                    if (a.isFile === b.isFile) {
                        return a.name.localeCompare(b.name);
                    }
                    return a.isFile ? 1 : -1;
                })
                .map((node) => (
                    <TreeNode
                        key={node.path}
                        node={node}
                        activeFile={activeFile}
                        onFileClick={handleFileClick}
                        onDelete={handleDelete}
                        theme={theme}
                    />
                ))}
        </div>
    )
}

