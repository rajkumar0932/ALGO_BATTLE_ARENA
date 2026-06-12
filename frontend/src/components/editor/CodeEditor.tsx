
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, language = "javascript", readOnly = false }: CodeEditorProps) {
  const monaco = useMonaco();
  const editorRef = useRef(null);

  useEffect(() => {
    if (monaco) {
      // Define a custom theme that matches AlgoBattle's dark aesthetic
      monaco.editor.defineTheme("algobattle-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6B7280", fontStyle: "italic" },
          { token: "keyword", foreground: "A855F7", fontStyle: "bold" },
          { token: "string", foreground: "10B981" },
          { token: "number", foreground: "F59E0B" },
          { token: "function", foreground: "00E5FF" },
        ],
        colors: {
          "editor.background": "#0a0e1a", // bg-primary
          "editor.foreground": "#f3f4f6", // gray-100
          "editor.lineHighlightBackground": "#1a1f35", // bg-card
          "editorLineNumber.foreground": "#4b5563", // gray-600
          "editorLineNumber.activeForeground": "#00e5ff", // accent-cyan
          "editorIndentGuide.background": "#1f2937", // gray-800
          "editorSuggestWidget.background": "#111827", // bg-secondary
          "editorSuggestWidget.border": "#2a2f45", // border
          "editorSuggestWidget.foreground": "#d1d5db", // gray-300
          "editorSuggestWidget.selectedBackground": "#1a1f35", // bg-card
          "editorSuggestWidget.highlightForeground": "#00e5ff", // accent-cyan
        },
      });
      monaco.editor.setTheme("algobattle-dark");
    }
  }, [monaco]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="w-full h-full min-h-[400px] border border-border rounded-xl overflow-hidden focus-within:border-accent-cyan/50 focus-within:ring-1 focus-within:ring-accent-cyan/25 transition-all duration-300">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme="algobattle-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "JetBrains Mono, Fira Code, monospace",
          lineHeight: 24,
          padding: { top: 20, bottom: 20 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
          readOnly,
          wordWrap: "on",
          renderLineHighlight: "all",
          matchBrackets: "always",
          guides: { bracketPairs: true, indentation: true },
        }}
        onMount={handleEditorDidMount}
        loading={
          <div className="w-full h-full flex items-center justify-center bg-bg-primary text-gray-500">
            <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin mr-3" />
            Loading editor...
          </div>
        }
      />
    </div>
  );
}
