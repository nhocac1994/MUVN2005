import React from 'react';
import Sidebar from '@/components/Sidebar';

type TwoColumnLayoutProps = {
  children: React.ReactNode;
  showSidebar?: boolean;
  /** Phần đầu khối trắng (logo trang chủ) */
  header?: React.ReactNode;
  /** Trang chủ: một khối duy nhất trên nền backrow */
  onBackrow?: boolean;
};

export default function TwoColumnLayout({
  children,
  showSidebar = true,
  header,
  onBackrow = false,
}: TwoColumnLayoutProps) {
  const areaClass = onBackrow ? ' we-content-area--on-backrow' : '';

  return (
    <section className={`we-content-area${areaClass}`}>
      <div className="we-content-panel">
        {header}
        <div className={`we-two-col${showSidebar ? '' : ' we-two-col--full'}`}>
          <div className="we-main-col">{children}</div>
          {showSidebar && <Sidebar />}
        </div>
      </div>
    </section>
  );
}
