import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
import {
  Menu,
  Play,
  Save,
  Folder,
  FolderOpen,
  FileCode,
  Plus,
  Terminal,
  X,
  ChevronRight,
  ChevronDown,
  Trash2
} from 'lucide-react-native';

// --- THEME CONFIGURATION ---
const THEME = {
  bg: '#0a0a0c',
  sidebar: '#111113',
  editor: '#0d1117',
  accent: '#8B5CF6', // Violet
  text: '#e5e7eb',
  textDim: '#6b7280',
  border: '#1f2937',
  success: '#34d399',
  error: '#f87171',
  keyword: '#c084fc',
  string: '#4ade80',
  comment: '#6b7280',
  function: '#60a5fa'
};

// --- SYNTAX HIGHLIGHTER (Native Text Component Implementation) ---
const HighlightedText = ({ code, language }) => {
  if (!code) return <Text style={styles.codeText}></Text>;

  const tokens = [];
  let remaining = code;
  let key = 0;

  // Regex for Python/JS (Simplified for performance)
  const patterns = {
    string: /("|')((?:\\\1|(?:(?!\1).))*)\1/,
    comment: /(#|\/\/).*/,
    keyword: /\b(def|print|if|else|elif|while|for|in|return|import|from|class|try|except|as|pass|break|continue|const|let|var|function|export|default)\b/,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/
  };

  while (remaining.length > 0) {
    let bestMatch = null;
    let bestType = 'text';
    let minIndex = remaining.length;

    // Find the first occurring match
    for (const [type, regex] of Object.entries(patterns)) {
      const match = remaining.match(regex);
      if (match && match.index < minIndex) {
        bestMatch = match;
        bestType = type;
        minIndex = match.index;
      }
    }

    if (bestMatch && minIndex === 0) {
      // We found a token at the start
      const value = bestMatch[0];
      let style = styles.codeText;
      if (bestType === 'string') style = { ...style, color: THEME.string };
      if (bestType === 'comment') style = { ...style, color: THEME.comment, fontStyle: 'italic' };
      if (bestType === 'keyword') style = { ...style, color: THEME.keyword, fontWeight: 'bold' };
      if (bestType === 'function') style = { ...style, color: THEME.function };

      tokens.push(<Text key={key++} style={style}>{value}</Text>);
      remaining = remaining.slice(value.length);
    } else if (minIndex > 0) {
      // Add text before the match
      tokens.push(<Text key={key++} style={styles.codeText}>{remaining.slice(0, minIndex)}</Text>);
      remaining = remaining.slice(minIndex);
    } else {
      // No matches left
      tokens.push(<Text key={key++} style={styles.codeText}>{remaining}</Text>);
      remaining = '';
    }
  }

  return <Text>{tokens}</Text>;
};

const Sidebar = ({ sidebarOpen, projectName, handleOpenFolder, setModalType, setModalVisible, files, activeFile, openFile }) => (
  <View style={[styles.sidebar, { width: sidebarOpen ? 250 : 0 }]}>
    {/* Header */}
    <View style={styles.sidebarHeader}>
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: 'https://i.imgur.com/wu9msjU.png' }}
          style={styles.appIcon}
          resizeMode="contain"
        />
      </View>
      {sidebarOpen && (
        <View>
          <Text style={styles.brandTitle}>YaP Code</Text>
          <Text style={styles.brandSubtitle}>v1.0.0-release</Text>
        </View>
      )}
    </View>

    {/* Project Controls */}
    <View style={styles.projectControls}>
      <Text style={styles.sectionTitle} numberOfLines={1}>PROJ: {projectName}</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={handleOpenFolder} style={styles.iconBtn}>
          <FolderOpen size={18} color={THEME.textDim} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setModalType('newFile'); setModalVisible(true); }} style={styles.iconBtn}>
          <Plus size={18} color={THEME.textDim} />
        </TouchableOpacity>
      </View>
    </View>

    {/* File List */}
    <ScrollView style={{ flex: 1 }}>
      {files.map((file, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.fileItem, activeFile?.uri === file.uri && styles.activeFileItem]}
          onPress={() => openFile(file)}
        >
          <FileCode size={16} color={activeFile?.uri === file.uri ? THEME.accent : THEME.textDim} />
          <Text style={[styles.fileName, activeFile?.uri === file.uri && { color: 'white' }]}>
            {file.name}
          </Text>
        </TouchableOpacity>
      ))}
      {files.length === 0 && <Text style={{ color: '#444', padding: 20 }}>No files found.</Text>}
    </ScrollView>

    {/* Footer */}
    <View style={styles.sidebarFooter}>
      <Text style={{ color: '#444', fontSize: 10 }}>YaPLabs Inc. Mobile IDE</Text>
    </View>
  </View>
);

