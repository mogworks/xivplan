import { localization } from 'better-auth-localization';
import { usernameClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_SERVER_URL,
    plugins: [
        usernameClient(),
        localization({
            defaultLocale: 'zh-Hans',
            fallbackLocale: 'default',
        }),
    ],
});
