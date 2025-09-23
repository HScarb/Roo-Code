import { Anthropic } from "@anthropic-ai/sdk"

import { rooDefaultModelId, rooModels, type RooModelId } from "@roo-code/types"
import { CloudService } from "@roo-code/cloud"

import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"

import type { ApiHandlerCreateMessageMetadata } from "../index"
import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"
import { mergeModelInfo } from "./utils/modelInfo"

export class RooHandler extends BaseOpenAiCompatibleProvider<RooModelId> {
	constructor(options: ApiHandlerOptions) {
		// Get the session token if available, but don't throw if not.
		// The server will handle authentication errors and return appropriate status codes.
		let sessionToken = ""

		if (CloudService.hasInstance()) {
			sessionToken = CloudService.instance.authService?.getSessionToken() || ""
		}

		// Always construct the handler, even without a valid token.
		// The provider-proxy server will return 401 if authentication fails.
		super({
			...options,
			providerName: "Roo Code Cloud",
			baseURL: process.env.ROO_CODE_PROVIDER_URL ?? "https://api.roocode.com/proxy/v1",
			apiKey: sessionToken || "unauthenticated", // Use a placeholder if no token
			defaultProviderModelId: rooDefaultModelId,
			providerModels: rooModels,
			defaultTemperature: 0.7,
		})
	}

	protected getCustomModelInfo() {
		return this.options.rooCustomModelInfo
	}

	override async *createMessage(
		systemPrompt: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream {
		const stream = await this.createStream(
			systemPrompt,
			messages,
			metadata,
			metadata?.taskId ? { headers: { "X-Roo-Task-ID": metadata.taskId } } : undefined,
		)

		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta

			if (delta) {
				if (delta.content) {
					yield {
						type: "text",
						text: delta.content,
					}
				}

				if ("reasoning_content" in delta && typeof delta.reasoning_content === "string") {
					yield {
						type: "reasoning",
						text: delta.reasoning_content,
					}
				}
			}

			if (chunk.usage) {
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
				}
			}
		}
	}

	override getModel() {
		const modelId = this.options.apiModelId || rooDefaultModelId
		const defaultModelInfo = this.providerModels[modelId as RooModelId] ?? this.providerModels[rooDefaultModelId]

		if (defaultModelInfo) {
			const customInfo = this.getCustomModelInfo()
			const info = mergeModelInfo(defaultModelInfo, customInfo)
			return { id: modelId as RooModelId, info }
		}

		// Return the requested model ID even if not found, with fallback info.
		const fallbackInfo = {
			maxTokens: 16_384,
			contextWindow: 262_144,
			supportsImages: false,
			supportsPromptCache: true,
			inputPrice: 0,
			outputPrice: 0,
		}

		const customInfo = this.getCustomModelInfo()
		const info = mergeModelInfo(fallbackInfo, customInfo)

		return {
			id: modelId as RooModelId,
			info,
		}
	}
}
