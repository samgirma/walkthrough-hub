export type CategoryType =
  | "WEB"
  | "PWN"
  | "CRYPTO"
  | "REVERSE"
  | "FORENSICS"
  | "MISC"
  | "OSINT";

export type DifficultyType = "EASY" | "MEDIUM" | "HARD" | "INSANE";

export type StatusType = "DRAFT" | "UNLISTED" | "PUBLIC";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  githubUrl?: string | null;
  createdAt: Date | string;
}

export interface TagItem {
  id: string;
  name: string;
}

export interface WriteupSummary {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string | null;
  ctfName: string;
  ctfYear: number;
  category: CategoryType;
  difficulty: DifficultyType;
  status: StatusType;
  viewCount: number;
  readTimeMin: number;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string | null;
    bio?: string | null;
  };
  tags: {
    tag: TagItem;
  }[];
  _count?: {
    bookmarks?: number;
  };
  isBookmarked?: boolean;
}

export interface WriteupDetail extends WriteupSummary {
  contentMd: string;
}

export interface FilterParams {
  category?: CategoryType;
  difficulty?: DifficultyType;
  ctfName?: string;
  ctfYear?: number;
  tag?: string;
  author?: string;
  search?: string;
  status?: StatusType;
  sort?: "trending" | "latest" | "views" | "alphabetical";
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export interface DashboardMetrics {
  totalWriteups: number;
  totalViews: number;
  publishedCount: number;
  draftCount: number;
  unlistedCount: number;
  bookmarksCount: number;
}
