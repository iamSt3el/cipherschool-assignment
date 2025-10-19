import React, { useState } from 'react'
import { useSandpack } from "@codesandbox/sandpack-react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";

// Helper function to build tree structure from file paths
const buildFileTree = (files) => {
    const tree = {};

    Object.keys(files).forEach((filePath) => {
        const parts = filePath.split('/').filter(Boolean); // Remove empty strings
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

// Component to render a single file or folder
const TreeNode = ({ node, activeFile, onFileClick, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = Object.keys(node.children).length > 0;
    const isActive = node.path === activeFile;

    const handleClick = () => {
        if (node.isFile) {
            onFileClick(node.path);
        } else {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div>
            <div
                onClick={handleClick}
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-zinc-800 transition ${
                    isActive ? 'bg-zinc-800 border-l-2 border-orange-500' : ''
                }`}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
            >
                {node.isFile ? (
                    <>
                        <div className="w-4" />
                        <File className="w-4 h-4 text-gray-400" />
                    </>
                ) : (
                    <>
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        {isOpen ? <FolderOpen className="w-4 h-4 text-orange-500" /> : <Folder className="w-4 h-4 text-orange-500" />}
                    </>
                )}
                <span className="text-sm">{node.name}</span>
            </div>

            {!node.isFile && isOpen && hasChildren && (
                <div>
                    {Object.values(node.children)
                        .sort((a, b) => {
                            // Sort folders first, then files
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
                                level={level + 1}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export const FileTree = () => {
    const { sandpack } = useSandpack();
    const { files, activeFile, openFile } = sandpack;

    const fileTree = buildFileTree(files);

    const handleFileClick = (filePath) => {
        openFile(filePath);
    };

    return (
        <div className="text-white">
            {Object.values(fileTree)
                .sort((a, b) => {
                    // Sort folders first, then files
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
                    />
                ))}
        </div>
    )
}

