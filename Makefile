.PHONY: help dev build test typecheck clean install update

# Default target
help: ## Show this help message
	@echo "LotoHub - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# =============================================================================
# Development
# =============================================================================

dev: ## Start Vite dev server
	npm run dev

dev-host: ## Start dev server accessible from network
	npm run dev -- --host

preview: ## Preview production build
	npm run build && npm run preview

# =============================================================================
# Build & Type Check
# =============================================================================

build: ## Build production bundle (typecheck + vite build)
	npm run build

typecheck: ## Run TypeScript type checking
	npm run typecheck

install: ## Install dependencies
	npm install

update: ## Update dependencies
	npm update

# =============================================================================
# Testing
# =============================================================================

test: ## Run test suite
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage
	npx vitest run --coverage

# =============================================================================
# Seed Management
# =============================================================================

seed-megasena: ## Fetch/update Mega-Sena seed data
	node scripts/fetch-seed.mjs --loteria megasena

seed-lotofacil: ## Fetch/update Lotofácil seed data
	node scripts/fetch-seed.mjs --loteria lotofacil

seed-all: ## Fetch/update all lottery seed data
	node scripts/fetch-seed.mjs --loteria all

seed-status: ## Show seed file status
	@echo "=== Mega-Sena Seed ==="
	@ls -lh src/data/megasena-seed.json 2>/dev/null || echo "File not found"
	@echo ""
	@echo "=== Lotofácil Seed ==="
	@ls -lh src/data/lotofacil-seed.json 2>/dev/null || echo "File not found"

# =============================================================================
# Android (Capacitor)
# =============================================================================

android-sync: ## Build and sync to Android project
	npm run cap:sync

android-open: ## Open Android project in Android Studio
	npm run cap:open

android-build-debug: ## Build debug APK
	npm run cap:build:debug

android-build-release: ## Build release APK
	npm run cap:build:release

android-install-debug: ## Build and install debug APK on connected device
	npm run cap:build:debug && adb install -r android/app/build/outputs/apk/debug/app-debug.apk

android-clean: ## Clean Android build artifacts
	cd android && ./gradlew clean

# =============================================================================
# Browser Verification
# =============================================================================

verify: ## Run browser verification (requires dev server running)
	node scripts/verify-browser.mjs

mobile-preview: ## Run mobile preview (requires dev server running)
	node scripts/mobile-preview.mjs

# =============================================================================
# Code Quality
# =============================================================================

lint: ## Run linter (if configured)
	@echo "No linter configured. Add ESLint to package.json scripts."

format: ## Format code (if configured)
	@echo "No formatter configured. Add Prettier to package.json scripts."

# =============================================================================
# Cleanup
# =============================================================================

clean: ## Clean build artifacts
	rm -rf dist
	rm -rf android/app/build
	rm -rf .omc

clean-all: ## Clean everything including node_modules
	rm -rf node_modules
	rm -rf dist
	rm -rf android/app/build
	rm -rf .omc
	rm -f package-lock.json

# =============================================================================
# Database & Cache
# =============================================================================

cache-clear: ## Clear IndexedDB cache instructions
	@echo "To clear IndexedDB cache:"
	@echo "1. Open browser DevTools (F12)"
	@echo "2. Go to Application tab"
	@echo "3. Select IndexedDB"
	@echo "4. Delete 'lotohub' database"

# =============================================================================
# Git
# =============================================================================

git-status: ## Show git status
	git status

git-log: ## Show recent commits
	git log --oneline -10

# =============================================================================
# Quick Commands
# =============================================================================

start: install dev ## Install dependencies and start dev server

full-test: typecheck test build ## Run full test suite (typecheck + test + build)

release: clean build android-sync android-build-release ## Full release build

debug: clean build android-sync android-install-debug ## Full debug build and install
