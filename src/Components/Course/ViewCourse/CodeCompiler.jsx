import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import axiosInstance from '../../../Helpers/axiosInstance';
import { DarkModeContext } from '../../../Layouts/DarkModeContext';
import { FiCopy, FiDownload, FiXCircle, FiPlay, FiHelpCircle, FiSave, FiClock, FiChevronDown, FiActivity, FiArchive, FiTerminal, FiCode, FiType } from 'react-icons/fi';
import Layout from '../../../Layouts/HomeLayout';

const CodeCompiler = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [fileName, setFileName] = useState('Untitled');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const editorRef = useRef(null);
  
  // Refs for latest functions
  const handleDownloadCodeRef = useRef();
  const handleRunCodeRef = useRef();
  const toggleCommentRef = useRef();
  const formatCodeRef = useRef();

  useEffect(() => {
    handleDownloadCodeRef.current = handleDownloadCode;
    handleRunCodeRef.current = handleRunCode;
    toggleCommentRef.current = toggleComment;
    formatCodeRef.current = formatCode;
  });

  const isMac = navigator.platform.includes('Mac');
  const EXECUTION_TIMEOUT = 5000;

  const langConfig = {
    python: { 
      name: 'Python', 
      extension: 'py', 
      comment: '#',
      formatter: async (editor) => {
        await editor.getAction('editor.action.formatDocument').run();
      }
    },
    cpp: { 
      name: 'C++', 
      extension: 'cpp', 
      comment: '//',
      formatter: async (editor) => {
        await editor.getAction('editor.action.formatDocument').run();
      }
    },
    c: { 
      name: 'C', 
      extension: 'c', 
      comment: '//',
      formatter: async (editor) => {
        await editor.getAction('editor.action.formatDocument').run();
      }
    },
    java: { 
      name: 'Java', 
      extension: 'java', 
      comment: '//',
      formatter: async (editor) => {
        await editor.getAction('editor.action.formatDocument').run();
      }
    },
    javascript: {
      name: 'JavaScript',
      extension: 'js',
      comment: '//',
      formatter: async (editor) => {
        await editor.getAction('editor.action.formatDocument').run();
      }
    }
  };

  const templates = {
    python: '# Start coding here...\nprint("Hello, World!")',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    javascript: '// JavaScript code\nconsole.log("Hello World");'
  };

  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    setRecentFiles(savedFiles);
    
    const lastSession = JSON.parse(localStorage.getItem('lastSession'));
    if (lastSession) {
      setCode(lastSession.code);
      setInput(lastSession.input);
      setFileName(lastSession.fileName);
      setLanguage(lastSession.language);
    } else {
      setCode(templates[language]);
    }
  }, []);

  const saveSession = useCallback(() => {
    const sessionData = {
      code: editorRef.current?.getValue() || code,
      input,
      fileName,
      language,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('lastSession', JSON.stringify(sessionData));
    
    setRecentFiles(prev => {
      const newFiles = [sessionData, ...prev.filter(f => f.fileName !== fileName)];
      return newFiles.slice(0, 5);
    });
  }, [code, input, fileName, language]);

  useEffect(() => {
    localStorage.setItem('recentFiles', JSON.stringify(recentFiles.slice(0, 5)));
  }, [recentFiles]);

  const handleNewFile = () => {
    setCode(templates[language]);
    setInput('');
    setOutput('');
    setError('');
    setFileName('Untitled');
    saveSession();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const extension = file.name.split('.').pop();
      const lang = Object.keys(langConfig).find(l => langConfig[l].extension === extension) || 'python';
      
      setCode(content);
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
      setLanguage(lang);
      saveSession();
    };
    reader.readAsText(file);
  };

  const handleDownloadCode = useCallback((saveAs = false) => {
    const defaultName = `${fileName}.${langConfig[language].extension}`;
    const name = saveAs ? 
      prompt('Enter file name:', defaultName) || defaultName :
      defaultName;

    const content = editorRef.current?.getValue() || code;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    saveSession();
  }, [fileName, language, code, saveSession]);

  const toggleComment = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
  
    const selection = editor.getSelection();
    const model = editor.getModel();
    const comment = langConfig[language].comment;
    
    const edits = [];
    for (let lineNumber = selection.startLineNumber; lineNumber <= selection.endLineNumber; lineNumber++) {
      const line = model.getLineContent(lineNumber);
      const range = {
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn: 1,
        endColumn: line.length + 1
      };
  
      edits.push(line.startsWith(comment) ? 
        { range, text: line.replace(comment, '') } :
        { range, text: `${comment}${line}` }
      );
    }
  
    editor.executeEdits('toggle-comment', edits);
  }, [language]);

  const formatCode = useCallback(async () => {
    try {
      if (editorRef.current && langConfig[language]?.formatter) {
        await langConfig[language].formatter(editorRef.current);
      }
    } catch (error) {
      setError('Formatting not available for this language');
    }
  }, [language]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => toggleCommentRef.current());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => handleRunCodeRef.current());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => handleDownloadCodeRef.current(false));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => formatCodeRef.current());

    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      setLineCount(model.getLineCount());
      setCharCount(model.getValueLength());
      saveSession();
    });
  };

  const handleRunCode = useCallback(async () => {
    setLoading(true);
    setError('');
    setOutput('');
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT);

      const res = await axiosInstance.post('/courses/execute', { 
        language,
        code: editorRef.current.getValue(),
        input
      }, { signal: controller.signal });

      clearTimeout(timeoutId);
      setOutput(res.data.output);
      setExecutionTime(Date.now() - startTime);
    } catch (err) {
      setError(err.response?.data?.error || 
        (err.name === 'AbortError' ? 'Executions timed out (5s)' : err.message));
    } finally {
      setLoading(false);
    }
  }, [language, input]);

  const LanguageDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setShowLangDropdown(!showLangDropdown)}
        className="flex items-center px-4 py-2 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-700"
      >
        {langConfig[language].name}
        <FiChevronDown className="ml-2" />
      </button>
      
      {showLangDropdown && (
        <div className="absolute z-10 w-48 mt-2 bg-white rounded-lg shadow-xl dark:bg-gray-800">
          {Object.entries(langConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setLanguage(key);
                setShowLangDropdown(false);
                setCode(templates[key]);
                setFileName('Untitled');
                saveSession();
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {config.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
    <div className={`max-w-7xl mx-auto p-6 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFileDropdown(!showFileDropdown)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all bg-white rounded-lg shadow-sm hover:shadow-md dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 group"
            >
              <span className="text-gray-700 dark:text-gray-200">File</span>
              <FiChevronDown className="w-4 h-4 text-gray-500 transition-transform dark:text-gray-400 group-hover:rotate-180" />
            </button>
            
            {showFileDropdown && (
              <div className="absolute z-20 w-48 mt-2 bg-white rounded-lg shadow-xl dark:bg-gray-800 ring-1 ring-black/5">
                <div className="p-1 space-y-1">
                  <button 
                    onClick={handleNewFile}
                    className="flex items-center w-full px-3 py-2 text-sm transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    <FiSave className="mr-2 text-blue-500" /> New File
                    <kbd className="ml-auto text-xs opacity-60">⌘N</kbd>
                  </button>
                  <label className="block cursor-pointer">
                    <div className="flex items-center px-3 py-2 transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-gray-700">
                      <FiDownload className="mr-2 text-purple-500" /> Open
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </div>
                  </label>
                  <button 
                    onClick={() => handleDownloadCode(false)}
                    className="flex items-center w-full px-3 py-2 text-sm transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    <FiSave className="mr-2 text-green-500" /> Save
                    <kbd className="ml-auto text-xs opacity-60">⌘S</kbd>
                  </button>
                  <button 
                    onClick={() => handleDownloadCode(true)}
                    className="flex items-center w-full px-3 py-2 text-sm transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    <FiSave className="mr-2 text-yellow-500" /> Save As...
                    <kbd className="ml-auto text-xs opacity-60">⇧⌘S</kbd>
                  </button>
                </div>
              </div>
            )}
          </div>
          <LanguageDropdown />
        </div>

        <button
          onClick={() => setShowHelp(true)}
          className="p-2 transition-all rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 backdrop-blur-sm"
        >
          <FiHelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300 hover:text-blue-500" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column - Editor */}
        <div className="md:col-span-2">
          <div className="shadow-xl rounded-xl ring-1 ring-black/10 dark:ring-white/10">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {fileName}.{langConfig[language].extension}
              </span>
              <span className="px-2 py-1 font-mono text-xs text-blue-600 rounded-full bg-blue-100/50 dark:bg-gray-700 dark:text-blue-400">
                {langConfig[language].name}
              </span>
            </div>
            <div className="flex p-3 space-x-3 text-gray-500 dark:text-gray-400">
              <span className="flex items-center text-sm">
                <FiCode className="w-4 h-4 mr-1" /> {lineCount} lines
              </span>
              <span className="flex items-center text-sm">
                <FiType className="w-4 h-4 mr-1" /> {charCount} chars
              </span>
              {executionTime > 0 && (
                <span className="flex items-center text-sm">
                  <FiClock className="w-4 h-4 mr-1" /> {executionTime}ms
                </span>
              )}
            </div>
          </div>

          {/* Editor Container */}
          <div className="relative h-[500px] mt-4">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme={isDarkMode ? 'vs-dark' : 'vs-light'}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                fontSize: 15,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                padding: { top: 15 },
                renderLineHighlight: 'gutter',
              }}
            />
            
            <div className="absolute flex gap-2 pl-4 right-4 top-4 bg-gradient-to-l from-white/30 dark:from-gray-800/30">
              <button
                onClick={() => handleDownloadCode(true)}
                className="p-2 transition-all rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm hover:scale-105"
                title="Save As..."
              >
                <FiSave className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => handleDownloadCode(false)}
                className="p-2 transition-all rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm hover:scale-105"
                title={`Save (${isMac ? '⌘' : 'Ctrl'}+S)`}
              >
                <FiDownload className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-1">
          <div className="flex flex-col gap-6">
            {/* Input Panel */}
            {/* <div className="shadow-xl rounded-xl ring-1 ring-black/10 dark:ring-white/10">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-t-xl">
                <h3 className="flex items-center text-sm font-semibold">
                  <FiTerminal className="mr-2 text-blue-500" />
                  Custom Input
                  <span className="ml-2 text-xs font-normal text-gray-500">(Ctrl+Enter to run)</span>
                </h3>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`w-full h-40 p-4 font-mono text-sm focus:outline-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}
                placeholder="Enter input here..."
              />
            </div> */}

            {/* Output Panel */}
            <div className="shadow-xl rounded-xl ring-1 ring-black/10 dark:ring-white/10">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-t-xl">
                <h3 className="flex items-center text-sm font-semibold">
                  <FiActivity className="mr-2 text-green-500" />
                  Output
                </h3>
                <button
                  onClick={() => navigator.clipboard.writeText(output || error)}
                  className="flex items-center text-sm transition-opacity opacity-80 hover:opacity-100"
                >
                  <FiCopy className="mr-1.5" /> Copy
                </button>
              </div>
              <pre className={`h-40 p-4 overflow-auto font-mono text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm ${
                isDarkMode ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {error ? (
                  <span className="text-red-500">{error}</span>
                ) : loading ? (
                  <div className="flex items-center text-gray-500">
                    <div className="w-4 h-4 mr-2 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
                    Executing code...
                  </div>
                ) : (
                  output || <span className="text-gray-500">Output will appear here</span>
                )}
              </pre>
            </div>

            {/* Recent Files Section */}
            <div className="mb-8">
              <h3 className="flex items-center mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FiArchive className="w-4 h-4 mr-2" /> Recent Files
              </h3>
              <div className="grid gap-2">
                {recentFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCode(file.code);
                      setInput(file.input);
                      setFileName(file.fileName);
                      setLanguage(file.language);
                    }}
                    className="flex items-center justify-between p-3 text-sm transition-all border rounded-lg hover:bg-blue-50/50 dark:hover:bg-gray-800 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {file.fileName}.{langConfig[file.language].extension}
                      </span>
                      <span className="px-2 py-1 ml-2 text-xs bg-gray-100 rounded-full dark:bg-gray-700">
                        {langConfig[file.language].name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(file.timestamp).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Run Button */}
      <div className="fixed bottom-8 right-8 z-[60]">
        <button
          onClick={handleRunCode}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 text-sm font-medium text-white transition-all transform rounded-full shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 hover:shadow-2xl hover:scale-105 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <FiPlay className="w-5 h-5 text-white/90" />
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`relative rounded-xl shadow-2xl ${
            isDarkMode 
              ? 'bg-gray-800 text-gray-100'
              : 'bg-white text-gray-900'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="p-2 rounded-lg hover:bg-gray-700/10 dark:hover:bg-gray-100/10"
                >
                  <FiXCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="grid gap-3">
                {[
                  { label: 'Run Code', shortcut: 'Ctrl+Enter', icon: <FiPlay /> },
                  { label: 'Save Code', shortcut: 'Ctrl+S', icon: <FiSave /> },
                  { label: 'New File', shortcut: 'Ctrl+N', icon: <FiSave /> },
                  { label: 'Save As', shortcut: 'Shift+Ctrl+S', icon: <FiSave /> },
                  { label: 'Show Help', shortcut: 'Ctrl+?', icon: <FiHelpCircle /> }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100/50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <kbd className="px-2.5 py-1 text-sm rounded-md bg-gray-200/70 dark:bg-gray-600">
                      {item.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </Layout>
  );
};

export default CodeCompiler;