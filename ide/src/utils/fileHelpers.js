/**
 * Helper functions for file management
 */

/**
 * Build full file path from database file object with parent hierarchy
 */
export const buildFilePath = (file, allFiles) => {
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

export const convertDBFilesToSandpack = (dbFiles) => {
  const sandpackFiles = {};

  dbFiles.forEach(file => {
    if (file.type === 'file') {
      const filePath = buildFilePath(file, dbFiles);

      if (filePath.endsWith('.json')) {
        if (!file.content || !file.content.trim()) {
          return;
        }
        try {
          JSON.parse(file.content);
          sandpackFiles[filePath] = { code: file.content };
        } catch (e) {
          return;
        }
      } else {
        sandpackFiles[filePath] = { code: file.content || '' };
      }
    }
  });

  return sandpackFiles;
};

/**
 * Get file extension language mapping
 */
export const getLanguageFromExtension = (filename) => {
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.json')) return 'json';
  return 'javascript';
};

/**
 * Parse file path into parts (folder structure + filename)
 */
export const parseFilePath = (filePath) => {
  const cleanPath = filePath.replace(/^\//, '');
  const parts = cleanPath.split('/');

  return {
    folders: parts.slice(0, -1), // All parts except last
    fileName: parts[parts.length - 1], // Last part
    fullPath: cleanPath
  };
};
