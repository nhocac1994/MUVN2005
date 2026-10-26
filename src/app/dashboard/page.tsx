'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SubPageLayout from '@/components/SubPageLayout';
import ClassIcon from '@/components/ClassIcon';
import { getMuClassName } from '@/lib/mu-classes';
import { inputModern, btnPrimaryClass } from '@/lib/page-theme';

function DashRow({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="we-dash-row">
      <span className="we-dash-label">{label}</span>
      <span className={`we-dash-value ${valueClass}`.trim()}>{value}</span>
    </div>
  );
}

interface Character {
  name: string;
  level: number;
  class: number;
  className: string;
  resetCount: number;
  masterResetCount: number;
  stats: {
    strength: number;
    dexterity: number;
    vitality: number;
    energy: number;
    leadership: number;
  };
  life: number;
  maxLife: number;
  mana: number;
  maxMana: number;
  money: number;
  mapNumber: number;
  mapPosX: number;
  mapPosY: number;
  pkCount: number;
  pkLevel: number;
}

interface DashboardData {
  account: {
    id: string;
    characterCount: number;
    level: number;
    levelName: string;
    levelColor: string;
    expireDate: string;
    isExpired: boolean;
  };
  character: {
    name: string;
    level: number;
    class: number;
    money: number;
    resetCount: number;
    masterResetCount: number;
    isOnline: boolean;
    pkCount: number;
    pkLevel: number;
  };
  warehouse: {
    money: number;
  };
  guild: {
    name: string;
    master: string;
    score: number;
    memberCount: number;
  } | null;
}

