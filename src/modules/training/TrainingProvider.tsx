import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { TrainingContext } from './TrainingContext';
import type { TrainingContextValue } from './TrainingContext';
import { SEED_ARTICLES } from './data';
import type { Article, ArticleBlock } from './types';

const ARTICLES_STORAGE_KEY = 'goldlink.training.articles';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function fileBlockIds(blocks: ArticleBlock[]): Set<string> {
  return new Set(blocks.filter((block) => block.type === 'file').map((block) => block.id));
}

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(() => readStored(ARTICLES_STORAGE_KEY, SEED_ARTICLES));

  // Содержимое файлов блока «Файл» живёт только в памяти текущей вкладки —
  // File не сериализуется в localStorage, там остаются только метаданные
  // блока (name/uploadedAt). Ключ — id блока.
  const fileStoreRef = useRef<Map<string, File>>(new Map());

  useEffect(() => {
    window.localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
  }, [articles]);

  const value = useMemo<TrainingContextValue>(() => {
    const getArticleById: TrainingContextValue['getArticleById'] = (articleId) =>
      articles.find((article) => article.id === articleId);

    const saveArticle: TrainingContextValue['saveArticle'] = (articleId, title, blocks, pendingBlockFiles) => {
      const id = articleId ?? `art-${Date.now()}`;

      setArticles((prev) => {
        const existing = prev.find((article) => article.id === id);
        if (existing) {
          const previousFileIds = fileBlockIds(existing.blocks);
          const nextFileIds = fileBlockIds(blocks);
          previousFileIds.forEach((fileId) => {
            if (!nextFileIds.has(fileId)) fileStoreRef.current.delete(fileId);
          });
          return prev.map((article) => (article.id === id ? { ...article, title, blocks } : article));
        }
        const article: Article = { id, title, blocks, createdAt: new Date().toISOString() };
        return [article, ...prev];
      });

      Object.entries(pendingBlockFiles).forEach(([blockId, file]) => {
        fileStoreRef.current.set(blockId, file);
      });

      return id;
    };

    const deleteArticle: TrainingContextValue['deleteArticle'] = (articleId) => {
      setArticles((prev) => {
        const target = prev.find((article) => article.id === articleId);
        if (target) {
          fileBlockIds(target.blocks).forEach((fileId) => fileStoreRef.current.delete(fileId));
        }
        return prev.filter((article) => article.id !== articleId);
      });
    };

    const getBlockFile: TrainingContextValue['getBlockFile'] = (blockId) => fileStoreRef.current.get(blockId);

    return {
      articles,
      getArticleById,
      saveArticle,
      deleteArticle,
      getBlockFile,
    };
  }, [articles]);

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}
