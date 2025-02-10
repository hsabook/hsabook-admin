import type { Editor as TinyMCEEditor } from 'tinymce';

declare global {
  interface Window {
    tinymce: any;
    $: any;
  }
}

export interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export interface RichTextEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  editor: TinyMCEEditor | null;
}