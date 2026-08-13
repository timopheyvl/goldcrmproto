import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraining } from './useTraining';
import { ProductThumb } from '../catalog/ProductThumb';
import { articleCoverImage } from './blocks';
import './training.css';

const MAX_OTHER_ARTICLES = 4;

/**
 * Автоматический футер, не блок конструктора: всегда внизу страницы статьи,
 * до 4 последних ДРУГИХ статей. Не редактируется, не двигается, не удаляется —
 * в списке «+ Добавить блок» его нет (см. ArticleEditorPage/blocks.ts).
 */
export function OtherArticlesFooter({ currentArticleId }: { currentArticleId: string }) {
  const navigate = useNavigate();
  const { articles } = useTraining();

  const others = useMemo(
    () =>
      articles
        .filter((article) => article.id !== currentArticleId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, MAX_OTHER_ARTICLES),
    [articles, currentArticleId],
  );

  if (others.length === 0) return null;

  return (
    <div className="other-articles">
      <h2 className="other-articles__title">Другие материалы</h2>
      <div className="other-articles__grid">
        {others.map((article) => {
          const cover = articleCoverImage(article);
          return (
            <article
              key={article.id}
              className="other-articles__card"
              onClick={() => navigate(`/training/${article.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') navigate(`/training/${article.id}`);
              }}
            >
              {cover ? (
                <img className="other-articles__cover" src={cover} alt="" />
              ) : (
                <ProductThumb name={article.title} size="md" />
              )}
              <span className="other-articles__name">{article.title}</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
