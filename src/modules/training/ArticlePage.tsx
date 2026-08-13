import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../../context/useRole';
import { useTraining } from './useTraining';
import { Modal } from '../../components/Modal';
import { ArticleBlockView } from './ArticleBlockView';
import { OtherArticlesFooter } from './OtherArticlesFooter';
import './training.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const navigate = useNavigate();
  const { getArticleById, deleteArticle } = useTraining();
  const isManager = role === 'manager';
  const [deleteOpen, setDeleteOpen] = useState(false);

  const article = id ? getArticleById(id) : undefined;

  if (!article) {
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

  const handleDelete = () => {
    deleteArticle(article.id);
    setDeleteOpen(false);
    navigate('/training');
  };

  return (
    <div className="article-detail">
      <div className="import-page__breadcrumb">
        <Link to="/training">Обучающие материалы</Link> / {article.title}
      </div>

      <div className="article-detail__header">
        <div>
          <h1 className="article-detail__title">{article.title}</h1>
          <div className="article-detail__date">{formatDate(article.createdAt)}</div>
        </div>
        {isManager && (
          <div className="article-detail__actions">
            <button type="button" className="btn btn--secondary" onClick={() => navigate(`/training/${article.id}/edit`)}>
              Редактировать
            </button>
            <button type="button" className="btn btn--danger" onClick={() => setDeleteOpen(true)}>
              Удалить
            </button>
          </div>
        )}
      </div>

      {article.blocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__title">У статьи пока нет содержимого</div>
          <p>
            {isManager
              ? 'Откройте редактирование и добавьте первый блок.'
              : 'Менеджер ещё не наполнил эту статью.'}
          </p>
        </div>
      ) : (
        <div className="article-detail__content">
          {article.blocks.map((block) => (
            <ArticleBlockView key={block.id} block={block} />
          ))}
        </div>
      )}

      <OtherArticlesFooter currentArticleId={article.id} />

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить статью?" width={420}>
        <p>Статья «{article.title}» и все прикреплённые файлы будут удалены без возможности восстановления.</p>
        <div className="object-detail__delete-actions">
          <button type="button" className="btn btn--secondary" onClick={() => setDeleteOpen(false)}>
            Отмена
          </button>
          <button type="button" className="btn btn--danger" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      </Modal>
    </div>
  );
}
