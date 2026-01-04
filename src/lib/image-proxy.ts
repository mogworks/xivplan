// src/lib/image-proxy.ts
const PROXY_DOMAIN = 'https://proxy.xivstrat.cn';

export function getProxiedImageUrl(originalUrl: string): string {
    if (!originalUrl) return '';

    // 如果已经是代理地址，直接返回
    if (originalUrl.includes(PROXY_DOMAIN)) {
        return originalUrl;
    }

    // 如果是本地链接，直接返回
    if (originalUrl.startsWith('/')) {
        return originalUrl;
    }

    // 返回代理地址（使用自定义域名）
    return `${PROXY_DOMAIN}/?url=${encodeURIComponent(originalUrl)}`;
}
