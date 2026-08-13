import { useState } from 'react';
import { parseRutubeEmbedUrl } from './rutube';
import { useTraining } from './useTraining';
import type { ArticleBlock, BlockImage } from './types';
import './training.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

function ImageGallery({ images }: { images: BlockImage[] }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="article-block__images">
        <img src={images[0].url} alt="" className="article-block__image" />
      </div>
    );
  }

  const current = images[Math.min(index, images.length - 1)];

  return (
    <div className="image-gallery">
      <div className="image-gallery__frame">
        <img src={current.url} alt="" className="article-block__image" />
        <button
          type="button"
          className="image-gallery__nav image-gallery__nav--prev"
          aria-label="Предыдущее изображение"
          onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
        >
          ‹
        </button>
        <button
          type="button"
          className="image-gallery__nav image-gallery__nav--next"
          aria-label="Следующее изображение"
          onClick={() => setIndex((i) => (i + 1) % images.length)}
        >
          ›
        </button>
      </div>
      <div className="image-gallery__dots">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            className={i === index ? 'image-gallery__dot image-gallery__dot--active' : 'image-gallery__dot'}
            aria-label={`Изображение ${i + 1} из ${images.length}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

function FileBlockView({ block }: { block: Extract<ArticleBlock, { type: 'file' }> }) {
  const { getBlockFile } = useTraining();
  const hasFile = Boolean(getBlockFile(block.id));

  const handleDownload = () => {
    const blob = getBlockFile(block.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = block.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="document-row">
      <span className="document-row__name">{block.name || 'Без названия'}</span>
      <span className="document-row__date">{formatDate(block.uploadedAt)}</span>
      <button
        type="button"
        className="btn btn--secondary btn--sm"
        disabled={!hasFile}
        onClick={handleDownload}
        title={hasFile ? undefined : 'Файл доступен только в течение текущей сессии — после перезагрузки страницы недоступен'}
      >
        Скачать
      </button>
    </div>
  );
}

export function ArticleBlockView({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'heading':
      return block.text ? <h2 className="article-block__heading">{block.text}</h2> : null;

    case 'text':
      return block.text ? <p className="article-block__text">{block.text}</p> : null;

    case 'list': {
      const items = block.items.filter((item) => item.trim());
      if (items.length === 0) return null;
      return (
        <ul className="article-block__list">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }

    case 'images':
      return <ImageGallery images={block.images} />;

    case 'video': {
      const embedUrl = parseRutubeEmbedUrl(block.url);
      if (!embedUrl) return null;
      return (
        <div className="video-embed">
          <iframe src={embedUrl} allow="clipboard-write; autoplay" allowFullScreen title="Видео Rutube" />
        </div>
      );
    }

    case 'quote':
      if (!block.text.trim()) return null;
      return (
        <blockquote className="article-block__quote">
          <p>{block.text}</p>
          {block.author.trim() && <cite>{block.author}</cite>}
        </blockquote>
      );

    case 'file':
      return <FileBlockView block={block} />;
  }
}
