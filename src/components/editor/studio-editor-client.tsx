"use client";

import React from "react";
import dynamic from "next/dynamic";
import { StudioEditorSkeleton } from "@/components/editor/studio-skeleton";
import { CategoryType, DifficultyType, StatusType } from "@/types";

interface StudioEditorClientProps {
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

const LazyStudioEditor = dynamic(
  () => import("./studio-editor").then((m) => m.StudioEditor),
  {
    ssr: false,
    loading: () => <StudioEditorSkeleton />,
  }
);

export function StudioEditorClient(props: StudioEditorClientProps) {
  return <LazyStudioEditor {...props} />;
}
