"use client";

import React, { useState } from "react";
import { ChevronDown, ListTree, FileCode } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface MobileTOCProps {
  toc: TOCItem[];
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

export function MobileTOCAccordion({ toc }: { toc: TOCItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (toc.length === 0) return null;

  return (
    <div className="lg:hidden w-full mb-6 rounded-xl border border-[#242936] bg-[#12151C] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left font-mono text-xs text-[#BACAC1] hover:text-white transition-colors min-h-[44px]"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 font-semibold">
          <ListTree className="h-4 w-4 text-[#22D3A0]" />
          <span>On this page ({toc.length} sections)</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#94A3B8] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-3 pt-1 border-t border-[#242936]/60 flex flex-col gap-1 font-mono text-xs">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setIsOpen(false)}
              className={`py-1.5 text-[#BACAC1] hover:text-[#22D3A0] transition-colors truncate min-h-[36px] flex items-center ${
                item.level === 2 ? "pl-2" : item.level >= 3 ? "pl-4" : ""
              }`}
            >
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileTOCSheet({
  toc,
  sheetOpen,
  onSheetOpenChange,
}: MobileTOCProps) {
  return (
    <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-[#12151C] border-t border-[#242936] p-6 max-h-[80svh] flex flex-col"
      >
        <SheetHeader className="text-left pb-3 border-b border-[#242936]">
          <SheetTitle className="text-sm font-bold text-white flex items-center gap-2 font-mono">
            <FileCode className="h-4 w-4 text-[#22D3A0]" />
            <span>Table of Contents</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-1 font-mono text-xs">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => onSheetOpenChange(false)}
              className={`py-2 px-2 rounded-lg text-[#BACAC1] hover:text-white hover:bg-[#181C25] transition-colors truncate min-h-[44px] flex items-center ${
                item.level === 2 ? "pl-4" : item.level >= 3 ? "pl-6" : ""
              }`}
            >
              <span>{item.title}</span>
            </a>
          ))}
          {toc.length === 0 && (
            <span className="text-[#475569] text-xs py-4 text-center">
              No sections defined in this writeup.
            </span>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
