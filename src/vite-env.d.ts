/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_SITE_URL: string;
    readonly VITE_SERVER_URL: string;
    readonly VITE_COS_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
