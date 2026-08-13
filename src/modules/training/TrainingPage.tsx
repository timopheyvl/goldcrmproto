import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useTraining } from './useTraining';
import { ProductThumb } from '../catalog/ProductThumb';
import { articleCoverImage, articleExcerpt, articleSearchText } from './blocks';
import '../catalog/catalog.css';
import './training.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

export function TrainingPage() {
  const { role } = useRole();
  const navigate = useNavigate();
  const { articles } = useTraining();
  const isManager = role === 'manager';

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...articles].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (!query) return sorted;
    return sorted.filter((article) => articleSearchText(article).includes(query));
  }, [articles, search]);

  return (
    <div className="training-page">
      <div className="training-page__toolbar">
        <input
          type="search"
          className="catalog-page__search training-page__search"
          placeholder="Поиск по названию или тексту статьи…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {isManager && (
          <button type="button" className="btn btn--primary" onClick={() => navigate('/training/new')}>
            Новая статья
          </button>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Статей пока нет</div>
          <p>
            {isManager
              ? 'Добавьте первую обучающую статью.'
              : 'Обучающие материалы появятся здесь после того как менеджер их опубликует.'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">Ничего не найдено</div>
          <p>По запросу «{search}» статей не найдено.</p>
        </div>
      ) : (
        <div className="objects-grid">
          {filtered.map((article) => {
            const cover = articleCoverImage(article);
            const excerpt = articleExcerpt(article);
            return (
              <article
                key={article.id}
                className="product-card"
                onClick={() => navigate(`/training/${article.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') navigate(`/training/${article.id}`);
                }}
              >
                {cover ? (
                  <img className="training-card__cover" src={cover} alt="" />
                ) : (
                  <ProductThumb name={article.title} size="lg" />
                )}
                <div className="product-card__body">
                  <div className="object-card__date">{formatDate(article.createdAt)}</div>
                  <h3 className="product-card__name">{article.title}</h3>
                  {excerpt && <p className="training-card__excerpt">{excerpt}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