const Editor = ({ sidebarOpen, setSidebarOpen, activeFile, saveFile, runCode, editorContent, setEditorContent }) => (
  <View style={styles.editorContainer}>
    {/* Editor Top Bar */}
    <View style={styles.editorHeader}>
      <TouchableOpacity onPress={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 8 }}>
        <Menu size={20} color={THEME.textDim} />
      </TouchableOpacity>
      <Text style={styles.activeFileName}>{activeFile ? activeFile.name : 'No File Open'}</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={saveFile} style={{ padding: 8 }}>
          <Save size={20} color={THEME.success} />
        </TouchableOpacity>
        <TouchableOpacity onPress={runCode} style={styles.runBtn}>
          <Play size={14} color="white" fill="white" />
          <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 4 }}>RUN</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* The Code Area */}
    {activeFile ? (
      <ScrollView style={{ flex: 1 }} keyboardDismissMode="none">
        <View style={{ minHeight: '100%' }}>
          {/* Input Layer (behind) */}
          <TextInput
            style={[styles.codeLayer, styles.codeFont, styles.inputLayer, { zIndex: 1, color: THEME.editor }]}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            value={editorContent}
            onChangeText={setEditorContent}
            textAlignVertical="top"
            keyboardAppearance="dark"
            cursorColor={THEME.accent}
            selectionColor={THEME.accent}
          />

          {/* Overlay for Syntax Highlighting (on top, pointer events disabled) */}
          <View style={[styles.codeLayer, { zIndex: 2 }]} pointerEvents="none">
            <HighlightedText code={editorContent} language={activeFile.language} />
          </View>
        </View>
      </ScrollView>
    ) : (
      <View style={styles.emptyState}>
        <Image source={{ uri: 'https://i.imgur.com/wu9msjU.png' }} style={{ width: 60, height: 60, opacity: 0.5, marginBottom: 20 }} />
        <Text style={{ color: THEME.textDim }}>Open a file from the sidebar</Text>
      </View>
    )}

    {/* Mobile Keyboard Extension */}
    {activeFile && (
      <View style={styles.keyboardRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {['{', '}', '(', ')', '[', ']', '=', ':', ';', '"', "'", '<', '>', '!', 'tab'].map(char => (
            <TouchableOpacity
              key={char}
              style={styles.keyBtn}
              onPress={() => setEditorContent(prev => prev + (char === 'tab' ? '    ' : char))}
            >
              <Text style={styles.keyText}>{char}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )}
  </View>
);

export default function App() {
  // --- STATE ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectUri, setProjectUri] = useState(FileSystem.documentDirectory); // Default to app sandbox
  const [projectName, setProjectName] = useState('Sandbox');
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null); // { name, uri, content, language }
  const [editorContent, setEditorContent] = useState(""); // The text currently being edited
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([{ type: 'info', text: 'YaP Code Ready.' }]);

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('newFile'); // 'newFile' or 'openFolder'
  const [modalInput, setModalInput] = useState('');

  // --- INITIALIZATION ---
  useEffect(() => {
    async function prepare() {
      try {
        await loadFiles(projectUri);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // --- FILE SYSTEM OPERATIONS ---

  // 1. List Files
  const loadFiles = async (uri) => {
    try {
      const result = await FileSystem.readDirectoryAsync(uri);
      const fileList = result.map(name => ({
        name,
        uri: uri + name,
        type: name.includes('.') ? 'file' : 'folder' // Simple heuristic
      })).filter(f => f.type === 'file'); // Filter folders for simplicity in this version
      setFiles(fileList);
    } catch (e) {
      logToTerminal('error', `Error loading files: ${e.message}`);
    }
  };

  // 2. Read File
  const openFile = async (file) => {
    try {
      const content = await FileSystem.readAsStringAsync(file.uri);
      const ext = file.name.split('.').pop();
      setEditorContent(content);
      setActiveFile({ ...file, content, language: ext });
      setSidebarOpen(false); // Auto close sidebar on mobile for space
    } catch (e) {
      logToTerminal('error', `Failed to open ${file.name}`);
    }
  };

  // 3. Save File
  const saveFile = async () => {
    if (!activeFile) return;
    try {
      await FileSystem.writeAsStringAsync(activeFile.uri, editorContent);
      logToTerminal('success', `Saved ${activeFile.name}`);
    } catch (e) {
      logToTerminal('error', `Save failed: ${e.message}`);
    }
  };

  // 4. Create File
  const handleCreateFile = async () => {
    if (!modalInput) return;
    const fileName = modalInput;

    // Default templates
    let content = "";
    if (fileName.endsWith('.py')) content = "# New Python Script\nprint('Hello YaP')";
    if (fileName.endsWith('.js')) content = "// New JS File\nconsole.log('Hello YaP');";

    try {
      let newFileUri = "";

      if (projectUri.startsWith('content://')) {
        // SAF Mode
        // We need to determine MIME type, simple heuristic
        let mimeType = 'text/plain';
        if (fileName.endsWith('.js')) mimeType = 'application/javascript';
        if (fileName.endsWith('.py')) mimeType = 'text/x-python';
        if (fileName.endsWith('.html')) mimeType = 'text/html';
        if (fileName.endsWith('.json')) mimeType = 'application/json';

        newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(projectUri, fileName, mimeType);
        // Write content to the new file
        await FileSystem.writeAsStringAsync(newFileUri, content);
      } else {
        // Standard File System Mode
        // Ensure slash
        const prefix = projectUri.endsWith('/') ? projectUri : projectUri + '/';
        newFileUri = prefix + fileName;
        await FileSystem.writeAsStringAsync(newFileUri, content);
      }

      await loadFiles(projectUri);

      // For SAF, the name in the list might be different if it was renamed (e.g. (1)), 
      // but for simplicity we try to open what we just created.
      // We need to find the file object from the reloaded list to get the correct name/uri pairing if possible,
      // or just construct a temporary one.
      openFile({ name: fileName, uri: newFileUri });

      setModalVisible(false);
      setModalInput('');
      logToTerminal('success', `Created ${fileName}`);
    } catch (e) {
      logToTerminal('error', `Create failed: ${e.message}`);
      Alert.alert("Error", `Could not create file: ${e.message}`);
    }
  };

  // 5. Open Project Folder (SAF)
  const handleOpenFolder = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert("Not Supported", "SAF is Android only. Using sandbox.");
      return;
    }
    try {
      // Request permission to access a folder
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const uri = permissions.directoryUri;
        setProjectUri(uri);
        // SAF URIs are encoded, let's just show a friendly name
        setProjectName("External Storage");

        // Load files from SAF
        const fileNames = await FileSystem.StorageAccessFramework.readDirectoryAsync(uri);
        // SAF returns full URIs, we need to parse them
        const fileList = fileNames.map(fileUri => ({
          name: decodeURIComponent(fileUri.split('%2F').pop()), // Decode filename
          uri: fileUri,
          type: 'file'
        }));
        setFiles(fileList);
        setActiveFile(null);
        setEditorContent("");
        logToTerminal('info', `Mounted: ${uri}`);
      }
    } catch (e) {
      setTerminalOpen(true);
      logToTerminal('error', `Access denied: ${e.message}`);
    }
  };

  // --- TERMINAL LOGIC ---
  const logToTerminal = (type, text) => {
    setTerminalLogs(prev => [...prev, { type, text }]);
  };

  const runCode = () => {
    setTerminalOpen(true);
    logToTerminal('info', `> Executing ${activeFile?.name}...`);

    if (!activeFile) return;

    if (activeFile.name.endsWith('.js')) {
      try {
        // Safe-ish eval for JS
        const originalLog = console.log;
        const logs = [];
        console.log = (...args) => logs.push(args.join(' '));

        // Execute
        // Note: 'eval' in React Native executes in the JS Bridge.
        // It has access to standard JS objects but not full Node APIs.
        eval(editorContent);

        console.log = originalLog;
        if (logs.length > 0) {
          logs.forEach(l => logToTerminal('success', l));
        } else {
          logToTerminal('info', 'Script executed (No Output)');
        }
      } catch (e) {
        logToTerminal('error', e.toString());
      }
    } else if (activeFile.name.endsWith('.py')) {
      // Real Python requires a native backend (Chaquopy). 
      // For this "One File" APK, we simulate the output or warn user.
      logToTerminal('info', 'NOTE: Python runtime requires native build modules.');
      // Simple mock parser for print statements just to show "working" logic
      const lines = editorContent.split('\n');
      lines.forEach(line => {
        const match = line.match(/print\(['"](.+)['"]\)/);
        if (match) logToTerminal('success', match[1]);
      });
    } else {
      logToTerminal('error', `No runner for ${activeFile.language}`);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Sidebar
            sidebarOpen={sidebarOpen}
            projectName={projectName}
            handleOpenFolder={handleOpenFolder}
            setModalType={setModalType}
            setModalVisible={setModalVisible}
            files={files}
            activeFile={activeFile}
            openFile={openFile}
          />
          <Editor
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            activeFile={activeFile}
            saveFile={saveFile}
            runCode={runCode}
            editorContent={editorContent}
            setEditorContent={setEditorContent}
          />
        </View>

        {/* Terminal Panel */}
        {terminalOpen && (
          <View style={styles.terminal}>
            <View style={styles.terminalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Terminal size={14} color={THEME.textDim} />
                <Text style={{ color: THEME.textDim, marginLeft: 8, fontSize: 12 }}>TERMINAL</Text>
              </View>
              <TouchableOpacity onPress={() => setTerminalOpen(false)}>
                <ChevronDown size={16} color={THEME.textDim} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.terminalBody}>
              {terminalLogs.map((log, i) => (
                <Text key={i} style={[
                  styles.logText,
                  log.type === 'error' && { color: THEME.error },
                  log.type === 'success' && { color: THEME.success },
                ]}>
                  {log.text}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

        {/* New File Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {modalType === 'newFile' ? 'New File' : 'Open Project'}
              </Text>
              {modalType === 'newFile' && (
                <TextInput
                  style={styles.modalInput}
                  placeholder="filename.py"
                  placeholderTextColor="#666"
                  value={modalInput}
                  onChangeText={setModalInput}
                  autoFocus
                />
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnCancel}>
                  <Text style={{ color: '#999' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateFile} style={styles.modalBtnConfirm}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  // Sidebar
  sidebar: {
    backgroundColor: THEME.sidebar,
    borderRightWidth: 1,
    borderRightColor: THEME.border,
    height: '100%',
    overflow: 'hidden'
  },
  sidebarHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'black',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)', // Purple glow
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5
  },
  appIcon: {
    width: 30,
    height: 30,
  },
  brandTitle: {
    color: THEME.accent,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1
  },
  brandSubtitle: {
    color: '#666',
    fontSize: 10
  },
  projectControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#161618'
  },
  sectionTitle: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'bold',
    width: 120
  },
  iconBtn: {
    padding: 4,
    marginLeft: 8
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent'
  },
  activeFileItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderLeftColor: THEME.accent
  },
  fileName: {
    color: '#999',
    fontSize: 13,
    marginLeft: 10
  },
  sidebarFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    alignItems: 'center'
  },

  // Editor
  editorContainer: {
    flex: 1,
    backgroundColor: THEME.editor,
  },
  editorHeader: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: THEME.sidebar
  },
  activeFileName: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '500'
  },
  runBtn: {
    backgroundColor: THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Syntax Highlight Logic
  codeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingTop: 16, // Match multiline padding
    minHeight: '100%'
  },
  inputLayer: {
    color: 'transparent', // Text is transparent, caret is visible
  },
  codeFont: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    lineHeight: 20,
    color: THEME.text
  },

  // Keyboard Row
  keyboardRow: {
    height: 44,
    backgroundColor: '#1f2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center'
  },
  keyBtn: {
    backgroundColor: '#374151',
    borderRadius: 6,
    minWidth: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    paddingHorizontal: 8
  },
  keyText: {
    color: 'white',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Terminal
  terminal: {
    height: 250,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  terminalHeader: {
    padding: 8,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  terminalBody: {
    flex: 1,
    padding: 10
  },
  logText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    marginBottom: 4,
    color: '#ccc'
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: 300,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151'
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  modalInput: {
    backgroundColor: '#111',
    color: 'white',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtnCancel: {
    padding: 10,
    marginRight: 10
  },
  modalBtnConfirm: {
    backgroundColor: THEME.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4
  }
});