# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Roo Code is a VSCode extension that provides AI-powered development assistance. The project is structured as a monorepo with multiple packages and uses TurboRepo for build orchestration, TypeScript, and React for the webview UI.

## Common Development Commands

### Building and Development
- `pnpm install` - Install dependencies for all packages
- `pnpm build` - Build all packages using TurboRepo
- `pnpm bundle` - Bundle the extension for distribution
- `pnpm lint` - Run ESLint across all packages
- `pnpm check-types` - Run TypeScript type checking
- `pnpm test` - Run tests across all packages
- `pnpm format` - Format code with Prettier

### Development Mode
- **F5** in VSCode - Launch extension in development mode (recommended for active development)
- `pnpm install:vsix` - Build and install extension as VSIX package
- `pnpm watch` (in VSCode task) - Start all watchers (webview, bundle, TypeScript)

### Package-specific Development
- Extension bundle: `cd src && pnpm bundle --watch`
- Webview UI: `cd webview-ui && pnpm dev`
- TypeScript watching: `pnpm watch:tsc`

### Testing
- Run extension tests: `cd src && pnpm test`
- Run webview tests: `cd webview-ui && pnpm test`
- Run integration tests: `cd apps/vscode-e2e && pnpm test`

### Distribution
- `pnpm vsix` - Create VSIX package in `bin/` directory
- `pnpm clean` - Clean all build artifacts

## Architecture Overview

### Monorepo Structure
- **`src/`** - Main VSCode extension code (TypeScript)
  - `extension.ts` - Extension entry point
  - `core/` - Core functionality modules (assistant messages, context, tools, etc.)
  - `api/` - AI provider integrations
  - `webview-ui/` - Built webview assets (copied from webview-ui/)
- **`webview-ui/`** - React-based webview interface
  - Uses Vite for building, React 18, TailwindCSS v4, Radix UI components
  - Built assets are copied to `src/webview-ui/`
- **`packages/`** - Shared packages
  - `types/` - Shared TypeScript types
  - `ipc/` - Inter-process communication types
  - `cloud/` - Cloud service integration
  - `telemetry/` - Analytics and telemetry
- **`apps/`** - Application variants
  - `vscode-e2e/` - End-to-end tests
  - `web-roo-code/` - Web version
  - `vscode-nightly/` - Nightly build configuration

### Key Technologies
- **TurboRepo** - Monorepo build system
- **TypeScript** - Primary language (Node 20.19.2)
- **React 18** - Webview UI framework
- **TailwindCSS v4** - Styling (utility-first approach)
- **Radix UI** - UI component library
- **Vite** - Frontend build tool
- **Vitest** - Testing framework
- **ESBuild** - Extension bundling

### Extension Architecture
The VSCode extension follows a provider-based architecture:
- **Core modules**: Task management, context tracking, AI assistant messaging, tool execution
- **API layer**: Multiple AI provider integrations (Anthropic, OpenAI, etc.)
- **Webview communication**: IPC-based messaging between extension and React UI
- **Tool system**: Extensible tool framework for file operations, terminal commands, etc.

## Development Patterns

### File Structure Conventions
- TypeScript configurations extend from `@roo-code/config-typescript`
- ESLint configurations extend from `@roo-code/config-eslint`
- Import aliases: `@roo` (maps to `/src`) and `@src` (maps to `/webview-ui/src`)

### UI Development
- Use Radix UI components over VSCode built-in components
- Implement responsive designs with TailwindCSS utility classes
- Follow i18n patterns for all user-facing text
- Use `data-testid` attributes for testing

### Testing Strategy
- Unit tests with Vitest in each package
- Integration tests in `apps/vscode-e2e/`
- Mocked VSCode API in `__mocks__/vscode.js`
- Test isolation with proper setup/teardown

### Custom Modes System
The project uses a sophisticated custom modes system defined in `.roomodes`:
- Multiple specialized modes for different development tasks (test, design-engineer, translate, etc.)
- XML-based special instructions for complex mode behaviors
- Mode-specific file access permissions and tool groups

## Code Quality Standards

### TypeScript
- Strict type checking enabled
- Use proper typing for VSCode API interactions
- Leverage shared types from `@roo-code/types` package

### Styling
- TailwindCSS v4 utility classes preferred
- Avoid hardcoded styles, use design system tokens
- Ensure responsive design principles

### Internationalization
- All user-facing text must use i18n functions
- Support for 15+ languages via JSON translation files
- Never leave placeholder strings in markup

## VSCode Extension Specifics

### Development Environment
- Use VSCode's built-in debugging (F5) for extension development
- Extension loads from `src/dist/extension.js`
- Webview assets served from `src/webview-ui/`

### Extension Configuration
- Package manifest: `src/package.json`
- Commands, menus, and keybindings defined in contributes section
- Settings configured under `roo-cline` namespace

### Build Process
- Extension bundled with ESBuild for performance
- Webview built separately with Vite and copied to extension
- TurboRepo orchestrates the build pipeline across packages