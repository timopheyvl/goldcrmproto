import { useState } from 'react';
import type { Category } from './types';
import { getCategoryChildren } from './data';

interface CategoryTreeProps {
  categories: Category[];
  counts: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  totalCount: number;
}

export function CategoryTree({ categories, counts, selectedId, onSelect, totalCount }: CategoryTreeProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const roots = getCategoryChildren(null);

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <nav className="category-tree" aria-label="Категории каталога">
      <button
        type="button"
        className={`category-tree__item category-tree__item--root ${selectedId === null ? 'category-tree__item--active' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span>Все категории</span>
        <span className="category-tree__count">{totalCount}</span>
      </button>
      <ul className="category-tree__list">
        {roots.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            categories={categories}
            counts={counts}
            selectedId={selectedId}
            onSelect={onSelect}
            collapsed={collapsed}
            onToggle={toggle}
          />
        ))}
      </ul>
    </nav>
  );
}

interface CategoryNodeProps {
  category: Category;
  categories: Category[];
  counts: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
}

function CategoryNode({ category, categories, counts, selectedId, onSelect, collapsed, onToggle }: CategoryNodeProps) {
  const children = categories.filter((item) => item.parentId === category.id);
  const hasChildren = children.length > 0;
  const isCollapsed = collapsed.has(category.id);
  const count = counts[category.id] ?? 0;

  return (
    <li className="category-tree__node">
      <div className={`category-tree__row ${selectedId === category.id ? 'category-tree__item--active' : ''}`}>
        {hasChildren ? (
          <button
            type="button"
            className="category-tree__toggle"
            onClick={() => onToggle(category.id)}
            aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? '▸' : '▾'}
          </button>
        ) : (
          <span className="category-tree__toggle-spacer" />
        )}
        <button
          type="button"
          className={`category-tree__item ${count === 0 ? 'category-tree__item--empty' : ''}`}
          onClick={() => onSelect(category.id)}
        >
          <span>{category.name}</span>
          <span className="category-tree__count">{count}</span>
        </button>
      </div>
      {hasChildren && !isCollapsed && (
        <ul className="category-tree__list category-tree__list--nested">
          {children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              categories={categories}
              counts={counts}
              selectedId={selectedId}
              onSelect={onSelect}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
