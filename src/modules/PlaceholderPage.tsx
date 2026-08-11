import type { ModuleConfig } from '../types';

export function PlaceholderPage({ module }: { module: ModuleConfig }) {
  return (
    <div className="placeholder-page">
      <h1 className="placeholder-page__title">{module.label}</h1>
      <p className="placeholder-page__description">{module.description}</p>
      <div className="placeholder-page__stub">Раздел в разработке</div>
    </div>
  );
}
