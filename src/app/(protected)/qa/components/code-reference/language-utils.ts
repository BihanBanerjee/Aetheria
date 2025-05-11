// app/(protected)/qa/components/code-reference/language-utils.ts

/**
 * Helper function to determine language from file extension for syntax highlighting
 */
export const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Mapping for common file types
  switch (extension) {
    case 'js':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'sh':
      return 'bash';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'dockerfile':
      return 'docker';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'md':
      return 'markdown';
    case 'prisma':
      return 'javascript'; // Use JS highlighting for Prisma files
    default:
      // Try to infer from filename for specific cases
      if (fileName.includes('Dockerfile')) {
        return 'docker';
      }
      return 'typescript'; // Default fallback
  }
};

/**
 * Helper function to clean code from string formatting artifacts
 */
export const cleanSourceCode = (sourceCode: string): string => {
  // Remove potential unwanted quotation marks at the start and end
  let cleanedCode = sourceCode.replace(/\\n/g, '\n');
  
  // Replace escaped quotes with actual quotes
  cleanedCode = cleanedCode.replace(/\\"/g, '"');
  
  // Replace unnecessary backslashes that are escaping characters
  cleanedCode = cleanedCode.replace(/\\(?=[^nrt"'\\])/g, '');
  
  // Check if the code starts and ends with quotes and remove them if they exist
  if ((cleanedCode.startsWith('"') && cleanedCode.endsWith('"')) || 
      (cleanedCode.startsWith("'") && cleanedCode.endsWith("'"))) {
    cleanedCode = cleanedCode.substring(1, cleanedCode.length - 1);
  }
  
  return cleanedCode;
};