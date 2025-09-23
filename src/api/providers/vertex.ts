import { type ModelInfo, type VertexModelId, vertexDefaultModelId, vertexModels } from "@roo-code/types"

import type { ApiHandlerOptions } from "../../shared/api"

import { getModelParams } from "../transform/model-params"

import { GeminiHandler } from "./gemini"
import { SingleCompletionHandler } from "../index"
import { mergeModelInfo } from "./utils/modelInfo"

export class VertexHandler extends GeminiHandler implements SingleCompletionHandler {
	constructor(options: ApiHandlerOptions) {
		super({ ...options, isVertex: true })
	}

	override getModel() {
		const modelId = this.options.apiModelId
		let id = modelId && modelId in vertexModels ? (modelId as VertexModelId) : vertexDefaultModelId
		const defaultInfo: ModelInfo = vertexModels[id]

		// Merge with custom model info from settings
		const customInfo = this.options.vertexCustomModelInfo
		const info = mergeModelInfo(defaultInfo, customInfo)

		// Debug logging to verify custom model info is being applied
		if (customInfo) {
			console.log(`[VertexHandler] Custom model info detected:`, customInfo)
			console.log(`[VertexHandler] Default context window: ${defaultInfo.contextWindow}`)
			console.log(`[VertexHandler] Custom context window: ${customInfo.contextWindow}`)
			console.log(`[VertexHandler] Final merged context window: ${info.contextWindow}`)
		}

		const params = getModelParams({ format: "gemini", modelId: id, model: info, settings: this.options })

		// The `:thinking` suffix indicates that the model is a "Hybrid"
		// reasoning model and that reasoning is required to be enabled.
		// The actual model ID honored by Gemini's API does not have this
		// suffix.
		return { id: id.endsWith(":thinking") ? id.replace(":thinking", "") : id, info, ...params }
	}
}