export default function Dashboard() {
  const [user, setUser] = useState<{ memb___id: string; memb_name: string } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();

  const getClassName = (classId: number): string => getMuClassName(classId);

  const formatMoney = (money: number): string =>
    new Intl.NumberFormat('vi-VN').format(money);

  const formatText = (text: string | null | undefined): string => {
    if (!text) return '';
    if (/^\d+$/.test(text) || /\d/.test(text)) return text;
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatAccountName = (name: string | null | undefined): string => {
    if (!name) return '';
    if (/\d/.test(name) || /[^a-zA-Z0-9]/.test(name)) return name;
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const fetchCharacters = async (accountId: string) => {
    try {
      setCharactersLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/characters?accountId=${accountId}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (result.success && result.data?.characters?.length) {
        setCharacters(result.data.characters);
        setSelectedCharacter(result.data.characters[0]);
      } else {
        setCharacters([]);
        setSelectedCharacter(null);
      }
    } catch {
      setCharacters([]);
      setSelectedCharacter(null);
    } finally {
      setCharactersLoading(false);
    }
  };

  const handleCharacterChange = (characterName: string) => {
    const character = characters.find((char) => char.name === characterName);
    if (character) setSelectedCharacter(character);
  };

  const handleChangePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      if (!user?.memb___id) {
        alert('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
        return;
      }

      setUpdateLoading(true);
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: user.memb___id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Đổi mật khẩu thành công!');
        setShowPasswordModal(false);
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch {
      alert('Lỗi khi đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (!token || !userData) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        const accountId =
          parsedUser.memb___id ||
          parsedUser.username ||
          parsedUser.accountId ||
          parsedUser.id;

        if (!accountId) {
          router.push('/login');
          return;
        }

        setUser({
          memb___id: accountId,
          memb_name:
            parsedUser.memb_name ||
            parsedUser.username ||
            parsedUser.characterName ||
            accountId,
        });

        await fetchCharacters(accountId);

        try {
          const response = await fetch(`/api/dashboard?accountId=${accountId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'x-user-account': accountId,
            },
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setDashboardData(result.data);
              if (result.data.account?.id) {
                setUser((prev) => ({
                  memb___id: result.data.account.id,
                  memb_name: prev?.memb_name || result.data.account.id,
                }));
              }
            } else {
              setDashboardData(null);
            }
          } else {
            setDashboardData(null);
          }
        } catch {
          setDashboardData(null);
        }

        setLoading(false);
      } catch {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  if (loading) {
    return (
      <SubPageLayout
        breadcrumbs={[{ label: 'Bảng điều khiển' }]}
        title="Bảng điều khiển"
        subtitle="Đang tải dữ liệu..."
        showSidebar={false}
      >
        <div className="we-loading-center">
          <div className="we-spinner" />
        </div>
      </SubPageLayout>
    );
  }

  const charName =
    selectedCharacter?.name || dashboardData?.character?.name || 'Chưa có';
  const charLevel = selectedCharacter?.level ?? dashboardData?.character?.level ?? 0;
  const charClass = selectedCharacter?.class ?? dashboardData?.character?.class ?? 0;
  const charClassName =
    selectedCharacter?.className || getClassName(charClass);
  const resetCount =
    selectedCharacter?.resetCount ?? dashboardData?.character?.resetCount ?? 0;
  const masterReset =
    selectedCharacter?.masterResetCount ??
    dashboardData?.character?.masterResetCount ??
    0;
  const charMoney =
    selectedCharacter?.money ?? dashboardData?.character?.money ?? 0;

  return (
    <SubPageLayout
      breadcrumbs={[{ label: 'Bảng điều khiển' }]}
      title="Bảng điều khiển"
      subtitle="Thông tin tài khoản và nhân vật"
      showSidebar={false}
    >
      <div className="we-box we-dash-toolbar">
        <div className="we-box-body">
          <div className="we-dash-toolbar">
            <div className="we-dash-toolbar-user">
              Xin chào, <strong>{user?.memb_name || '—'}</strong>
            </div>
            {characters.length > 0 ? (
              <div className="we-dash-char-select">
                <label htmlFor="dash-char">Nhân vật:</label>
                <select
                  id="dash-char"
                  value={selectedCharacter?.name || ''}
                  onChange={(e) => handleCharacterChange(e.target.value)}
                  disabled={charactersLoading}
                  className={inputModern}
                  style={{ marginBottom: 0 }}
                >
                  {characters.map((char) => (
                    <option key={char.name} value={char.name}>
                      {char.name} ({char.className}) — Cấp {char.level}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: '#b45309', margin: 0 }}>
                Chưa có nhân vật. Vào game để tạo nhân vật mới.
              </p>
            )}
            <div className="we-dash-toolbar-actions">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="we-btn"
                style={{ padding: '8px 14px' }}
              >
                Đổi mật khẩu
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="we-btn"
                style={{ padding: '8px 14px', borderColor: '#cc0000', color: '#cc0000' }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="we-dash-grid we-dash-grid--2">
        <div className="we-box">
          <div className="we-box-head">Thông tin tài khoản</div>
          <div className="we-box-body">
            <DashRow
              label="Tên đăng nhập"
              value={formatAccountName(
                user?.memb___id || dashboardData?.account?.id || '—'
              )}
              valueClass="we-dash-value--accent"
            />
            <DashRow
              label="Số nhân vật"
              value={dashboardData?.account?.characterCount ?? characters.length ?? 0}
            />
            <div className="we-dash-row">
              <span className="we-dash-label">Loại tài khoản</span>
              <span
                className="we-dash-badge"
                style={{ backgroundColor: dashboardData?.account?.levelColor || '#ccc' }}
              >
                {formatText(dashboardData?.account?.levelName || 'Thường')}
              </span>
            </div>
            {dashboardData?.account?.expireDate && (
              <DashRow
                label="Hết hạn"
                value={new Date(dashboardData.account.expireDate).toLocaleDateString(
                  'vi-VN'
                )}
                valueClass={
                  dashboardData.account.isExpired
                    ? 'we-dash-value--bad'
                    : 'we-dash-value--ok'
                }
              />
            )}
            <DashRow
              label="Trạng thái"
              value={dashboardData?.character?.isOnline ? 'Đang online' : 'Ngoại tuyến'}
              valueClass={
                dashboardData?.character?.isOnline
                  ? 'we-dash-value--ok'
                  : 'we-dash-value--bad'
              }
            />
          </div>
        </div>

        <div className="we-box">
          <div className="we-box-head">Nhân vật</div>
          <div className="we-box-body">
            <DashRow label="Tên nhân vật" value={formatAccountName(charName)} />
            <DashRow
              label="Lớp nhân vật"
              value={
                <span className="we-dash-class">
                  <ClassIcon
                    classId={charClass}
                    size={22}
                    className="we-class-icon--inline"
                  />
                  {formatText(charClassName)}
                </span>
              }
            />
            <DashRow label="Cấp độ" value={charLevel} valueClass="we-dash-value--ok" />
            <DashRow
              label="Reset"
              value={resetCount}
              valueClass="we-dash-value--accent"
            />
            <DashRow label="Master Reset" value={masterReset} />
            <DashRow
              label="Zen nhân vật"
              value={`${formatMoney(charMoney)} Zen`}
              valueClass="we-dash-value--ok"
            />
            <DashRow
              label="Zen kho"
              value={`${formatMoney(dashboardData?.warehouse?.money ?? 0)} Zen`}
              valueClass="we-dash-value--ok"
            />
          </div>
        </div>
      </div>

      {dashboardData?.guild && (
        <div className="we-box" style={{ marginTop: 12 }}>
          <div className="we-box-head">Bang hội</div>
          <div className="we-box-body">
            <div className="we-dash-grid we-dash-grid--2">
              <DashRow label="Tên bang" value={dashboardData.guild.name} />
              <DashRow label="Chủ bang" value={dashboardData.guild.master} />
              <DashRow
                label="Điểm"
                value={formatMoney(dashboardData.guild.score)}
                valueClass="we-dash-value--accent"
              />
              <DashRow label="Thành viên" value={dashboardData.guild.memberCount} />
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="we-dash-modal-backdrop">
          <div className="we-dash-modal">
            <h3>Đổi mật khẩu</h3>
            <div className="space-y-3">
              <div>
                <label
                  className="we-dash-label"
                  style={{ display: 'block', marginBottom: 6 }}
                >
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className={inputModern}
                  style={{ marginBottom: 0 }}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label
                  className="we-dash-label"
                  style={{ display: 'block', marginBottom: 6 }}
                >
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className={inputModern}
                  style={{ marginBottom: 0 }}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label
                  className="we-dash-label"
                  style={{ display: 'block', marginBottom: 6 }}
                >
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={inputModern}
                  style={{ marginBottom: 0 }}
                  autoComplete="new-password"
                />
              </div>
              <div className="we-dash-modal-actions">
                <button
                  type="button"
                  disabled={updateLoading}
                  className={btnPrimaryClass}
                  style={{ flex: 1 }}
                  onClick={() => {
                    const currentPassword = (
                      document.getElementById('currentPassword') as HTMLInputElement
                    )?.value;
                    const newPassword = (
                      document.getElementById('newPassword') as HTMLInputElement
                    )?.value;
                    const confirmPassword = (
                      document.getElementById('confirmPassword') as HTMLInputElement
                    )?.value;
                    if (!currentPassword || !newPassword) {
                      alert('Vui lòng nhập đầy đủ mật khẩu.');
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      alert('Mật khẩu xác nhận không khớp!');
                      return;
                    }
                    if (newPassword.length < 6) {
                      alert('Mật khẩu mới ít nhất 6 ký tự.');
                      return;
                    }
                    handleChangePassword({ currentPassword, newPassword });
                  }}
                >
                  {updateLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="we-btn"
                  style={{ flex: 1 }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SubPageLayout>
  );
}
