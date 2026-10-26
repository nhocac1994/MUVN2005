'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SubPageLayout from '@/components/SubPageLayout';
import siteConfigStatic from '@/config/site.config.json';
import { getBankTransferConfig, type BankTransfer } from '@/lib/config-api';
import { cardShell, cardHead, cardBody, accentText, gridGap } from '@/lib/page-theme';

export default function DonatePage() {
  const [bankTransfer, setBankTransfer] = useState<BankTransfer | null>(null);

  useEffect(() => {
    getBankTransferConfig().then(
      (config) => setBankTransfer(config || (siteConfigStatic as { bankTransfer?: BankTransfer }).bankTransfer || null)
    );
  }, []);

  const bank = bankTransfer || (siteConfigStatic as { bankTransfer: BankTransfer }).bankTransfer;

  return (
    <SubPageLayout
      maxWidth="4xl"
      breadcrumbs={[{ label: 'Quyên góp' }]}
      title="Ủng hộ server"
    >
      <div className={`${gridGap} md:grid-cols-2`}>
        <div className={cardShell}>
          <div className={cardHead}>Vip number</div>
          <div className={cardBody}>
            <p className={`text-xl font-bold ${accentText}`}>200.000đ / 30 ngày</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                Tăng 5% tỉ lệ úp đồ / 10-11-12-13
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                Thời hạn 30 ngày
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                Ưu đãi đặc biệt nhận 5 chaos / 30 life
              </li>
            </ul>
          </div>
        </div>

        <div className={cardShell}>
          <div className={cardHead}>Thông tin chuyển khoản</div>
          <div className={cardBody}>
            <div className="flex flex-wrap items-start gap-6">
              <div className="min-w-0 space-y-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-zinc-500">Số tài khoản</span>
                  <p className="text-sm font-medium text-white">{bank?.accountNumber}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-zinc-500">Chủ tài khoản</span>
                  <p className="text-sm font-medium text-white">{bank?.accountHolder}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-zinc-500">Ngân hàng</span>
                  <p className="text-sm font-medium text-white">{bank?.bankName}</p>
                </div>
              </div>
              {bank?.qrCodeUrl && (
                <Image
                  src={bank.qrCodeUrl}
                  alt="QR Code"
                  width={140}
                  height={140}
                  className="h-[140px] w-[140px] rounded-lg border border-purple-500/30 object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={cardShell}>
        <div className={cardHead}>Hướng dẫn donate</div>
        <ol className={`${cardBody} list-inside list-decimal space-y-2 text-sm text-zinc-300`}>
          <li>Chuyển khoản theo thông tin trên</li>
          <li>Ghi nội dung: &quot;Tên Tài Khoản&quot;</li>
          <li>Gửi bill cho Admin qua Zalo</li>
          <li>Chờ Admin xử lý và cấp quyền lợi</li>
        </ol>
      </div>
    </SubPageLayout>
  );
}
