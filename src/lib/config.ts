import { siteConfig } from '@/config/site.config';

/**
 * Get site configuration
 * Có thể mở rộng để load từ API hoặc database trong tương lai
 */
export function getSiteConfig() {
  return siteConfig;
}

/**
 * Get specific config value
 */
export function getConfig<T extends keyof typeof siteConfig>(key: T): typeof siteConfig[T] {
  return siteConfig[key];
}

/**
 * Update config (for future admin panel)
 * Có thể mở rộng để lưu vào database
 */
export async function updateSiteConfig(updates: Partial<typeof siteConfig>) {
  // TODO: Implement API call to update config in database
  // For now, this is just a placeholder
  console.log('Config update requested:', updates);
  return { success: true };
}

