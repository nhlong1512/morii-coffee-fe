"use client";

import * as React from "react";
import type { ApiBlogCategory, ApiBlogPostDetail, ApiBlogPostSummary } from "@/types/api";
import type { BlogPostsQuery, PublicBlogPostsQuery } from "./types";
import {
  getAdminBlogCategories,
  getAdminBlogPostById,
  getAdminBlogPosts,
  getFeaturedBlogPosts,
  getPublicBlogCategories,
  getPublicBlogPostBySlug,
  getPublicBlogPosts,
} from "./api";

interface BaseState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return message.includes("404") || message.includes("not found");
}

export function useAdminBlogPosts(
  query: BlogPostsQuery = { takeAll: true }
): BaseState<ApiBlogPostSummary[]> {
  const [data, setData] = React.useState<ApiBlogPostSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPosts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminBlogPosts(query);
      setData(response.items);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load blog posts."));
    } finally {
      setLoading(false);
    }
  }, [query.categoryId, query.page, query.search, query.size, query.status, query.takeAll]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { data, loading, error, refetch: fetchPosts };
}

export function useAdminBlogPost(
  id: string | null
): BaseState<ApiBlogPostDetail | null> {
  const [data, setData] = React.useState<ApiBlogPostDetail | null>(null);
  const [loading, setLoading] = React.useState(Boolean(id));
  const [error, setError] = React.useState<string | null>(null);

  const fetchPost = React.useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setData(await getAdminBlogPostById(id));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load the blog post."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { data, loading, error, refetch: fetchPost };
}

export function useAdminBlogCategories(): BaseState<ApiBlogCategory[]> {
  const [data, setData] = React.useState<ApiBlogCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminBlogCategories(true);
      setData(response.items);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load blog categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data, loading, error, refetch: fetchCategories };
}

export function usePublicBlogPosts(
  query: PublicBlogPostsQuery = { takeAll: true }
): BaseState<ApiBlogPostSummary[]> {
  const [data, setData] = React.useState<ApiBlogPostSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPosts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublicBlogPosts(query);
      setData(response.items);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load published blog posts."));
    } finally {
      setLoading(false);
    }
  }, [query.categorySlug, query.featuredOnly, query.page, query.search, query.size, query.takeAll]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { data, loading, error, refetch: fetchPosts };
}

export function usePublicBlogPost(
  slug: string | null
): BaseState<ApiBlogPostDetail | null> {
  const [data, setData] = React.useState<ApiBlogPostDetail | null>(null);
  const [loading, setLoading] = React.useState(Boolean(slug));
  const [error, setError] = React.useState<string | null>(null);

  const fetchPost = React.useCallback(async () => {
    if (!slug) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setData(await getPublicBlogPostBySlug(slug));
    } catch (fetchError) {
      if (isNotFoundError(fetchError)) {
        setData(null);
        setError(null);
        return;
      }

      setError(getErrorMessage(fetchError, "Failed to load this blog post."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { data, loading, error, refetch: fetchPost };
}

export function usePublicBlogCategories(): BaseState<ApiBlogCategory[]> {
  const [data, setData] = React.useState<ApiBlogCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPublicBlogCategories());
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load blog categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data, loading, error, refetch: fetchCategories };
}

export function useFeaturedBlogPosts(
  take: number = 3
): BaseState<ApiBlogPostSummary[]> {
  const [data, setData] = React.useState<ApiBlogPostSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPosts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getFeaturedBlogPosts(take));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Failed to load featured blog posts."));
    } finally {
      setLoading(false);
    }
  }, [take]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { data, loading, error, refetch: fetchPosts };
}
