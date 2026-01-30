import { localization } from 'better-auth-localization';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_SERVER_URL,
    plugins: [
        localization({
            defaultLocale: 'zh-Hans',
            fallbackLocale: 'default',
        }),
    ],
});
