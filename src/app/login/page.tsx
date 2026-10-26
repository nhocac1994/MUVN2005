'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import SimpleCaptcha from '@/components/SimpleCaptcha';
import { useI18n } from '@/lib/i18n';
import {
  cardShell,
  cardBody,
  inputModern,
  labelModern,
  sectionTitleModern,
  btnPrimaryClass,
  linkAccent,
} from '@/lib/page-theme';

export default function LoginPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaValid, setCaptchaValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = t('login.userReq');
    if (!formData.password) newErrors.password = t('login.passReq');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !captchaValid) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        if (result.data?.token) localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user_data', JSON.stringify(result.data || {}));
        window.location.href = '/dashboard';
      } else {
        alert(result.message || t('login.fail'));
        setIsLoading(false);
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  return (
    <div className="we-page">
      <SubPageLayout
        breadcrumbs={[{ label: t('nav.login') }]}
        title={t('nav.login')}
        subtitle={t('login.sub')}
        showSidebar={false}
      >
        <div className={`${cardShell} we-register-card`}>
          <div className={cardBody}>
            <form onSubmit={handleSubmit} className="we-register-form">
              <section className="we-register-section">
                <h3 className={sectionTitleModern}>{t('login.section')}</h3>
                <div className="we-register-field">
                  <label htmlFor="username" className={labelModern}>
                    {t('login.user')}
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`${inputModern} ${errors.username ? 'border-red-500' : ''}`}
                    placeholder={t('login.userPh')}
                    autoComplete="username"
                  />
                  {errors.username && <p className="we-register-error">{errors.username}</p>}
                </div>
                <div className="we-register-field">
                  <label htmlFor="password" className={labelModern}>
                    {t('login.pass')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${inputModern} ${errors.password ? 'border-red-500' : ''}`}
                    placeholder={t('login.passPh')}
                    autoComplete="current-password"
                  />
                  {errors.password && <p className="we-register-error">{errors.password}</p>}
                </div>
              </section>

              <section className="we-register-section">
                <h3 className={sectionTitleModern}>Xác thực</h3>
                <SimpleCaptcha onVerify={setCaptchaValid} variant="minimal" />
              </section>

              <button
                type="submit"
                disabled={!captchaValid || isLoading}
                className={btnPrimaryClass}
              >
                {isLoading ? t('login.loading') : t('login.submit')}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-500">
              {t('login.noAccount')}{' '}
              <Link href="/register" className={linkAccent}>
                {t('login.register')}
              </Link>
            </p>
          </div>
        </div>
      </SubPageLayout>
      <Footer />
    </div>
  );
}
