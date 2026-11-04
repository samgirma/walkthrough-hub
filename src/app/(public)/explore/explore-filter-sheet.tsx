"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface ExploreFilterSheetProps {
  categories: { label: string; value: string; color?: string }[];
  difficulties: { label: string; value: string; color: string }[];
  currentCategory?: string;
  currentDifficulty?: string;
  currentSort?: string;
  totalResults: number;
}

export function ExploreFilterSheet({
  categories,
  difficulties,
  currentCategory = "",
  currentDifficulty = "",
  currentSort = "trending",
  totalResults,
}: ExploreFilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState(currentDifficulty);
  const [selectedSort, setSelectedSort] = useState(currentSort);

  // Sync state whenever sheet opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedCategory(currentCategory);
      setSelectedDifficulty(currentDifficulty);
      setSelectedSort(currentSort);
    }
    setOpen(isOpen);
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    if (selectedDifficulty) {
      params.set("difficulty", selectedDifficulty);
    } else {
      params.delete("difficulty");
    }

    if (selectedSort && selectedSort !== "trending") {
      params.set("sort", selectedSort);
    } else {
      params.delete("sort");
    }

    params.set("page", "1");
    router.push(`/explore?${params.toString()}`);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedCategory("");
    setSelectedDifficulty("");
    setSelectedSort("trending");

    const params = new URLSearchParams();
    const currentSearch = searchParams.get("search");
    if (currentSearch) params.set("search", currentSearch);
    
    router.push(`/explore${params.toString() ? `?${params.toString()}` : ""}`);
    setOpen(false);
  };

  const activeFiltersCount =
    (currentCategory ? 1 : 0) +
    (currentDifficulty ? 1 : 0) +
    (currentSort !== "trending" ? 1 : 0);

  return (
    <>
      {/* Mobile Floating / Inline Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 bg-[#12151C] border-[#242936] hover:border-[#363E52] text-white min-h-[44px] px-4 font-mono text-xs w-full sm:w-auto justify-center"
      >
        <Filter className="h-4 w-4 text-[#22D3A0]" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="ml-1 w-5 h-5 rounded-full bg-[#22D3A0] text-[#0B0D12] text-[10px] font-bold flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Mobile Bottom Sheet */}
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className="bg-[#12151C] border-t border-[#242936] p-6 max-h-[85svh] flex flex-col justify-between"
        >
          <div className="flex flex-col gap-6 overflow-y-auto pr-1">
            <SheetHeader className="text-left pb-3 border-b border-[#242936] flex flex-row items-center justify-between">
              <div>
                <SheetTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#22D3A0]" />
                  <span>Filter Writeups</span>
                </SheetTitle>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  {totalResults} solutions match criteria
                </p>
              </div>
            </SheetHeader>

            {/* Category Section */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#BACAC1]">
                Category
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((c) => {
                  const active = selectedCategory === c.value;
                  return (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(active ? "" : c.value)
                      }
                      className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between min-h-[44px] ${
                        active
                          ? "bg-[#22D3A0]/15 border-[#22D3A0] text-white font-semibold shadow-sm"
                          : "bg-[#0B0D12] border-[#242936] text-[#BACAC1] hover:border-[#363E52]"
                      }`}
                    >
                      <span className="truncate">{c.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-[#22D3A0] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Section */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#BACAC1]">
                Difficulty
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {difficulties.map((d) => {
                  const active = selectedDifficulty === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() =>
                        setSelectedDifficulty(active ? "" : d.value)
                      }
                      className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between min-h-[44px] ${
                        active
                          ? "bg-[#22D3A0]/15 border-[#22D3A0] text-white font-semibold shadow-sm"
                          : "bg-[#0B0D12] border-[#242936] text-[#BACAC1] hover:border-[#363E52]"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className={`w-2 h-2 rounded-full ${d.color} shrink-0`} />
                        <span>{d.label}</span>
                      </span>
                      {active && <Check className="h-3.5 w-3.5 text-[#22D3A0] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort Section */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#BACAC1]">
                Sort By
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Trending", value: "trending" },
                  { label: "Latest", value: "latest" },
                  { label: "Most Views", value: "views" },
                  { label: "A - Z", value: "alphabetical" },
                ].map((s) => {
                  const active = selectedSort === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSelectedSort(s.value)}
                      className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between min-h-[44px] ${
                        active
                          ? "bg-[#181C25] border-[#22D3A0] text-white font-semibold"
                          : "bg-[#0B0D12] border-[#242936] text-[#94A3B8] hover:border-[#363E52]"
                      }`}
                    >
                      <span>{s.label}</span>
                      {active && <Check className="h-3.5 w-3.5 text-[#22D3A0] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <SheetFooter className="pt-4 border-t border-[#242936] flex-row gap-3 sm:justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={handleClear}
              className="flex-1 bg-[#181C25] border-[#242936] text-[#BACAC1] hover:text-white min-h-[44px] font-mono text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </Button>

            <Button
              type="button"
              onClick={handleApply}
              className="flex-1 gradient-cta text-[#0B0D12] font-bold text-xs min-h-[44px] shadow-[0_0_16px_rgba(34,211,160,0.3)]"
            >
              <span>Apply Filters</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
