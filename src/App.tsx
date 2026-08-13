import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RoleProvider } from './context/RoleProvider';
import { AppShell } from './shell/AppShell';
import { PlaceholderPage } from './modules/PlaceholderPage';
import { CatalogPage } from './modules/catalog/CatalogPage';
import { ProductPage } from './modules/catalog/ProductPage';
import { ImportPage } from './modules/catalog/ImportPage';
import { VendorsPage } from './modules/catalog/VendorsPage';
import { CartProvider } from './modules/catalog/CartProvider';
import { VendorProvider } from './modules/catalog/VendorProvider';
import { RequestsProvider } from './modules/requests/RequestsProvider';
import { RequestsPage } from './modules/requests/RequestsPage';
import { RequestDetailPage } from './modules/requests/RequestDetailPage';
import { OrderEditPage } from './modules/requests/OrderEditPage';
import { ObjectsProvider } from './modules/objects/ObjectsProvider';
import { ObjectsPage } from './modules/objects/ObjectsPage';
import { ObjectDetailPage } from './modules/objects/ObjectDetailPage';
import { AdminProvider } from './modules/admin/AdminProvider';
import { AdminPage } from './modules/admin/AdminPage';
import { TrainingProvider } from './modules/training/TrainingProvider';
import { TrainingPage } from './modules/training/TrainingPage';
import { ArticlePage } from './modules/training/ArticlePage';
import { ArticleEditorPage } from './modules/training/ArticleEditorPage';
import { MODULES, DEFAULT_MODULE_PATH } from './modules';

export function App() {
  return (
    <RoleProvider>
      <VendorProvider>
        <RequestsProvider>
          <ObjectsProvider>
            <AdminProvider>
              <TrainingProvider>
                <CartProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route element={<AppShell />}>
                        <Route index element={<Navigate to={DEFAULT_MODULE_PATH} replace />} />
                        {MODULES.map((module) =>
                          module.key === 'catalog' ? (
                            <Route key={module.key} path={module.path} element={<CatalogPage />} />
                          ) : module.key === 'requests' ? (
                            <Route key={module.key} path={module.path} element={<RequestsPage />} />
                          ) : module.key === 'objects' ? (
                            <Route key={module.key} path={module.path} element={<ObjectsPage />} />
                          ) : module.key === 'training' ? (
                            <Route key={module.key} path={module.path} element={<TrainingPage />} />
                          ) : module.key === 'admin' ? (
                            <Route key={module.key} path={module.path} element={<AdminPage />} />
                          ) : (
                            <Route
                              key={module.key}
                              path={module.path}
                              element={<PlaceholderPage module={module} />}
                            />
                          ),
                        )}
                        <Route path="/catalog/import" element={<ImportPage />} />
                        <Route path="/catalog/vendors" element={<VendorsPage />} />
                        <Route path="/catalog/:id" element={<ProductPage />} />
                        <Route path="/requests/:id" element={<RequestDetailPage />} />
                        <Route path="/orders/:id/edit" element={<OrderEditPage />} />
                        <Route path="/objects/:id" element={<ObjectDetailPage />} />
                        <Route path="/training/new" element={<ArticleEditorPage />} />
                        <Route path="/training/:id/edit" element={<ArticleEditorPage />} />
                        <Route path="/training/:id" element={<ArticlePage />} />
                        <Route path="*" element={<Navigate to={DEFAULT_MODULE_PATH} replace />} />
                      </Route>
                    </Routes>
                  </BrowserRouter>
                </CartProvider>
              </TrainingProvider>
            </AdminProvider>
          </ObjectsProvider>
        </RequestsProvider>
      </VendorProvider>
    </RoleProvider>
  );
}
