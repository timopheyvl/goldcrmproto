import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './auth.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
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
        {sent ? (
          <div className="auth-form">
            <div className="auth-form__logo">GoldLink</div>
            <h1 className="auth-form__title">Восстановление пароля</h1>
            <p className="auth-form__message">
              Ссылка для восстановления отправлена на email
            </p>
            <Link className="auth-form__forgot" to="/login">
              Вернуться ко входу
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__logo">GoldLink</div>
            <h1 className="auth-form__title">Восстановление пароля</h1>
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
            <button className="btn btn--primary auth-form__submit" type="submit">
              Отправить ссылку
            </button>
            <Link className="auth-form__forgot" to="/login">
              Вернуться ко входу
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
