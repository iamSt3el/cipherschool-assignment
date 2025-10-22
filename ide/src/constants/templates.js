/**
 * Predefined project templates
 */

export const REACT_TEMPLATE = {
  '/App.js': {
    code: `export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`
  },
  '/index.js': {
    code: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`
  },
  '/styles.css': {
    code: `.App {
  font-family: sans-serif;
  text-align: center;
}
`
  },
  '/public/index.html': {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`
  },
  '/package.json': {
    code: `{
  "name": "react-app",
  "version": "1.0.0",
  "description": "React application",
  "main": "index.js",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "^5.0.1"
  },
  "devDependencies": {
    "@babel/runtime": "7.13.8",
    "typescript": "4.1.3"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  },
  "browserslist": [">0.2%", "not dead", "not ie <= 11", "not op_mini all"]
}
`
  }
};


export const templateToFileObjects = (template, projectId) => {
  const fileObjects = [];
  const folderMap = new Map(); // Track created folders

  for (const [filePath, fileData] of Object.entries(template)) {
    const cleanPath = filePath.replace(/^\//, '');
    const parts = cleanPath.split('/');
    const fileName = parts[parts.length - 1];
    const folders = parts.slice(0, -1);

    // Create folder hierarchy
    let currentParentId = null;
    for (let i = 0; i < folders.length; i++) {
      const folderName = folders[i];
      const folderPath = folders.slice(0, i + 1).join('/');

      if (!folderMap.has(folderPath)) {
        const folderObj = {
          projectId,
          parentId: currentParentId,
          name: folderName,
          type: 'folder'
        };
        fileObjects.push(folderObj);
        folderMap.set(folderPath, fileObjects.length - 1); // Store index
        currentParentId = folderPath; // Use path as temporary ID
      } else {
        currentParentId = folderPath;
      }
    }

    // Create file object
    fileObjects.push({
      projectId,
      parentId: currentParentId,
      name: fileName,
      type: 'file',
      content: fileData.code,
      language: getLanguageFromExtension(fileName)
    });
  }

  return fileObjects;
};

const getLanguageFromExtension = (filename) => {
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.json')) return 'json';
  return 'javascript';
};
