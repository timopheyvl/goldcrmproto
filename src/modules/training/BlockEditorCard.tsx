import { useRef } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { parseRutubeEmbedUrl } from './rutube';
import { newImageId, BLOCK_TYPE_LABELS } from './blocks';
import type { ArticleBlock } from './types';
import './training.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

interface BlockEditorCardProps {
  block: ArticleBlock;
  index: number;
  total: number;
  onChange: (block: ArticleBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onSetPendingFile: (blockId: string, file: File) => void;
}

function BlockChrome({
  label,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: {
  label: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="block-editor-card">
      <div className="block-editor-card__header">
        <span className="block-editor-card__type">{label}</span>
        <div className="block-editor-card__controls">
          <button type="button" className="btn btn--ghost btn--sm" disabled={index === 0} onClick={onMoveUp} aria-label="Переместить вверх">
            ↑
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={index === total - 1}
            onClick={onMoveDown}
            aria-label="Переместить вниз"
          >
            ↓
          </button>
          <button type="button" className="btn btn--danger btn--sm" onClick={onRemove}>
            Удалить блок
          </button>
        </div>
      </div>
      <div className="block-editor-card__body">{children}</div>
    </div>
  );
}

export function BlockEditorCard({ block, index, total, onChange, onMoveUp, onMoveDown, onRemove, onSetPendingFile }: BlockEditorCardProps) {
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const blockFileInputRef = useRef<HTMLInputElement>(null);
  const imageUrlInputRef = useRef<HTMLInputElement>(null);

  const chrome = { label: BLOCK_TYPE_LABELS[block.type], index, total, onMoveUp, onMoveDown, onRemove };

  if (block.type === 'heading') {
    return (
      <BlockChrome {...chrome}>
        <input
          type="text"
          className="stage-field__input"
          placeholder="Текст подзаголовка"
          value={block.text}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
        />
      </BlockChrome>
    );
  }

  if (block.type === 'text') {
    return (
      <BlockChrome {...chrome}>
        <textarea
          rows={4}
          className="stage-field__input"
          placeholder="Текст абзаца"
          value={block.text}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
        />
      </BlockChrome>
    );
  }

  if (block.type === 'list') {
    const updateItem = (itemIndex: number, value: string) => {
      onChange({ ...block, items: block.items.map((item, i) => (i === itemIndex ? value : item)) });
    };
    const removeItem = (itemIndex: number) => {
      onChange({ ...block, items: block.items.filter((_, i) => i !== itemIndex) });
    };
    const addItem = () => {
      onChange({ ...block, items: [...block.items, ''] });
    };
    return (
      <BlockChrome {...chrome}>
        <div className="block-list-editor">
          {block.items.map((item, itemIndex) => (
            <div className="block-list-editor__row" key={itemIndex}>
              <input
                type="text"
                className="stage-field__input"
                placeholder={`Пункт ${itemIndex + 1}`}
                value={item}
                onChange={(event) => updateItem(itemIndex, event.target.value)}
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={block.items.length <= 1}
                onClick={() => removeItem(itemIndex)}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="btn btn--secondary btn--sm" onClick={addItem}>
            Добавить пункт
          </button>
        </div>
      </BlockChrome>
    );
  }

  if (block.type === 'images') {
    const handleAddByUpload = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      const url = URL.createObjectURL(file);
      onChange({ ...block, images: [...block.images, { id: newImageId(), url }] });
    };
    const removeImage = (imageId: string) => {
      onChange({ ...block, images: block.images.filter((image) => image.id !== imageId) });
    };
    const handleAddByUrl = () => {
      const url = imageUrlInputRef.current?.value.trim();
      if (!url) return;
      onChange({ ...block, images: [...block.images, { id: newImageId(), url }] });
      if (imageUrlInputRef.current) imageUrlInputRef.current.value = '';
    };
    return (
      <BlockChrome {...chrome}>
        <div className="article-editor__attach-row">
          <input ref={imageUrlInputRef} type="text" className="filter-select article-editor__url-input" placeholder="Ссылка на изображение" />
          <button type="button" className="btn btn--secondary btn--sm" onClick={handleAddByUrl}>
            Добавить по ссылке
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => imageFileInputRef.current?.click()}>
            Загрузить файл
          </button>
          <input ref={imageFileInputRef} type="file" accept="image/*" hidden onChange={handleAddByUpload} />
        </div>
        {block.images.length > 0 && (
          <div className="article-editor__image-list">
            {block.images.map((image) => (
              <div key={image.id} className="article-editor__image-item">
                <img src={image.url} alt="" />
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeImage(image.id)}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </BlockChrome>
    );
  }

  if (block.type === 'video') {
    const trimmed = block.url.trim();
    const invalid = trimmed.length > 0 && !parseRutubeEmbedUrl(trimmed);
    return (
      <BlockChrome {...chrome}>
        <input
          type="text"
          className={invalid ? 'stage-field__input stage-field__input--error' : 'stage-field__input'}
          placeholder="Ссылка вида https://rutube.ru/video/…/"
          value={block.url}
          onChange={(event) => onChange({ ...block, url: event.target.value })}
        />
        {invalid && <p className="stage-form__error">Не похоже на ссылку rutube.ru — при сохранении блок не отобразится.</p>}
      </BlockChrome>
    );
  }

  if (block.type === 'quote') {
    return (
      <BlockChrome {...chrome}>
        <textarea
          rows={3}
          className="stage-field__input"
          placeholder="Текст цитаты"
          value={block.text}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
        />
        <input
          type="text"
          className="stage-field__input block-editor-card__quote-author"
          placeholder="Автор (необязательно)"
          value={block.author}
          onChange={(event) => onChange({ ...block, author: event.target.value })}
        />
      </BlockChrome>
    );
  }

  // block.type === 'file'
  const handlePickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    onChange({ ...block, name: file.name, uploadedAt: new Date().toISOString() });
    onSetPendingFile(block.id, file);
  };

  return (
    <BlockChrome {...chrome}>
      <div className="block-file-editor">
        {block.name ? (
          <div className="document-row">
            <span className="document-row__name">{block.name}</span>
            <span className="document-row__date">{formatDate(block.uploadedAt)}</span>
          </div>
        ) : (
          <p className="stage-detail__empty-hint">Файл не выбран</p>
        )}
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => blockFileInputRef.current?.click()}>
          {block.name ? 'Заменить файл' : 'Выбрать файл'}
        </button>
        <input ref={blockFileInputRef} type="file" hidden onChange={handlePickFile} />
      </div>
    </BlockChrome>
  );
}
