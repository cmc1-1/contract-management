"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Minus,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorOutput {
  json: object;
  html: string;
}

interface Props {
  initialContent?: object | null;
  onChange?: (output: EditorOutput) => void;
  readOnly?: boolean;
  onInsertClause?: () => void;
  onAiAssistant?: () => void;
}

export function ContractEditor({
  initialContent,
  onChange,
  readOnly = false,
  onInsertClause,
  onAiAssistant,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Start writing your contract…",
      }),
    ],
    content: initialContent || "",
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.({
        json: editor.getJSON(),
        html: editor.getHTML(),
      });
    },
  });

  // Update content when initialContent changes
  useEffect(() => {
    if (editor && initialContent && !editor.isFocused) {
      editor.commands.setContent(initialContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insertContent = useCallback(
    (content: object) => {
      if (editor) {
        editor.commands.insertContent(content);
      }
    },
    [editor]
  );

  // Expose insertContent so parent can use it via ref
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__editorInsert = insertContent;
    }
  }, [insertContent]);

  if (!editor) return null;

  if (readOnly) {
    return (
      <div className="prose prose-sm max-w-none">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-100 bg-gray-50/50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
        {onInsertClause && (
          <>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onInsertClause}
              className="h-7 text-xs gap-1"
            >
              <BookMarked className="h-3.5 w-3.5" />
              Insert Clause
            </Button>
          </>
        )}
        {onAiAssistant && (
          <>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAiAssistant}
              className="h-7 text-xs gap-1 text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Assistant
            </Button>
          </>
        )}
      </div>

      {/* Editor */}
      <div className="p-4 min-h-[400px]">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  isActive,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 rounded text-sm transition-colors",
        isActive
          ? "bg-gray-200 text-gray-900"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        disabled && "opacity-30 pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}
