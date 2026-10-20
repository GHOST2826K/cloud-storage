import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Code,
  Quote,
  Table as TableIcon,
  Paperclip,
  Eye,
  Edit3,
  Columns,
  History,
  Lock,
  Unlock,
  Download,
  Trash2,
  File,
  Image as ImageIcon,
  Check,
  Tag as TagIcon,
  Folder,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { marked } from 'marked';
import { Note, Category, NoteAttachment } from '../types';
import { formatBytes, getUtf8ByteSize } from '../utils/storage';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (updatedNote: Note) => void;
  categories: Category[];
  isVaultUnlocked: boolean;
  onUnlockVaultRequest: () => void;
  onOpenVersionHistory: () => void;
  onDeleteNote: (id: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdateNote,
  categories,
  isVaultUnlocked,
  onUnlockVaultRequest,
  onOpenVersionHistory,
  onDeleteNote,
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configure marked for GitHub flavored markdown
  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }, []);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center select-none">
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
          <Edit3 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">No Note Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Select an existing note from the list, or create a new one to store your thoughts securely in the cloud.
        </p>
      </div>
    );
  }

  // If note is locked and vault is locked, show high-security locked state
  if (note.isLocked && !isVaultUnlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1.5">Note Encrypted & Locked</h3>
        <p className="text-xs text-slate-600 max-w-md mb-6 leading-relaxed">
          This note is encrypted with zero-knowledge <strong>AES-256-GCM</strong>.
          Its plaintext contents and attachments are sealed until you unlock your Master Vault.
        </p>
        <button
          onClick={onUnlockVaultRequest}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <Unlock className="w-4 h-4 text-emerald-400" />
          <span>Unlock Master Vault</span>
        </button>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNote({
      ...note,
      title: e.target.value,
      updatedAt: Date.now(),
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNote({
      ...note,
      content: e.target.value,
      updatedAt: Date.now(),
    });
  };

  const handleCategoryChange = (catId: string) => {
    onUpdateNote({
      ...note,
      category: catId,
      updatedAt: Date.now(),
    });
  };

  const handleToggleLock = () => {
    onUpdateNote({
      ...note,
      isLocked: !note.isLocked,
      updatedAt: Date.now(),
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const cleanTag = newTagInput.trim().toLowerCase().replace(/^#/, '');
      if (!note.tags.includes(cleanTag)) {
        onUpdateNote({
          ...note,
          tags: [...note.tags, cleanTag],
          updatedAt: Date.now(),
        });
      }
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNote({
      ...note,
      tags: note.tags.filter((t) => t !== tagToRemove),
      updatedAt: Date.now(),
    });
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = prefix + (selected || 'text') + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    onUpdateNote({
      ...note,
      content: newContent,
      updatedAt: Date.now(),
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  // Attachments Handling
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAttachment: NoteAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl: reader.result as string,
          uploadedAt: Date.now(),
        };

        onUpdateNote({
          ...note,
          attachments: [...note.attachments, newAttachment],
          updatedAt: Date.now(),
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (attId: string) => {
    onUpdateNote({
      ...note,
      attachments: note.attachments.filter((a) => a.id !== attId),
      updatedAt: Date.now(),
    });
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Metrics
  const charCount = note.content.length;
  const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
  const textBytes = getUtf8ByteSize(note.title) + getUtf8ByteSize(note.content);
  const attachmentsBytes = note.attachments.reduce((sum, a) => sum + a.size, 0);
  const totalNoteBytes = textBytes + attachmentsBytes;

  const colorOptions = [
    { name: 'Default', hex: '#64748B' },
    { name: 'Sky', hex: '#0284C7' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Amber', hex: '#D97706' },
    { name: 'Rose', hex: '#E11D48' },
    { name: 'Purple', hex: '#7C3AED' },
  ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col h-[calc(100vh-57px)] bg-white relative transition-colors ${
        isDraggingOver ? 'bg-sky-50/50 ring-2 ring-sky-400 ring-inset' : ''
      }`}
    >
      {/* Top Metadata Header */}
      <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-4">
        {/* Left: Category Picker & Tags */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Folder className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={note.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-transparent border-none cursor-pointer focus:outline-none hover:text-slate-900"
            >
              {categories
                .filter((c) => c.id !== 'all')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <span className="text-slate-300">|</span>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <TagIcon className="w-3 h-3 text-slate-400" />
            {note.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
              >
                <span>#{t}</span>
                <button
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-600 text-slate-400 transition-colors"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}

            {isAddingTag ? (
              <input
                type="text"
                autoFocus
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                onBlur={() => {
                  if (!newTagInput.trim()) setIsAddingTag(false);
                }}
                placeholder="tag name..."
                className="w-20 px-1.5 py-0.5 text-[11px] border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
              >
                + add tag
              </button>
            )}
          </div>
        </div>

        {/* Right: Controls & Lock state */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Note Color Accent Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Accent color"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            {showColorPicker && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 flex gap-1.5">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      onUpdateNote({ ...note, color: c.hex });
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Encryption / Lock Note Toggle */}
          <button
            onClick={handleToggleLock}
            title={
              note.isLocked
                ? 'Note is encrypted with AES-256-GCM. Click to remove encryption.'
                : 'Encrypt and lock this note with Master Vault Passphrase'
            }
            className={`px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              note.isLocked
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {note.isLocked ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypt Note</span>
              </>
            )}
          </button>

          {/* Version History Button */}
          <button
            onClick={onOpenVersionHistory}
            title="View revision history & restores"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors flex items-center gap-1 text-xs"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] tabular-nums">
              {note.revisions.length}
            </span>
          </button>

          {/* Delete to Trash */}
          <button
            onClick={() => onDeleteNote(note.id)}
            title="Move to trash"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-6 pt-4 pb-2">
        <input
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="w-full text-xl font-bold tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-none border-none bg-transparent"
        />
      </div>

      {/* Formatting & View Mode Toolbar */}
      <div className="px-6 py-2 border-y border-slate-100 flex items-center justify-between gap-4 bg-slate-50/60 select-none">
        {/* Markdown Toolbar Actions */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          <button
            onClick={() => insertMarkdown('**', '**')}
            title="Bold (**text**)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            title="Italic (*text*)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-200 mx-1" />
          <button
            onClick={() => insertMarkdown('# ')}
            title="Heading 1 (# Heading)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('## ')}
            title="Heading 2 (## Heading)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-200 mx-1" />
          <button
            onClick={() => insertMarkdown('- ')}
            title="Bullet list (- Item)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('- [ ] ')}
            title="Checklist (- [ ] Task)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('> ')}
            title="Quote block (> Quote)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('```\n', '\n```')}
            title="Code block (```code```)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() =>
              insertMarkdown(
                '\n| Column 1 | Column 2 |\n| :--- | :--- |\n| Item 1 | Item 2 |\n'
              )
            }
            title="Insert table"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-200 mx-1" />
          {/* File Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach file, image, or PDF (up to 500MB on 100GB plan)"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded transition-colors flex items-center gap-1 text-xs"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Attach</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            multiple
            className="hidden"
          />
        </div>

        {/* View Mode Toggle (Segmented control) */}
        <div className="flex items-center gap-0.5 p-0.5 bg-slate-200/70 rounded-md shrink-0">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'edit'
                ? 'bg-white text-slate-900 shadow-xs font-medium'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span className="hidden sm:inline">Write</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'split'
                ? 'bg-white text-slate-900 shadow-xs font-medium'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              viewMode === 'preview'
                ? 'bg-white text-slate-900 shadow-xs font-medium'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Write Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`h-full flex flex-col p-6 overflow-y-auto ${
              viewMode === 'split' ? 'w-1/2 border-r border-slate-200' : 'w-full'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={handleContentChange}
              placeholder="Write your personal note in Markdown... You can drag & drop images or files directly here."
              className="w-full h-full resize-none border-none focus:outline-none text-sm text-slate-800 leading-relaxed font-sans placeholder:text-slate-300"
            />
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`h-full p-6 overflow-y-auto bg-slate-50/40 ${
              viewMode === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{
                __html: marked.parse(note.content || '*Empty note...*') as string,
              }}
            />
          </div>
        )}
      </div>

      {/* Attachments Section if any exist */}
      {note.attachments.length > 0 && (
        <div className="px-6 py-2.5 border-t border-slate-200 bg-slate-50/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Paperclip className="w-3 h-3 text-slate-400" />
              <span>Attachments ({note.attachments.length})</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal tabular-nums">
              Total {formatBytes(attachmentsBytes)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {note.attachments.map((att) => {
              const isImage = att.type.startsWith('image/');
              return (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs group text-xs"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {isImage ? (
                      <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="truncate min-w-0">
                      <div className="font-medium text-slate-800 truncate" title={att.name}>
                        {att.name}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        {formatBytes(att.size)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    {att.dataUrl && (
                      <a
                        href={att.dataUrl}
                        download={att.name}
                        title="Download attachment"
                        className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleRemoveAttachment(att.id)}
                      title="Remove attachment"
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Status & Footprint Bar */}
      <div className="px-6 py-2 border-t border-slate-200 bg-white flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-3 tabular-nums">
          <span>{charCount} characters</span>
          <span aria-hidden="true">·</span>
          <span>{wordCount} words</span>
          <span aria-hidden="true">·</span>
          <span>Size: {formatBytes(totalNoteBytes)}</span>
        </div>

        <div className="flex items-center gap-3">
          {note.isLocked ? (
            <span className="text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>AES-256 Zero-Knowledge</span>
            </span>
          ) : (
            <span>Auto-saved to cloud</span>
          )}
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            Updated {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
