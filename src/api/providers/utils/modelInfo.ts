import type { ModelInfo } from "@roo-code/types"

/**
 * Merges default ModelInfo with custom user settings.
 *
 * @param defaultInfo - The default ModelInfo from the provider's model registry
 * @param customInfo - Optional custom ModelInfo from user settings
 * @returns A new ModelInfo object with custom values overriding defaults where provided
 */
export function mergeModelInfo<T extends ModelInfo>(defaultInfo: T, customInfo?: Partial<ModelInfo> | null): T {
	if (!customInfo) {
		return defaultInfo
	}

	// Create a new object by spreading defaults and then custom info
	const merged: T = {
		...defaultInfo,
		...customInfo,
	}

	// Special handling for certain fields to ensure proper overrides
	// Only override if the custom value is actually provided (not null/undefined)
	if (customInfo.maxTokens !== undefined && customInfo.maxTokens !== null) {
		merged.maxTokens = customInfo.maxTokens
	}

	if (customInfo.contextWindow !== undefined && customInfo.contextWindow !== null) {
		merged.contextWindow = customInfo.contextWindow
	}

	if (customInfo.inputPrice !== undefined && customInfo.inputPrice !== null) {
		merged.inputPrice = customInfo.inputPrice
	}

	if (customInfo.outputPrice !== undefined && customInfo.outputPrice !== null) {
		merged.outputPrice = customInfo.outputPrice
	}

	if (customInfo.cacheWritesPrice !== undefined && customInfo.cacheWritesPrice !== null) {
		merged.cacheWritesPrice = customInfo.cacheWritesPrice
	}

	if (customInfo.cacheReadsPrice !== undefined && customInfo.cacheReadsPrice !== null) {
		merged.cacheReadsPrice = customInfo.cacheReadsPrice
	}

	// Boolean fields - only override if explicitly set
	if (customInfo.supportsImages !== undefined) {
		merged.supportsImages = customInfo.supportsImages
	}

	if (customInfo.supportsComputerUse !== undefined) {
		merged.supportsComputerUse = customInfo.supportsComputerUse
	}

	if (customInfo.supportsPromptCache !== undefined) {
		merged.supportsPromptCache = customInfo.supportsPromptCache
	}

	return merged
}
