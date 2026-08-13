import type { Article, ArticleBlock, BlockType } from './types';

export const BLOCK_TYPES: BlockType[] = ['heading', 'text', 'list', 'images', 'video', 'quote', 'file'];

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  heading: 'Заголовок',
  text: 'Текст',
  list: 'Список',
  images: 'Изображения',
  video: 'Видео (Rutube)',
  quote: 'Цитата',
  file: 'Файл',
};

function newBlockId(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Пустой блок нужного типа — появляется в конце списка по «+ Добавить блок»
 * и сразу редактируется на месте (полей для заполнения у него минимум). */
export function createEmptyBlock(type: BlockType): ArticleBlock {
  const id = newBlockId();
  switch (type) {
    case 'heading':
      return { id, type, text: '' };
    case 'text':
      return { id, type, text: '' };
    case 'list':
      return { id, type, items: [''] };
    case 'images':
      return { id, type, images: [] };
    case 'video':
      return { id, type, url: '' };
    case 'quote':
      return { id, type, text: '', author: '' };
    case 'file':
      return { id, type, name: '', uploadedAt: new Date().toISOString() };
  }
}

export function newImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Текст блока, участвующий в полнотекстовом поиске и в превью карточки статьи. */
function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case 'heading':
    case 'text':
      return block.text;
    case 'list':
      return block.items.join(' ');
    case 'quote':
      return [block.text, block.author].filter(Boolean).join(' ');
    case 'images':
    case 'video':
    case 'file':
      return '';
  }
}

export function articleSearchText(article: Article): string {
  return [article.title, ...article.blocks.map(blockText)].join(' ').toLowerCase();
}

/** Короткий фрагмент для карточки в списке — первый непустой текстовый блок. */
export function articleExcerpt(article: Article): string {
  for (const block of article.blocks) {
    const text = blockText(block).replace(/\s+/g, ' ').trim();
    if (text) return text.length > 140 ? `${text.slice(0, 140)}…` : text;
  }
  return '';
}

/** Обложка карточки в списке — первая картинка из первого блока «Изображения». */
export function articleCoverImage(article: Article): string | undefined {
  for (const block of article.blocks) {
    if (block.type === 'images' && block.images.length > 0) return block.images[0].url;
  }
  return undefined;
}
