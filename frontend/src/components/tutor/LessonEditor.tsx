"use client";

import { defaultBlockSpecs, type PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface LessonEditorProps {
  content: string;
  onChange: (content: string) => void;
}

function isBlockNoteBlock(value: unknown): value is PartialBlock {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof value.type === "string" &&
    Object.prototype.hasOwnProperty.call(defaultBlockSpecs, value.type)
  );
}

function getInitialContent(content: string): PartialBlock[] | undefined {
  if (!content) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.every(isBlockNoteBlock)) {
      return parsed;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }

  return content.split(/\r\n|\r|\n/).map((text) => ({
    type: "paragraph",
    content: text,
  }));
}

export default function LessonEditor({ content, onChange }: LessonEditorProps) {
  const [initialContent] = useState(() => getInitialContent(content));
  const editor = useCreateBlockNote({
    initialContent,
    domAttributes: {
      editor: { "aria-label": "Lesson content" },
    },
  });

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      onChange={(changedEditor) =>
        onChange(JSON.stringify(changedEditor.document))
      }
    />
  );
}
