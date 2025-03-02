import React, { forwardRef, useImperativeHandle } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { EDITOR_OPTIONS } from './config';
import { handleImageUpload } from './imageHandler';
import { setupMathType } from './mathTypeSetup';
import type { RichTextEditorProps, RichTextEditorRef } from './types';

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value = '',
  onChange,
  placeholder,
  className
}, ref) => {
  const editorRef = React.useRef<any>(null);

  React.useEffect(() => {
    setupMathType();
  }, []);

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.getContent() || '',
    setContent: (content: string) => editorRef.current?.setContent(content),
    editor: editorRef.current
  }));

  const editorOptions = {
    ...EDITOR_OPTIONS,
    placeholder,
    file_picker_callback: handleImageUpload,
    content_css: false, // Use our own content styles
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        padding: 1rem;
      }
      .tox-statusbar__resize-handle {
        cursor: row-resize !important;
      }
    `,
    readonly: false, // Fix for "All created TinyMCE editors are configured to be read-only" error
    setup: (editor: any) => {
      editor.on('init', () => {
        if (placeholder) {
          const placeholderText = editor.dom.create(
            'span',
            { class: 'tox-placeholder' },
            placeholder
          );
          if (!editor.getContent()) {
            editor.getBody().appendChild(placeholderText);
          }
        }
      });
    }
  };

  return (
    <div className={className}>
      <Editor
        onInit={(evt, editor) => {
          editorRef.current = editor;
          // Initialize with content if provided
          if (value) {
            editor.setContent(value);
          }
        }}
        value={value}
        init={editorOptions}
        onEditorChange={(content) => {
          onChange?.(content);
        }}
      />
      <style jsx>{`
        :global(.tox-statusbar) {
          display: flex !important;
          border-top: 1px solid #e0e0e0 !important;
        }
        :global(.tox-statusbar__resize-handle) {
          display: block !important;
          cursor: row-resize !important;
        }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;