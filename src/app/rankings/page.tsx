'use client';

import React, { useEffect, useMemo, useState } from 'react';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import RankingTable from '@/components/RankingTable';
import GuildRankingTable from '@/components/GuildRankingTable';
import CharacterSearchResults from '@/components/CharacterSearchResults';
import siteConfigStatic from '@/config/site.config.json';
import { getSiteConfig } from '@/lib/config-api';
import {
  chunkRankingTabs,
  getVisibleRankingTabs,
  type RankingTab,
  type RankingTabConfig,
  type RankingTabId,
} from '@/lib/rankings-config';
import { rankingTexts, useI18n } from '@/lib/i18n';

function readStaticRankingTabs(): RankingTabConfig[] | null {
  const raw = siteConfigStatic as { rankings?: { tabs?: RankingTabConfig[] } };
  return raw.rankings?.tabs ?? null;
}

export default function RankingsPage() {
  const { lang, t } = useI18n();
  const [visibleTabs, setVisibleTabs] = useState<RankingTab[]>(() =>
    getVisibleRankingTabs(readStaticRankingTabs())
  );
  const [activeTab, setActiveTab] = useState<RankingTabId>(
    () => getVisibleRankingTabs(readStaticRankingTabs())[0]?.id ?? 'level'
  );
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getSiteConfig().then((c) => {
      const tabs = getVisibleRankingTabs(c?.rankings?.tabs ?? readStaticRankingTabs());
      setVisibleTabs(tabs);
      setActiveTab((prev) => (tabs.some((t) => t.id === prev) ? prev : tabs[0]?.id ?? 'level'));
    });
  }, []);

  const tabRows = useMemo(() => chunkRankingTabs(visibleTabs), [visibleTabs]);
  const currentTab = visibleTabs.find((tab) => tab.id === activeTab) ?? visibleTabs[0];
  const currentText = currentTab
    ? rankingTexts(currentTab.id, lang, currentTab.label, currentTab.scoreLabel)
    : null;
  const current = currentTab && currentText
    ? { ...currentTab, label: currentText.label, scoreLabel: currentText.score }
    : undefined;
  const isSearching = searchQuery.trim().length > 0;

  const commitSearch = () => {
    const q = searchInput.trim();
    if (!q) return;
    setSearchQuery(q);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  return (
    <div className="we-page">
      <SubPageLayout
        breadcrumbs={[{ label: t('rank.crumb') }]}
        title={t('rank.title')}
        showSidebar={false}
      >
        <div className="we-box">
          <div className="we-box-body we-rank-page">
            <div className="we-rank-search-wrap">
              <div className="we-rank-search-row">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitSearch();
                    }
                  }}
                  placeholder={t('rank.searchPh')}
                  className="we-rank-search"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="button" className="we-btn we-rank-search-btn" onClick={commitSearch}>
                  {t('rank.search')}
                </button>
                {isSearching && (
                  <button type="button" className="we-btn we-rank-search-clear" onClick={clearSearch}>
                    {t('rank.clear')}
                  </button>
                )}
              </div>
            </div>

            {isSearching ? (
              <CharacterSearchResults query={searchQuery} onClear={clearSearch} />
            ) : (
              <>
                {visibleTabs.length === 0 ? (
                  <p className="we-rank-hint we-rank-hint--warn">{t('rank.emptyOn')}</p>
                ) : (
                  <>
                    <div className="we-rank-tabs">
                      {tabRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="we-rank-tabs-row">
                          {row.map((tab) => {
                            const text = rankingTexts(tab.id, lang, tab.label, tab.scoreLabel);
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                className={`we-rank-tab${activeTab === tab.id ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                              >
                                {text.label}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {current?.type === 'guild' ? (
                      <GuildRankingTable
                        key={current.id}
                        title={current.label}
                        endpoint="guild"
                        embedded
                      />
                    ) : current ? (
                      <RankingTable
                        key={current.id}
                        title={current.label}
                        endpoint={current.id}
                        scoreLabel={current.scoreLabel}
                        embedded
                      />
                    ) : null}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </SubPageLayout>
      <Footer />
    </div>
  );
}
