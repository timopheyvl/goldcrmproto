import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RoleProvider } from './context/RoleProvider';
import { AppShell } from './shell/AppShell';
import { PlaceholderPage } from './modules/PlaceholderPage';
import { MODULES, DEFAULT_MODULE_PATH } from './modules';

export function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to={DEFAULT_MODULE_PATH} replace />} />
            {MODULES.map((module) => (
              <Route
                key={module.key}
                path={module.path}
                element={<PlaceholderPage module={module} />}
              />
            ))}
            <Route path="*" element={<Navigate to={DEFAULT_MODULE_PATH} replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RoleProvider>
  );
}
