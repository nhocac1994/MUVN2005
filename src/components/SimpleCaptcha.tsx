'use client';

import { useState, useEffect, useCallback } from 'react';

interface SimpleCaptchaProps {
  onVerify: (isValid: boolean) => void;
  /** Style phù hợp trang login/register tối giản (ảnh 3) */
  variant?: 'default' | 'minimal';
}

export default function SimpleCaptcha({ onVerify, variant = 'default' }: SimpleCaptchaProps) {
  const [captcha, setCaptcha] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setUserInput('');
    setIsValid(false);
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUserInput(value);
    const valid = value === captcha;
    setIsValid(valid);
    onVerify(valid);
  };

  const handleRefresh = () => {
    generateCaptcha();
  };

  const isMinimal = variant === 'minimal';

  return (
    <div
      className={
        isMinimal
          ? 'we-captcha we-captcha--light'
          : 'bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50'
      }
    >
      <label
        className={
          isMinimal
            ? 'block text-sm font-semibold text-gray-700 mb-2'
            : 'block text-white font-semibold mb-2 mu-text-gold'
        }
      >
        Mã xác thực *
      </label>
      <div className={isMinimal ? 'we-captcha-row' : 'flex items-center gap-3 mb-3'}>
        <div
          className={
            isMinimal
              ? 'we-captcha-code'
              : 'bg-white p-3 rounded border-2 border-[#FFD700] text-black font-bold text-lg tracking-widest min-w-[120px] text-center shadow-lg'
          }
          style={!isMinimal ? { boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' } : undefined}
        >
          {captcha}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className={isMinimal ? 'we-captcha-refresh' : 'mu-retro-btn px-3 py-2 text-sm'}
          aria-label="Làm mới mã"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
        {isMinimal && (
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Nhập mã xác thực"
            className="we-input we-captcha-input"
            maxLength={5}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            style={{ textTransform: 'uppercase' }}
          />
        )}
      </div>
      {!isMinimal && (
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Nhập mã xác thực"
          className="mu-retro-input w-full"
          maxLength={5}
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          style={{ textTransform: 'uppercase' }}
        />
      )}
      {userInput && !isValid && (
        <p className={isMinimal ? 'we-register-error' : 'text-red-400 text-xs mt-1'}>
          Mã xác thực không đúng
        </p>
      )}
      {isValid && (
        <p className={isMinimal ? 'text-green-600 text-xs mt-1' : 'text-green-400 text-xs mt-1'}>
          ✓ Mã xác thực đúng
        </p>
      )}
    </div>
  );
}
