import { fileAPI } from '../api/files';
import { getLanguageFromExtension, parseFilePath } from '../utils/fileHelpers';



class FileService {
  constructor() {
    this.fileCache = new Map(); // Cache file IDs to avoid duplicate lookups
  }


  async loadProjectFiles(projectId) {
    try {
      const response = await fileAPI.getByProject(projectId);
      const files = response.success ? response.data : [];

      // Build cache of files by path for quick lookups
      this.buildFileCache(files);

      return files;
    } catch (error) {
      console.error('Error loading project files:', error);
      return [];
    }
  }


  buildFileCache(files) {
    this.fileCache.clear();

    files.forEach(file => {
      const key = this.getCacheKey(file.name, file.parentId);
      this.fileCache.set(key, file);
    });
  }


  getCacheKey(name, parentId) {
    return `${parentId || 'root'}_${name}`;
  }


  findInCache(name, parentId) {
    const key = this.getCacheKey(name, parentId);
    return this.fileCache.get(key);
  }

  async findOrCreateFolder(projectId, folderName, parentId = null) {
    // Check cache first
    const cached = this.findInCache(folderName, parentId);
    if (cached && cached.type === 'folder') {
      return cached._id;
    }

    // Create folder
    try {
      const response = await fileAPI.create({
        projectId,
        parentId,
        name: folderName,
        type: 'folder'
      });

      if (response.success) {
        const folder = response.data;
        this.fileCache.set(this.getCacheKey(folderName, parentId), folder);
        return folder._id;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save all Sandpack files to backend
   */
  async saveAllFiles(projectId, sandpackFiles) {

    try {
      // Load existing files
      const existingFiles = await this.loadProjectFiles(projectId);

      let created = 0;
      let updated = 0;
      let skipped = 0;

      // Process each Sandpack file
      for (const [filePath, fileData] of Object.entries(sandpackFiles)) {
        const { folders, fileName } = parseFilePath(filePath);
        const content = fileData.code || '';

        if (fileName.endsWith('.json')) {
          if (!content.trim()) {
            skipped++;
            continue;
          }
          try {
            JSON.parse(content);
          } catch (e) {
            skipped++;
            continue;
          }
        }

        let currentParentId = null;
        for (const folderName of folders) {
          currentParentId = await this.findOrCreateFolder(
            projectId,
            folderName,
            currentParentId
          );
        }

        const existingFile = this.findInCache(fileName, currentParentId);

        if (existingFile && existingFile.type === 'file') {
          // Update existing file
          if (existingFile.content !== content) {
            await fileAPI.update(existingFile._id, { content });
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Create new file
          const response = await fileAPI.create({
            projectId,
            parentId: currentParentId,
            name: fileName,
            type: 'file',
            content,
            language: getLanguageFromExtension(fileName)
          });

          if (response.success) {
            this.fileCache.set(
              this.getCacheKey(fileName, currentParentId),
              response.data
            );
            created++;
          }
        }
      }


      return {
        success: true,
        created,
        updated,
        skipped
      };
    } catch (error) {
      throw error;
    }
  }


  clearCache() {
    this.fileCache.clear();
  }
}

export const fileService = new FileService();
