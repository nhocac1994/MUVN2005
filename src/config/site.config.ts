// Site Configuration - Thay đổi thông tin tại đây mà không cần sửa mã nguồn
export const siteConfig = {
  // Thông tin game
  nameGame: "MUVIETNAM2005.COM",
  gameTitle: "Mu Online 99B",
  gameSubtitle: "MU cổ, đúng chất hoài niệm",
  
  // Thông tin server
  serverName: "MUVIETNAM2005.COM",
  serverVersion: "99B",
  serverIP: "127.0.0.1",
  serverPort: "55900",
  
  // Links mạng xã hội
  linkFacebook: "https://facebook.com/MUVIETNAM2005.COM",
  linkDiscord: "https://discord.gg/MUVIETNAM2005.COM",
  linkYoutube: "https://youtube.com/@MUVIETNAM2005.COM",
  linkZalo: "https://zalo.me/MUVIETNAM2005.COM",
  linkTikTok: "https://www.tiktok.com/@MUVIETNAM2005.COM",
  
  // Thông tin liên hệ
  email: "support@muvietnam2005.com",
  phone: "0123456789",
  address: "Việt Nam",
  
  // Thông tin website
  websiteUrl: "https://muvietnam2005.com",
  websiteName: "MUVIETNAM2005.COM",
  
  // Thông tin game settings
  expRate: "100%",
  dropRate: "5%",
  serverStandard: "Không hạ cấp",
  resetLevel: 400,
  maxReset: 999,
  
  // Thông tin events
  eventStartDate: "2025-10-10",
  eventStartTime: "13:00",
  
  // SEO & Meta — cụm người chơi hay gõ khi tìm server
  metaDescription:
    "MUVIETNAM2005.COM — MU 99b cổ, đúng chất hoài niệm. EXP 100%, drop 5%, reset tối đa 30 lần/tuần, 2 acc/1 PC. Không phải Season 1.",
  metaKeywords: [
    "mu 99b",
    "mu 99b cổ",
    "mu cổ",
    "mu co",
    "mu hoài niệm",
    "mu hoai niem",
    "mu classic",
    "mu 99",
    "mu việt nam",
    "mu viet nam",
    "mu việt nam 99b",
    "mu hà nội 99b",
    "mu ha noi 99b",
    "mu online",
    "mu online 99b",
    "mu online cổ",
    "mu nhẹ",
    "mu pc",
    "chơi mu online",
    "tải mu online",
    "tai mu online",
    "web mu",
    "đăng ký mu",
    "mu miễn phí",
    "mu pvp",
    "mu reset",
    "mu huyền thoại",
    "game mu",
    "game mu online",
    "mu 2005",
    "muvietnam",
    "muvietnam2005",
    "muvietnam2005.com",
    "MUVIETNAM2005.COM",
  ],
  
  // Images
  logoImage: "/NAME.PNG",
  bannerImage: "/MUHANOI1.PNG",
  favicon: "/favicon.ico",
  
  // Colors theme
  primaryColor: "#FFD700",
  secondaryColor: "#FFA500",
  accentColor: "#FF0000",
  
  // Features
  features: {
    pvp: true,
    guild: true,
    events: true,
    reset: true,
    chaosMix: true
  }
};

// Export type for TypeScript
export type SiteConfig = typeof siteConfig;

