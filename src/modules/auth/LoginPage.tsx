import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useRole } from '../../context/useRole';
import { DEFAULT_MODULE_PATH } from '../../modules';
import './auth.css';

export function LoginPage() {
  const { login } = useAuth();
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setRole('manager');
    login();
    navigate(DEFAULT_MODULE_PATH, { replace: true });
  };

  return (
    <div className="auth-screen">
      <div className="auth-screen__visual" aria-hidden="true">
        <div className="auth-screen__visual-glow" />
        <div className="auth-screen__visual-brand">GoldLink</div>
        <div className="auth-screen__visual-tagline">
          Спецификации оборудования и проектные материалы — в одном месте
        </div>
      </div>
      <div className="auth-screen__panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__logo">GoldLink</div>
          <h1 className="auth-form__title">Вход в систему</h1>
          <label className="auth-form__field">
            <span className="auth-form__label">Email</span>
            <input
              className="auth-form__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="username"
            />
          </label>
          <label className="auth-form__field">
            <span className="auth-form__label">Пароль</span>
            <input
              className="auth-form__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button className="btn btn--primary auth-form__submit" type="submit">
            Войти
          </button>
          <Link className="auth-form__forgot" to="/forgot-password">
            Забыли пароль?
          </Link>
        </form>
      </div>
    </div>
  );
}
