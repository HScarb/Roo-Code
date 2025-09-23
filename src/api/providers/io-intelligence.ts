import { ioIntelligenceDefaultModelId, ioIntelligenceModels, type IOIntelligenceModelId } from "@roo-code/types"

import type { ApiHandlerOptions } from "../../shared/api"
import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"
import { mergeModelInfo } from "./utils/modelInfo"

export class IOIntelligenceHandler extends BaseOpenAiCompatibleProvider<IOIntelligenceModelId> {
	constructor(options: ApiHandlerOptions) {
		if (!options.ioIntelligenceApiKey) {
			throw new Error("IO Intelligence API key is required")
		}

		super({
			...options,
			providerName: "IO Intelligence",
			baseURL: "https://api.intelligence.io.solutions/api/v1",
			defaultProviderModelId: ioIntelligenceDefaultModelId,
			providerModels: ioIntelligenceModels,
			defaultTemperature: 0.7,
			apiKey: options.ioIntelligenceApiKey,
		})
	}

	protected getCustomModelInfo() {
		return this.options.ioIntelligenceCustomModelInfo
	}

	override getModel() {
		const modelId = this.options.ioIntelligenceModelId || (ioIntelligenceDefaultModelId as IOIntelligenceModelId)

		const defaultModelInfo =
			this.providerModels[modelId as IOIntelligenceModelId] ?? this.providerModels[ioIntelligenceDefaultModelId]

		if (defaultModelInfo) {
			const customInfo = this.getCustomModelInfo()
			const info = mergeModelInfo(defaultModelInfo, customInfo)
			return { id: modelId as IOIntelligenceModelId, info }
		}

		// Return the requested model ID even if not found, with fallback info.
		const fallbackInfo = {
			maxTokens: 8192,
			contextWindow: 128000,
			supportsImages: false,
			supportsPromptCache: false,
		}

		const customInfo = this.getCustomModelInfo()
		const info = mergeModelInfo(fallbackInfo, customInfo)

		return {
			id: modelId as IOIntelligenceModelId,
			info,
		}
	}
}
