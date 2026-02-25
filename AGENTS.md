# AGENTS.md

This document provides guidelines for agentic coding assistants working in this repository.

## Project Overview

This is a React 19 + TypeScript Vite application for creating and sharing battle plan boards for FFXIV (Final Fantasy XIV). The app supports Chinese and English localization, features a layered canvas system using Konva, and includes drag-and-drop functionality, undo/redo support, and file import/export capabilities.

## Build & Development Commands

```bash
# Development
pnpm dev                # Start dev server
pnpm build              # Build for production (runs tsc -b && vite build)
pnpm preview            # Preview production build
pnpm test               # Run tests with vitest
pnpm test:ui            # Run tests with vitest UI
pnpm test --run <file>  # Run specific test file
pnpm test --run -t "<name>"  # Run test by name
pnpm lint               # Run ESLint
pnpm prettier:check     # Check formatting
pnpm prettier:format   # Format code
```

## Code Style Guidelines

### General Formatting

- **Indentation**: 4 spaces for `.ts/.tsx` files
- **Line width**: 120 characters
- **Quotes**: Single quotes
- **Trailing commas**: Required in multi-line
- **Semicolons**: Required

### TypeScript

- **Target**: ES2023, **Strict mode**: Enabled
- Additional checks: `noUncheckedIndexedAccess`, `noUnusedLocals`, `noFallthroughCasesInSwitch`

### Imports

Order: React imports → Third-party libraries → Relative imports → Type-only imports

```ts
import React, { useState } from 'react';
import { Field, makeStyles } from '@fluentui/react-components';
import { SpinButton } from './SpinButton';
import type { ColorPickerProps } from './types';
```

### Components

- Use named exports: `export const ComponentName: React.FC<Props> = ...`
- Interface exported alongside: `export interface ComponentNameProps { ... }`
- Avoid `export default`

### Hooks & Context

- Custom hooks: start with `use` prefix (e.g., `useHotkeys.tsx`)
- Context split into `*Context.ts` (type) and `*Provider.tsx` (provider + hook)

### Naming

- **Components/Types**: PascalCase (`ColorPicker`, `Arena`, `Vector2d`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions/Variables**: camelCase (`clamp`, `round`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_ARENA_PADDING`)

### Error Handling

- `throw new Error()` with descriptive messages
- Check `null`/`undefined` with type guards: `export function isNotNull<T>(x: T | null | undefined): x is T { ... }`

### Type Safety

- Use `readonly` for immutable arrays/objects
- Type predicates: `x is T`
- Utility types: `Omit<T, K>`, `Partial<T>`, `Required<T>`
- Avoid `any`/`unknown`

### Styling & i18n

```ts
// Fluent UI styling
const useStyles = makeStyles({ root: { display: 'grid' } });
// i18n (default: Chinese `zh`, fallback: `zh`)
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
```

### Linting Rules

- React prop-types disabled, React Hooks exhaustive-deps enforced, React Refresh enabled

## Key Dependencies

- **React 19** + React Compiler, **Vite** build tool, **Konva** canvas (`Konva.angleDeg = true`)
- **Fluent UI** components, **i18next** i18n, **React Router** routing, **@dnd-kit** drag-drop
- **Vitest** (jsdom, globals)

## Git Hooks

Lefthook auto-formats staged files with Prettier before commit.

## Special Notes

- No test files exist yet - set up Vitest when adding tests
- Custom undo/redo system with context providers
- Independent Konva Stage per step for performance
- SVGs transformed via vite-plugin-svgr
- Image URLs proxied through `src/lib/image-proxy.ts` to avoid CORS
