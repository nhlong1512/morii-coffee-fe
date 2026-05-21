"use client";

import * as React from "react";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Bold, Heading2, Italic, List, ListOrdered, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { safeParseJson } from "../utils";

interface BlogEditorProps {
  value: {
    contentHtml: string;
    contentJson: string;
  };
  onChange: (value: { contentHtml: string; contentJson: string }) => void;
  disabled?: boolean;
  error?: string;
}

export function BlogEditor({
  value,
  onChange,
  disabled = false,
  error,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    editable: !disabled,
    content: safeParseJson(value.contentJson) ?? value.contentHtml ?? "",
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] rounded-b-md border border-t-0 border-input bg-background px-4 py-3 text-sm focus:outline-none prose prose-sm dark:prose-invert max-w-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange({
        contentHtml: currentEditor.getHTML(),
        contentJson: JSON.stringify(currentEditor.getJSON()),
      });
    },
  });

  React.useEffect(() => {
    if (!editor) return;

    const nextContent = safeParseJson(value.contentJson) ?? value.contentHtml ?? "";
    const currentJson = JSON.stringify(editor.getJSON());

    if (value.contentJson && currentJson !== value.contentJson) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
      return;
    }

    if (!value.contentJson && value.contentHtml && editor.getHTML() !== value.contentHtml) {
      editor.commands.setContent(value.contentHtml, { emitUpdate: false });
    }
  }, [editor, value.contentHtml, value.contentJson]);

  const toolbarButton = (
    label: React.ReactNode,
    isActive: boolean,
    onClick: () => void
  ) => (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled || !editor}
    >
      {label}
    </Button>
  );

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-wrap gap-2 rounded-t-md border border-input border-b-0 bg-muted/40 px-3 py-2",
          disabled && "opacity-70"
        )}
      >
        {toolbarButton(
          <Bold className="h-4 w-4" />,
          Boolean(editor?.isActive("bold")),
          () => editor?.chain().focus().toggleBold().run()
        )}
        {toolbarButton(
          <Italic className="h-4 w-4" />,
          Boolean(editor?.isActive("italic")),
          () => editor?.chain().focus().toggleItalic().run()
        )}
        {toolbarButton(
          <Heading2 className="h-4 w-4" />,
          Boolean(editor?.isActive("heading", { level: 2 })),
          () => editor?.chain().focus().toggleHeading({ level: 2 }).run()
        )}
        {toolbarButton(
          <List className="h-4 w-4" />,
          Boolean(editor?.isActive("bulletList")),
          () => editor?.chain().focus().toggleBulletList().run()
        )}
        {toolbarButton(
          <ListOrdered className="h-4 w-4" />,
          Boolean(editor?.isActive("orderedList")),
          () => editor?.chain().focus().toggleOrderedList().run()
        )}
        {toolbarButton(
          <Quote className="h-4 w-4" />,
          Boolean(editor?.isActive("blockquote")),
          () => editor?.chain().focus().toggleBlockquote().run()
        )}
      </div>

      <EditorContent editor={editor} />

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
