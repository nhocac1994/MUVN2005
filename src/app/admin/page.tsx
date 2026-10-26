'use client';

import React, { useEffect, useState } from 'react';
import SubPageLayout from '@/components/SubPageLayout';
import ConfigEditor from '@/components/admin/ConfigEditor';
import NewsEditor, {
  emptyNewsForm,
  newsFormToPayload,
  newsRowToForm,
  type NewsFormState,
} from '@/components/admin/NewsEditor';
import {
  configToFormState,
  emptyConfigForm,
  formStateToConfig,
  type ConfigFormState,
} from '@/lib/admin-config';
import { cardShell, cardBody, inputModern, btnPrimaryClass, btnPrimaryStyle } from '@/lib/page-theme';

type Tab = 'config' | 'news';

async function adminFetch(path: string, token: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api/admin/${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Lỗi API');
  return data;
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('config');
  const [msg, setMsg] = useState('');
  const [configForm, setConfigForm] = useState<ConfigFormState>(emptyConfigForm());
  const [newsList, setNewsList] = useState<Record<string, unknown>[]>([]);
  const [newsForm, setNewsForm] = useState<NewsFormState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mu_admin_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (tab === 'config') loadConfig();
    else loadNews();
  }, [token, tab]);

  const toast = (text: string, ok = true) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 4000);
    if (!ok) console.error(text);
  };

  const login = async () => {
    try {
      const r = await adminFetch('login', '', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const t = r.data.token as string;
      setToken(t);
      localStorage.setItem('mu_admin_token', t);
      toast('Đăng nhập thành công');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Lỗi đăng nhập', false);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('mu_admin_token');
    setNewsForm(null);
  };

  const loadConfig = async () => {
    try {
      const r = await adminFetch('config', token);
      setConfigForm(configToFormState(r.data));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Lỗi', false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await adminFetch('config', token, {
        method: 'PUT',
        body: JSON.stringify(formStateToConfig(configForm)),
      });
      toast('Đã lưu config');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Lỗi', false);
    } finally {
      setSaving(false);
    }
  };

  const loadNews = async () => {
    try {
      const r = await adminFetch('news', token);
      setNewsList(r.data);
      if (!newsForm && r.data.length > 0) {
        setNewsForm(newsRowToForm(r.data[0]));
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Lỗi', false);
    }
  };

  const saveNews = async () => {
    if (!newsForm?.title) {
      toast('Nhập tiêu đề tin', false);
      return;
    }
    const payload = newsFormToPayload({
      ...newsForm,
      id: newsForm.id || newsForm.slug || `news-${Date.now()}`,
      slug: newsForm.slug || newsForm.id,
    });
    setSaving(true);
    try {
      const exists = newsList.some((n) => n.id === payload.id);
      if (exists) {
        await adminFetch(`news/${encodeURIComponent(String(payload.id))}`, token, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch('news', token, { method: 'POST', body: JSON.stringify(payload) });
      }
      toast('Đã lưu tin');
      await loadNews();
      setNewsForm(newsRowToForm(payload));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Lỗi', false);
    } finally {
      setSaving(false);
    }
  };

  const deleteNews = async () => {
    if (!newsForm?.id || !confirm('Xóa tin này?')) return;
    try {
      await adminFetch(`news/${encodeURIComponent(newsForm.id)}`, token, { method: 'DELETE' });
      toast('Đã xóa');
      setNewsForm(null);
      loadNews();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Lỗi', false);
    }
  };

  return (
    <SubPageLayout
      maxWidth="4xl"
      breadcrumbs={[{ label: 'Admin' }]}
      title="Admin Panel"
      subtitle={`Chỉnh bằng form — không cần sửa JSON. Backend local: http://localhost:3001/admin`}
      centered={false}
    >
        {msg && (
          <p className="mt-4 rounded-lg border border-purple-500/30 bg-purple-950/40 px-3 py-2 text-sm text-purple-200">
            {msg}
          </p>
        )}

        {!token ? (
          <div className={`${cardShell} mt-6 max-w-md ${cardBody}`}>
            <label className="mb-1 block text-xs text-zinc-400">Tài khoản</label>
            <input
              className={`${inputModern} mb-3`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label className="mb-1 block text-xs text-zinc-400">Mật khẩu</label>
            <input
              type="password"
              className={`${inputModern} mb-4`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={login} className={btnPrimaryClass} style={btnPrimaryStyle}>
              Đăng nhập
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTab('config')}
                className={`rounded-lg px-4 py-2 text-sm ${tab === 'config' ? 'bg-purple-600' : 'border border-purple-500/30'}`}
              >
                Cấu hình server
              </button>
              <button
                type="button"
                onClick={() => setTab('news')}
                className={`rounded-lg px-4 py-2 text-sm ${tab === 'news' ? 'bg-purple-600' : 'border border-purple-500/30'}`}
              >
                Tin tức
              </button>
              <button type="button" onClick={logout} className="ml-auto text-sm text-zinc-400 hover:text-white">
                Đăng xuất
              </button>
            </div>

            {tab === 'config' && (
              <div className="mt-6">
                <ConfigEditor form={configForm} onChange={setConfigForm} />
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveConfig}
                    className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                  </button>
                  <button type="button" onClick={loadConfig} className="rounded-lg border border-purple-500/30 px-4 py-2 text-sm">
                    Tải lại
                  </button>
                </div>
              </div>
            )}

            {tab === 'news' && (
              <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
                <div className="rounded-xl border border-purple-500/20 bg-[#120818]/60 p-3">
                  <button
                    type="button"
                    className="mb-3 w-full rounded-lg border border-purple-500/30 py-2 text-xs text-purple-200"
                    onClick={() => setNewsForm(emptyNewsForm())}
                  >
                    + Tin mới
                  </button>
                  <ul className="space-y-1 text-sm">
                    {newsList.map((n) => (
                      <li key={String(n.id)}>
                        <button
                          type="button"
                          className={`w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-purple-950/50 ${
                            newsForm?.id === n.id ? 'bg-purple-900/40 text-purple-100' : 'text-zinc-300'
                          }`}
                          onClick={() => setNewsForm(newsRowToForm(n))}
                        >
                          {String(n.title)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {newsForm ? (
                  <div className="rounded-xl border border-purple-500/20 bg-[#120818]/60 p-4">
                    <NewsEditor form={newsForm} onChange={setNewsForm} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={saveNews}
                        className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold disabled:opacity-50"
                      >
                        {saving ? 'Đang lưu...' : 'Lưu tin'}
                      </button>
                      {newsForm.id && newsList.some((n) => n.id === newsForm.id) && (
                        <button
                          type="button"
                          onClick={deleteNews}
                          className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">Chọn tin hoặc tạo tin mới.</p>
                )}
              </div>
            )}
          </>
        )}
    </SubPageLayout>
  );
}
