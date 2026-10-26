'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import SimpleCaptcha from '@/components/SimpleCaptcha';
import {
  cardShell,
  cardBody,
  inputModern,
  labelModern,
  sectionTitleModern,
  btnPrimaryClass,
  linkAccent,
} from '@/lib/page-theme';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ username: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = 'Tên đăng nhập là bắt buộc';
    else if (formData.username.length < 3) newErrors.username = 'Tên đăng nhập ít nhất 3 ký tự';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu ít nhất 6 ký tự';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!formData.securityQuestion) newErrors.securityQuestion = 'Chọn câu hỏi bảo mật';
    if (!formData.securityAnswer) newErrors.securityAnswer = 'Câu trả lời là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessData({ username: formData.username });
        setIsSuccess(true);
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          securityQuestion: '',
          securityAnswer: '',
        });
      } else {
        alert(result.message || 'Đăng ký thất bại.');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="we-page">
      <SubPageLayout
        breadcrumbs={[{ label: 'Đăng Ký' }]}
        title="Đăng Ký Tài Khoản"
        subtitle="Tạo tài khoản mới để bắt đầu hành trình Mu Online"
        showSidebar={false}
      >
        <div className={`${cardShell} we-register-card`}>
          <div className={cardBody}>
            {isSuccess && successData ? (
              <div className="we-register-success">
                <div className="we-register-success-icon" aria-hidden>
                  ✓
                </div>
                <h2 className="we-register-success-title">Đăng ký thành công</h2>
                <p className="we-register-success-desc">
                  Tài khoản <strong>{successData.username}</strong> đã sẵn sàng để đăng nhập.
                </p>
                <Link href="/login" className={btnPrimaryClass}>
                  Đăng nhập ngay
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="we-register-success-secondary"
                >
                  Đăng ký tài khoản khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="we-register-form">
                <section className="we-register-section">
                  <h3 className={sectionTitleModern}>Thông tin tài khoản</h3>
                  <div className="we-register-field">
                    <label className={labelModern}>Tên đăng nhập *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`${inputModern} ${errors.username ? 'border-red-500' : ''}`}
                      placeholder="Nhập tên đăng nhập"
                      autoComplete="off"
                    />
                    {errors.username && <p className="we-register-error">{errors.username}</p>}
                  </div>
                  <div className="we-register-row">
                    <div className="we-register-field">
                      <label className={labelModern}>Mật khẩu *</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`${inputModern} ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="Nhập mật khẩu"
                        autoComplete="new-password"
                      />
                      {errors.password && <p className="we-register-error">{errors.password}</p>}
                    </div>
                    <div className="we-register-field">
                      <label className={labelModern}>Xác nhận mật khẩu *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`${inputModern} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Nhập lại mật khẩu"
                        autoComplete="new-password"
                      />
                      {errors.confirmPassword && (
                        <p className="we-register-error">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="we-register-section">
                  <h3 className={sectionTitleModern}>Bảo mật</h3>
                  <div className="we-register-row">
                    <div className="we-register-field">
                      <label className={labelModern}>Câu hỏi bảo mật *</label>
                      <select
                        name="securityQuestion"
                        value={formData.securityQuestion}
                        onChange={handleInputChange}
                        className={`${inputModern} ${errors.securityQuestion ? 'border-red-500' : ''}`}
                      >
                        <option value="">Chọn câu hỏi bảo mật</option>
                        <option value="pet">Tên thú cưng đầu tiên của bạn?</option>
                        <option value="school">Tên trường tiểu học của bạn?</option>
                        <option value="city">Thành phố bạn sinh ra?</option>
                        <option value="food">Món ăn yêu thích của bạn?</option>
                      </select>
                      {errors.securityQuestion && (
                        <p className="we-register-error">{errors.securityQuestion}</p>
                      )}
                    </div>
                    <div className="we-register-field">
                      <label className={labelModern}>Câu trả lời *</label>
                      <input
                        type="text"
                        name="securityAnswer"
                        value={formData.securityAnswer}
                        onChange={handleInputChange}
                        className={`${inputModern} ${errors.securityAnswer ? 'border-red-500' : ''}`}
                        placeholder="Nhập câu trả lời"
                        autoComplete="off"
                      />
                      {errors.securityAnswer && (
                        <p className="we-register-error">{errors.securityAnswer}</p>
                      )}
                    </div>
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
                  {isLoading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
                </button>
              </form>
            )}

            {!isSuccess && (
              <p className="mt-5 text-center text-sm text-zinc-500">
                Đã có tài khoản?{' '}
                <Link href="/login" className={linkAccent}>
                  Đăng nhập ngay
                </Link>
              </p>
            )}
          </div>
        </div>
      </SubPageLayout>
      <Footer />
    </div>
  );
}
