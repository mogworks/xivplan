function isXivstratDomain(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        return hostname === 'xivstrat.cn' || hostname.endsWith('.xivstrat.cn');
    } catch {
        return false;
    }
}

export function getProxyImageUrl(originalUrl: string): string {
    if (!originalUrl) return originalUrl;

    if (originalUrl.startsWith('/') || isXivstratDomain(originalUrl) || originalUrl.startsWith('data:')) {
        return originalUrl;
    }

    // 返回代理地址（使用自定义域名）
    return `https://proxy.xivstrat.cn/?url=${encodeURIComponent(originalUrl)}`;
}
