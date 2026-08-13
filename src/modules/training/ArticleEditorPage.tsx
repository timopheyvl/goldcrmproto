import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useTraining } from './useTraining';
import { BLOCK_TYPES, BLOCK_TYPE_LABELS, createEmptyBlock } from './blocks';
import { BlockEditorCard } from './BlockEditorCard';
import type { ArticleBlock, BlockType } from './types';
import './training.css';

function cloneBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  return blocks.map((block) => ({ ...block }));
}

/**
 * Один компонент на создание и редактирование (/training/new и
 * /training/:id/edit) — статья представлена как заголовок + произвольный
 * список блоков. Блоки собираются конструктором: «+ Добавить блок» выбирает
 * тип и добавляет пустой блок в конец, у каждого блока — стрелки вверх/вниз
 * и удаление, без drag-and-drop. Сохранение — по кнопке «Сохранить» (это
 * документ, а не инлайн-поле, см. CLAUDE.md): весь набор блоков коммитится
 * в провайдер одним вызовом saveArticle.
 */
export function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const navigate = useNavigate();
  const { getArticleById, saveArticle } = useTraining();

  const existing = id ? getArticleById(id) : undefined;
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
  const [pendingBlockFiles, setPendingBlockFiles] = useState<Record<string, File>>({});
  const [addType, setAddType] = useState<BlockType>('text');

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setBlocks(cloneBlocks(existing.blocks));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  if (role !== 'manager') {
    return (
      <div className="article-detail">
        <div className="import-page__breadcrumb">
          <Link to="/training">Обучающие материалы</Link> / Доступ ограничен
        </div>
        <div className="empty-state">
          <div className="empty-state__title">Редактирование недоступно</div>
          <p>Создавать и редактировать статьи может только менеджер GoldLink.</p>
          <Link to="/training" className="btn btn--secondary">
            Вернуться к статьям
          </Link>
        </div>
      </div>
    );
  }

  if (isEditing && !existing) {
    return (
      <div className="article-detail">
        <div className="import-page__breadcrumb">
          <Link to="/training">Обучающие материалы</Link> / Статья не найдена
        </div>
        <div className="empty-state">
          <div className="empty-state__title">Статья не найдена</div>
          <p>Возможно, статья была удалена или ссылка устарела.</p>
          <Link to="/training" className="btn btn--secondary">
            Вернуться к статьям
          </Link>
        </div>
      </div>
    );
  }

  const backLink = isEditing && existing ? `/training/${existing.id}` : '/training';
  const canSave = title.trim().length > 0;

  const handleAddBlock = () => {
    setBlocks((prev) => [...prev, createEmptyBlock(addType)]);
  };

  const handleChangeBlock = (updated: ArticleBlock) => {
    setBlocks((prev) => prev.map((block) => (block.id === updated.id ? updated : block)));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    setBlocks((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
    setPendingBlockFiles((prev) => {
      if (!(blockId in prev)) return prev;
      const next = { ...prev };
      delete next[blockId];
      return next;
    });
  };

  const handleSetPendingFile = (blockId: string, file: File) => {
    setPendingBlockFiles((prev) => ({ ...prev, [blockId]: file }));
  };

  const handleSave = () => {
    if (!canSave) return;
    const newId = saveArticle(existing ? existing.id : null, title.trim(), blocks, pendingBlockFiles);
    navigate(`/training/${newId}`);
  };

  return (
    <div className="article-editor">
      <div className="import-page__breadcrumb">
        <Link to={backLink}>{isEditing && existing ? existing.title : 'Обучающие материалы'}</Link> /{' '}
        {isEditing ? 'Редактирование' : 'Новая статья'}
      </div>

      <h1 className="import-page__title">{isEditing ? 'Редактирование статьи' : 'Новая статья'}</h1>

      <div className="article-editor__layout">
        <div className="import-form article-editor__form">
          <label className="import-form__field">
            <span>Название</span>
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          <div className="article-editor__stub-note">
            Полноценный rich-text редактор (форматирование внутри блока, drag-and-drop) — на этапе реализации. Здесь
            статья собирается из простых блоков в любом порядке.
          </div>

          {blocks.length === 0 && <p className="stage-detail__empty-hint">Блоков пока нет — добавьте первый ниже.</p>}

          <div className="block-editor-list">
            {blocks.map((block, index) => (
              <BlockEditorCard
                key={block.id}
                block={block}
                index={index}
                total={blocks.length}
                onChange={handleChangeBlock}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                onRemove={() => handleRemoveBlock(block.id)}
                onSetPendingFile={handleSetPendingFile}
              />
            ))}
          </div>

          <div className="block-add-row">
            <select className="filter-select" value={addType} onChange={(event) => setAddType(event.target.value as BlockType)}>
              {BLOCK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {BLOCK_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn--secondary" onClick={handleAddBlock}>
              + Добавить блок
            </button>
          </div>

          <div className="article-editor__actions">
            <Link to={backLink} className="btn btn--ghost">
              Отмена
            </Link>
            <button type="button" className="btn btn--primary" disabled={!canSave} onClick={handleSave}>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
