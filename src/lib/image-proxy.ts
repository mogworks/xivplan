// src/lib/image-proxy.ts
const PROXY_DOMAIN = 'proxy.xivstrat.cn';

export function getProxiedImageUrl(originalUrl: string): string {
    if (!originalUrl) return '';

    // 如果已经是代理地址，直接返回
    if (originalUrl.includes('xivstrat.cn')) {
        return originalUrl;
    }

    // 如果是本地链接，直接返回
    if (originalUrl.startsWith('/')) {
        return originalUrl;
    }

    // 返回代理地址（使用自定义域名）
    return `https://${PROXY_DOMAIN}/?url=${encodeURIComponent(originalUrl)}`;
}
