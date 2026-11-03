"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Terminal,
  Columns,
  Eye,
  PenTool,
  Save,
  Rocket,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  Quote,
  Flag,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownViewer } from "@/components/markdown/markdown-viewer";
import { PublishModal } from "@/components/editor/publish-modal";
import { calculateReadingTime } from "@/lib/reading-time";
import { CategoryType, DifficultyType, StatusType } from "@/types";

interface StudioEditorProps {
  initialWriteup?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    contentMd: string;
    ctfName: string;
    ctfYear: number;
    category: CategoryType;
    difficulty: DifficultyType;
    status: StatusType;
    tags?: { tag: { name: string } }[];
  } | null;
  authorUsername: string;
}

export function StudioEditor({
  initialWriteup,
  authorUsername,
}: StudioEditorProps) {
  const [title, setTitle] = useState(
    initialWriteup?.title || "HTB: CyberApocalypse 2024 - Binary Exploitation & Heap Grooming PoC"
  );
  const [contentMd, setContentMd] = useState(
    initialWriteup?.contentMd ||
      `# Exploitation Walkthrough: Kernel Space Race

## 1. Challenge Synopsis & Target
During inspection of the target module, we identified an unprotected free sequence.

:::callout[target]
**Target**: Linux 6.6 Kernel Module \`/dev/space_race\`  
**Mitigations**: KASLR, SMEP, SMAP  
:::

## 2. Recon & Surface Analysis
Here is the trigger sequence in C:

\`\`\`c
// Race trigger payload
int fd = open("/dev/space_race", O_RDWR);
ioctl(fd, RACE_ALLOC);
ioctl(fd, RACE_FREE);
\`\`\`

## 3. Exploit PoC & Root Shell
Spray \`msg_msg\` to hijack the freelist pointer.

:::flag
WHUB{slub_fr33l1st_p01s0n_2_r00t}
:::
`
  );

  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("Synced");
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate live stats
  const wordsCount = contentMd.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMin = calculateReadingTime(contentMd);

  // Render markdown for preview (simple debounce)
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const { renderMarkdown } = await import("@/lib/markdown");
        const html = await renderMarkdown(contentMd);
        if (active) setRenderedHtml(html);
      } catch (err) {
        console.error("Preview render error:", err);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [contentMd]);

  // Editor insertion helper
  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = contentMd.substring(start, end) || placeholder;

    const replacement = `${before}${selection}${after}`;
    const nextContent =
      contentMd.substring(0, start) + replacement + contentMd.substring(end);

    setContentMd(nextContent);
    setSaveStatus("Editing...");

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selection.length
      );
    }, 10);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const { url } = await res.json();
      insertText(`![${file.name}](${url})`);
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-[#0B0D12] text-[#E0E2EC] overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 w-full px-4 bg-[#12151C] border-b border-[#242936] flex items-center justify-between gap-4 z-40 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#181C25] hover:bg-[#1D2027] text-[#94A3B8] hover:text-white transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#181C25] border border-[#242936]">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
              STUDIO
            </span>
          </div>

          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveStatus("Editing...");
            }}
            placeholder="Untitled Writeup..."
            className="bg-transparent font-sans font-bold text-sm sm:text-base text-white hover:bg-[#181C25]/40 focus:bg-[#0B0D12] px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary truncate max-w-xl transition-all border border-transparent focus:border-[#242936]"
          />

          <div className="hidden xl:flex items-center gap-1.5 pl-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono text-[11px] text-[#475569]">
              {saveStatus}
            </span>
          </div>
        </div>

        {/* View Mode & Publish CTA */}
        <div className="flex items-center gap-2.5">
          {/* Split Mode Toggles */}
          <div className="flex items-center bg-[#0B0D12] p-0.5 rounded-lg border border-[#242936] font-mono text-xs">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === "split"
                  ? "bg-[#181C25] text-primary font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === "editor"
                  ? "bg-[#181C25] text-primary font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === "preview"
                  ? "bg-[#181C25] text-primary font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Live</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setPublishModalOpen(true)}
            className="gradient-cta text-[#0B0D12] font-mono font-bold text-xs gap-1.5 shadow-[0_0_16px_rgba(34,211,160,0.3)] hover:shadow-[0_0_20px_rgba(34,211,160,0.4)]"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span>Publish</span>
          </Button>
        </div>
      </header>

      {/* Secondary Context Strip */}
      <div className="w-full bg-[#10131A] px-4 py-1.5 border-b border-[#242936] flex items-center justify-between text-xs font-mono text-[#94A3B8] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="uppercase tracking-wider">BUFFER ACTIVE</span>
          </div>
          <span className="text-[#363E52]">•</span>
          <span>{wordsCount} words</span>
          <span className="text-[#363E52]">•</span>
          <span>{readTimeMin} min read time</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[#475569]">
          <span className="text-secondary font-bold">MD</span>
          <span>Unified CyberSpec Pipeline</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Markdown Editor */}
        {(viewMode === "split" || viewMode === "editor") && (
          <section
            className={`flex flex-col bg-[#0B0D12] overflow-hidden ${
              viewMode === "split" ? "w-full lg:w-1/2 border-r border-[#242936]" : "w-full"
            }`}
          >
            {/* Toolbar */}
            <div className="h-10 bg-[#12151C] px-3 border-b border-[#242936] flex items-center justify-between gap-1 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex items-center gap-1">
                {/* Headings */}
                <button
                  type="button"
                  onClick={() => insertText("## ")}
                  className="px-2 py-1 rounded hover:bg-[#181C25] text-xs font-mono font-bold text-[#BACAC1] hover:text-white"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertText("### ")}
                  className="px-2 py-1 rounded hover:bg-[#181C25] text-xs font-mono font-bold text-[#BACAC1] hover:text-white"
                  title="Heading 3"
                >
                  H3
                </button>
                <span className="h-3.5 w-px bg-[#242936] mx-1" />

                {/* Inline formatting */}
                <button
                  type="button"
                  onClick={() => insertText("**", "**", "bold text")}
                  className="p-1 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white"
                  title="Bold (**text**)"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("*", "*", "italic text")}
                  className="p-1 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white"
                  title="Italic (*text*)"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("~~", "~~", "strikethrough text")}
                  className="p-1 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white"
                  title="Strikethrough"
                >
                  <Strikethrough className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("> ", "", "quote")}
                  className="p-1 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white"
                  title="Blockquote"
                >
                  <Quote className="h-3.5 w-3.5" />
                </button>
                <span className="h-3.5 w-px bg-[#242936] mx-1" />

                {/* Code & Links */}
                <button
                  type="button"
                  onClick={() => insertText("```c\n", "\n```", '// C exploit code\nint fd = open("/dev/target", O_RDWR);')}
                  className="px-2 py-1 rounded hover:bg-[#181C25] text-xs font-mono text-primary flex items-center gap-1"
                  title="Code block"
                >
                  <Code className="h-3.5 w-3.5" />
                  <span>Block</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertText("`", "`", "payload")}
                  className="p-1 rounded hover:bg-[#181C25] font-mono text-xs text-[#BACAC1] hover:text-white"
                  title="Inline code (`payload`)"
                >
                  ` `
                </button>
                <button
                  type="button"
                  onClick={() => insertText("[", "](https://ctf.sec)", "Exploit Advisory")}
                  className="p-1 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white"
                  title="Insert Link"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </button>

                {/* Image upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 rounded hover:bg-[#181C25] text-[#BACAC1] hover:text-white"
                  title="Attach Image"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />

                <span className="h-3.5 w-px bg-[#242936] mx-1" />

                {/* CTF Callouts & Flag */}
                <button
                  type="button"
                  onClick={() =>
                    insertText(
                      "\n:::callout[target]\n",
                      "\n:::\n",
                      "**Target Binary**: `runc` <= 1.1.11\n**Mitigations**: ASLR, SMEP, SMAP"
                    )
                  }
                  className="px-2 py-1 rounded hover:bg-[#181C25] text-xs font-mono text-secondary flex items-center gap-1"
                  title="Insert Target / Info Callout"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>:::callout</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    insertText(
                      "\n:::flag\n",
                      "\n:::\n",
                      "WHUB{flag_string_here}"
                    )
                  }
                  className="px-2 py-1 rounded hover:bg-[#181C25] text-xs font-mono text-primary flex items-center gap-1"
                  title="Insert Flag Spoiler"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>:::flag</span>
                </button>
              </div>

              {isUploading && (
                <span className="text-primary text-[11px] font-mono animate-pulse">
                  Uploading image...
                </span>
              )}
            </div>

            {/* Editor Textarea */}
            <div className="flex-1 p-4 overflow-y-auto">
              <textarea
                ref={textareaRef}
                value={contentMd}
                onChange={(e) => {
                  setContentMd(e.target.value);
                  setSaveStatus("Editing...");
                }}
                spellCheck={false}
                placeholder="Write your CTF exploit walkthrough in Markdown..."
                className="w-full h-full min-h-[500px] bg-transparent text-[#E0E2EC] font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
              />
            </div>
          </section>
        )}

        {/* RIGHT COLUMN: Live Rendered Preview */}
        {(viewMode === "split" || viewMode === "preview") && (
          <section
            className={`flex-1 flex flex-col bg-[#12151C] overflow-y-auto p-6 sm:p-10 ${
              viewMode === "split" ? "border-l border-[#242936]" : "w-full"
            }`}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242936]">
              <span className="font-mono text-xs uppercase tracking-wider text-primary font-bold">
                Target Render View
              </span>
              <span className="font-mono text-[11px] text-[#475569]">
                Live Compiled HAST
              </span>
            </div>

            <h1 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight mb-6">
              {title}
            </h1>

            <MarkdownViewer htmlContent={renderedHtml} />
          </section>
        )}
      </div>

      {/* Publish Dialog Modal */}
      <PublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        title={title}
        slug={initialWriteup?.slug || ""}
        excerpt={initialWriteup?.excerpt || ""}
        contentMd={contentMd}
        ctfName={initialWriteup?.ctfName || "DEF CON CTF 32 Quals"}
        ctfYear={initialWriteup?.ctfYear || new Date().getFullYear()}
        category={initialWriteup?.category || "PWN"}
        difficulty={initialWriteup?.difficulty || "MEDIUM"}
        status={initialWriteup?.status || "PUBLIC"}
        tags={initialWriteup?.tags?.map((t) => t.tag.name) || ["kernel", "slub"]}
        writeupId={initialWriteup?.id}
        authorUsername={authorUsername}
        onSaveSuccess={(updated) => {
          setSaveStatus("Saved");
        }}
      />
    </div>
  );
}
