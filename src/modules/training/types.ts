export type BlockType = 'heading' | 'text' | 'list' | 'images' | 'video' | 'quote' | 'file';

export interface HeadingBlock {
  id: string;
  type: 'heading';
  text: string;
}

export interface TextBlock {
  id: string;
  type: 'text';
  text: string;
}

export interface ListBlock {
  id: string;
  type: 'list';
  items: string[];
}

export interface BlockImage {
  id: string;
  url: string;
}

/** 1 картинка — рендерится как одиночное изображение, 2+ — как галерея/карусель. */
export interface ImagesBlock {
  id: string;
  type: 'images';
  images: BlockImage[];
}

export interface VideoBlock {
  id: string;
  type: 'video';
  /** Исходная ссылка на Rutube, как ввёл менеджер. */
  url: string;
}

export interface QuoteBlock {
  id: string;
  type: 'quote';
  text: string;
  /** Необязательно — пустая строка, если автор не указан. */
  author: string;
}

/** Вложение для скачивания. Содержимое (Blob) хранится отдельно, в памяти
 * сессии редактора/провайдера — сюда попадают только метаданные. */
export interface FileBlock {
  id: string;
  type: 'file';
  name: string;
  uploadedAt: string;
}

export type ArticleBlock = HeadingBlock | TextBlock | ListBlock | ImagesBlock | VideoBlock | QuoteBlock | FileBlock;

export interface Article {
  id: string;
  title: string;
  /** ISO-дата создания. */
  createdAt: string;
  blocks: ArticleBlock[];
}
