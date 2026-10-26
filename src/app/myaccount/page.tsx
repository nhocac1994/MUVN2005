'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import {
  cardShell,
  cardBody,
  cardHead,
  inputModern,
  labelModern,
  btnPrimaryClass,
  btnPrimaryStyle,
} from '@/lib/page-theme';

export default function MyAccount() {
  const [user, setUser] = useState<{
    username: string;
    characterName: string;
    email: string;
    phone: string;
    securityQuestion: string;
    securityAnswer: string;
    joinDate: string;
    lastLogin: string;
    accountLevel: number;
    accountExpire: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState({
    characterName: '',
    email: '',
    phone: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
  const [profileErrors, setProfileErrors] = useState<{[key: string]: string}>({});
  const [lastPasswordChange, setLastPasswordChange] = useState<string | null>(null);
  const [canChangePassword, setCanChangePassword] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    // Ưu tiên lấy user từ localStorage (sau khi đăng nhập, ví dụ tài khoản test adminsse)
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
    const parsed = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : null;
    const hasStoredUser = parsed && parsed.username;

    const mockUser = hasStoredUser ? {
      username: parsed.username,
      characterName: parsed.characterName ?? 'AdminChar',
      email: parsed.email ?? 'admin@test.local',
      phone: parsed.phone ?? '0901234567',
      securityQuestion: parsed.securityQuestion ?? 'pet',
      securityAnswer: parsed.securityAnswer ?? 'Fluffy',
      joinDate: parsed.joinDate ?? '2025-01-01',
      lastLogin: parsed.lastLogin ?? new Date().toISOString().slice(0, 10),
      accountLevel: typeof parsed.accountLevel === 'number' ? parsed.accountLevel : 1,
      accountExpire: parsed.accountExpire ?? '2079-06-06'
    } : {
      username: 'testuser',
      characterName: 'TestCharacter',
      email: 'test@example.com',
      phone: '0123456789',
      securityQuestion: 'pet',
      securityAnswer: 'Fluffy',
      joinDate: '2025-01-01',
      lastLogin: '2025-01-15',
      accountLevel: 0,
      accountExpire: '2079-06-06'
    };
    setUser(mockUser);
    setProfileData({
      characterName: mockUser.characterName,
      email: mockUser.email,
      phone: mockUser.phone,
      securityQuestion: mockUser.securityQuestion,
      securityAnswer: mockUser.securityAnswer
    });

    // Kiểm tra lần thay đổi mật khẩu cuối
    const lastChange = localStorage.getItem('lastPasswordChange');
    if (lastChange) {
      setLastPasswordChange(lastChange);
      const today = new Date().toDateString();
      const lastChangeDate = new Date(lastChange).toDateString();
      setCanChangePassword(today !== lastChangeDate);
    }
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!passwordData.currentPassword) newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
    if (!passwordData.newPassword) newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProfileForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!profileData.characterName) newErrors.characterName = 'Tên nhân vật là bắt buộc';
    if (!profileData.email) newErrors.email = 'Email là bắt buộc';
    if (!profileData.phone) newErrors.phone = 'Số điện thoại là bắt buộc';
    if (!profileData.securityQuestion) newErrors.securityQuestion = 'Câu hỏi bảo mật là bắt buộc';
    if (!profileData.securityAnswer) newErrors.securityAnswer = 'Câu trả lời bảo mật là bắt buộc';

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    const stored = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
    const parsed = stored ? (() => { try { return JSON.parse(stored); } catch { return null; } })() : null;
    const accountId = parsed?.memb___id || parsed?.username || parsed?.accountId || user?.username;

    if (!accountId) {
      alert('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert('Lỗi: ' + (result.message || 'Không thể đổi mật khẩu'));
        return;
      }

      const now = new Date().toISOString();
      localStorage.setItem('lastPasswordChange', now);
      setLastPasswordChange(now);
      setCanChangePassword(false);

      alert('Mật khẩu đã được thay đổi thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      alert('Có lỗi xảy ra khi thay đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Thông tin cá nhân đã được cập nhật thành công!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const getSecurityQuestionText = (question: string) => {
    switch (question) {
      case 'pet': return 'Tên thú cưng đầu tiên của bạn?';
      case 'school': return 'Tên trường tiểu học của bạn?';
      case 'city': return 'Thành phố bạn sinh ra?';
      case 'food': return 'Món ăn yêu thích của bạn?';
      default: return question;
    }
  };

  return (
    <SubPageLayout
      maxWidth="1240"
      breadcrumbs={[{ label: 'Tài khoản' }]}
      title="Quản lý tài khoản"
      subtitle="Quản lý thông tin cá nhân và bảo mật tài khoản"
    >
            {/* Tabs */}
            <div className="mb-8 flex justify-center">
              <div className="flex gap-1 rounded-lg border border-purple-500/25 bg-[#120818]/80 p-1">
                {[
                  { id: 'profile', label: 'Thông tin' },
                  { id: 'password', label: 'Mật khẩu' },
                  { id: 'security', label: 'Bảo mật' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-md px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className={cardShell}>
                <div className={cardHead}>Thông tin cá nhân</div>
                <div className={cardBody}>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelModern}>Tên đăng nhập</label>
                      <input
                        type="text"
                        value={user?.username || ''}
                        disabled
                        className={`${inputModern} opacity-60 cursor-not-allowed`}
                      />
                      <p className="text-zinc-500 text-sm mt-1">Tên đăng nhập không thể thay đổi</p>
                    </div>
                    <div>
                      <label className={labelModern}>Tên nhân vật *</label>
                      <input
                        type="text"
                        name="characterName"
                        value={profileData.characterName}
                        onChange={handleProfileChange}
                        className={`${inputModern} ${profileErrors.characterName ? 'border-red-500' : ''}`}
                        placeholder="Nhập tên nhân vật"
                      />
                      {profileErrors.characterName && <p className="text-red-400 text-sm mt-1">{profileErrors.characterName}</p>}
                    </div>
                    <div>
                      <label className={labelModern}>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className={`${inputModern} ${profileErrors.email ? 'border-red-500' : ''}`}
                        placeholder="Nhập email"
                      />
                      {profileErrors.email && <p className="text-red-400 text-sm mt-1">{profileErrors.email}</p>}
                    </div>
                    <div>
                      <label className={labelModern}>Số điện thoại *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className={`${inputModern} ${profileErrors.phone ? 'border-red-500' : ''}`}
                        placeholder="Nhập số điện thoại"
                      />
                      {profileErrors.phone && <p className="text-red-400 text-sm mt-1">{profileErrors.phone}</p>}
                    </div>
                  </div>
                  <div className="text-center">
                    <button type="submit" className={btnPrimaryClass} style={btnPrimaryStyle}>
                      Cập nhật thông tin
                    </button>
                  </div>
                </form>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className={cardShell}>
                <div className={cardHead}>Đổi mật khẩu</div>
                <div className={cardBody}>
                
                {!canChangePassword && (
                  <div className="mb-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-900/20">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-xl mr-3">⚠️</span>
                      <div>
                        <p className="text-yellow-400 font-bold">Giới hạn thay đổi mật khẩu</p>
                        <p className="text-zinc-300 text-sm">
                          Bạn đã thay đổi mật khẩu trong ngày hôm nay. Chỉ được phép thay đổi 1 lần/ngày.
                        </p>
                        {lastPasswordChange && (
                          <p className="text-zinc-500 text-xs mt-1">
                            Lần thay đổi cuối: {new Date(lastPasswordChange).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className={labelModern}>Mật khẩu hiện tại *</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={!canChangePassword}
                        className={`${inputModern} ${passwordErrors.currentPassword ? 'border-red-500' : ''} ${!canChangePassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      {passwordErrors.currentPassword && <p className="text-red-400 text-sm mt-1">{passwordErrors.currentPassword}</p>}
                    </div>
                    <div>
                      <label className={labelModern}>Mật khẩu mới *</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        disabled={!canChangePassword}
                        className={`${inputModern} ${passwordErrors.newPassword ? 'border-red-500' : ''} ${!canChangePassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Nhập mật khẩu mới"
                      />
                      {passwordErrors.newPassword && <p className="text-red-400 text-sm mt-1">{passwordErrors.newPassword}</p>}
                    </div>
                    <div>
                      <label className={labelModern}>Xác nhận mật khẩu mới *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={!canChangePassword}
                        className={`${inputModern} ${passwordErrors.confirmPassword ? 'border-red-500' : ''} ${!canChangePassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      {passwordErrors.confirmPassword && <p className="text-red-400 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={!canChangePassword || passwordLoading}
                      className={`${btnPrimaryClass} ${!canChangePassword || passwordLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={canChangePassword && !passwordLoading ? btnPrimaryStyle : undefined}
                    >
                      {passwordLoading ? 'Đang đổi...' : canChangePassword ? 'Thay đổi mật khẩu' : 'Đã thay đổi trong ngày'}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className={cardShell}>
                <div className={cardHead}>Thông tin bảo mật</div>
                <div className={cardBody}>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelModern}>Câu hỏi bảo mật</label>
                      <input
                        type="text"
                        value={getSecurityQuestionText(profileData.securityQuestion)}
                        disabled
                        className={`${inputModern} opacity-60 cursor-not-allowed`}
                      />
                    </div>
                    <div>
                      <label className={labelModern}>Câu trả lời</label>
                      <input
                        type="text"
                        value="••••••••"
                        disabled
                        className={`${inputModern} opacity-60 cursor-not-allowed`}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="rounded-xl border border-purple-500/20 bg-[#120818]/60 p-4">
                      <div className="text-sm text-zinc-500 mb-1">Ngày tham gia</div>
                      <div className="text-lg font-bold text-white">{user?.joinDate}</div>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-[#120818]/60 p-4">
                      <div className="text-sm text-zinc-500 mb-1">Đăng nhập cuối</div>
                      <div className="text-lg font-bold text-white">{user?.lastLogin}</div>
                    </div>
                    <div className="rounded-xl border border-purple-500/20 bg-[#120818]/60 p-4">
                      <div className="text-sm text-zinc-500 mb-1">Cấp độ tài khoản</div>
                      <div className="text-lg font-bold text-white">Cấp {user?.accountLevel}</div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}
    </SubPageLayout>
  );
}
