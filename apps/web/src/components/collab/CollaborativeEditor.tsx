"use client";

import { useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { editor as MonacoEditor } from "monaco-editor";
import type { CollabCursor } from "@placepro/shared";
import { COLLAB_LANGUAGES } from "@placepro/shared";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CollaborativeEditorProps {
  language: string;
  value: string;
  cursors: CollabCursor[];
  selfSocketId: string | null;
  onChange: (code: string) => void;
  onCursorMove: (line: number, column: number) => void;
  readOnly?: boolean;
}

export function CollaborativeEditor({
  language,
  value,
  cursors,
  selfSocketId,
  onChange,
  onCursorMove,
  readOnly,
}: CollaborativeEditorProps) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);
  const lastEmittedRef = useRef(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monacoLang =
    COLLAB_LANGUAGES.find((l) => l.id === language)?.monaco ?? language;

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    const ed = editorRef.current;
    if (!ed) return;
    const pos = ed.getPosition();
    const model = ed.getModel();
    if (model && model.getValue() !== value) {
      ed.setValue(value);
      if (pos) ed.setPosition(pos);
    }
    lastEmittedRef.current = value;
  }, [value]);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const remote = cursors.filter((c) => c.socketId !== selfSocketId);
    const decorations: MonacoEditor.IModelDeltaDecoration[] = remote.flatMap((c) => [
      {
        range: {
          startLineNumber: c.lineNumber,
          startColumn: 1,
          endLineNumber: c.lineNumber,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "collab-remote-line",
          inlineClassName: "collab-remote-inline",
          glyphMarginClassName: "collab-remote-glyph",
          overviewRuler: {
            color: c.color,
            position: 4,
          },
        },
      },
      {
        range: {
          startLineNumber: c.lineNumber,
          startColumn: c.column,
          endLineNumber: c.lineNumber,
          endColumn: c.column,
        },
        options: {
          after: {
            content: ` ${c.name}`,
            inlineClassName: "collab-cursor-label",
            attachedData: c.color,
          },
        },
      },
    ]);

    decorationIdsRef.current = ed.deltaDecorations(decorationIdsRef.current, decorations);
  }, [cursors, selfSocketId]);

  const handleMount = useCallback(
    (ed: MonacoEditor.IStandaloneCodeEditor) => {
      editorRef.current = ed;
      ed.onDidChangeCursorPosition((e) => {
        onCursorMove(e.position.lineNumber, e.position.column);
      });
    },
    [onCursorMove]
  );

  const handleChange = useCallback(
    (v: string | undefined) => {
      if (v === undefined) return;
      lastEmittedRef.current = v;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(v), 120);
    },
    [onChange]
  );

  return (
    <div className="collab-editor-wrap h-full min-h-[420px] rounded-lg border border-border overflow-hidden">
      <style jsx global>{`
        .collab-remote-line {
          background: rgba(59, 130, 246, 0.08);
        }
        .collab-cursor-label {
          color: inherit;
          font-size: 11px;
          padding: 0 4px;
          border-radius: 2px;
          margin-left: 2px;
        }
      `}</style>
      <Monaco
        height="100%"
        language={monacoLang}
        theme="vs-dark"
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
