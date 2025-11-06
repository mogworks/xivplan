import react from '@vitejs/plugin-react';
import { UserConfig, defineConfig, loadEnv } from 'vite';

import svgr from 'vite-plugin-svgr';

function getModeOptions(mode: string): UserConfig {
    if (mode === 'production') {
        return {};
    }

    return {
        esbuild: {
            minifyIdentifiers: false,
        },
    };
}

function getEnvOptions(mode: string): UserConfig {
    const env = loadEnv(mode, process.cwd());

    if (env.VITE_PROFILE !== '0') {
        return {
            resolve: {
                alias: {
                    'react-dom$': 'react-dom/profiling',
                },
            },
        };
    }

    return {};
}

export default defineConfig(({ mode }) => ({
    ...getModeOptions(mode),
    ...getEnvOptions(mode),
    plugins: [
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        svgr({
            svgrOptions: {
                plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
                svgoConfig: {
                    floatPrecision: 2,
                    plugins: [
                        {
                            name: 'preset-default',
                            params: {
                                overrides: {
                                    removeViewBox: false,
                                },
                            },
                        },
                        'prefixIds',
                    ],
                },
            },
        }),
    ],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                // Group large vendor libraries into separate chunks to improve caching and reduce the size of the initial application chunk.
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
                    fluentui: [
                        '@fluentui/react-components',
                        '@fluentui/react-icons',
                        '@fluentui/react-icons-mdl2',
                        '@fluentui-contrib/react-virtualizer',
                    ],
                    konva: ['konva', 'react-konva', 'react-konva-utils'],
                },
            },
        },
    },
}));
