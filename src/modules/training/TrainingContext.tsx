import { createContext } from 'react';
import type { Article, ArticleBlock } from './types';

export interface TrainingContextValue {
  articles: Article[];
  getArticleById: (articleId: string) => Article | undefined;
  /**
   * Единая точка сохранения статьи — заголовок и блоки целиком, по кнопке
   * «Сохранить» в редакторе (articleId === null → создание новой статьи).
   * pendingBlockFiles — новые/заменённые Blob для блоков «Файл», накопленные
   * в редакторе с последнего сохранения (ключ — id блока); коммитятся в
   * файловое хранилище сессии этим же вызовом. Файловые блоки, которые были
   * в статье раньше и пропали из нового набора blocks, автоматически
   * подчищаются из хранилища. Возвращает id статьи (новый или переданный).
   */
  saveArticle: (articleId: string | null, title: string, blocks: ArticleBlock[], pendingBlockFiles: Record<string, File>) => string;
  deleteArticle: (articleId: string) => void;
  /** Файлы блоков «Файл» живут только в памяти текущей сессии — после
   * перезагрузки страницы метаданные останутся, а содержимое станет
   * недоступным для скачивания. Бэкенда/объектного хранилища в прототипе нет. */
  getBlockFile: (blockId: string) => File | undefined;
}

export const TrainingContext = createContext<TrainingContextValue | null>(null);
