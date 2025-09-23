import React, { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import { type ProviderSettings, type ModelInfo, openAiModelInfoSaneDefaults } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"

type ModelCapabilitySettingsProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
	modelInfoKey: string
	defaultModelInfo?: ModelInfo
}

export const ModelCapabilitySettings = ({
	apiConfiguration,
	setApiConfigurationField,
	modelInfoKey,
	defaultModelInfo = openAiModelInfoSaneDefaults,
}: ModelCapabilitySettingsProps) => {
	const { t } = useAppTranslation()

	const customModelInfo = (apiConfiguration[modelInfoKey as keyof ProviderSettings] as Partial<ModelInfo>) || {}
	const currentModelInfo = { ...defaultModelInfo, ...customModelInfo }

	const handleInputChange = useCallback(
		(field: keyof ModelInfo) => (e: Event | React.FormEvent<HTMLElement>) => {
			const target = e.target as HTMLInputElement
			const value = target.value

			if (field === "maxTokens" || field === "contextWindow") {
				const parsed = parseInt(value)
				// Only store the fields we're actually customizing to avoid validation issues
				const updatedModelInfo: Partial<ModelInfo> = {
					...customModelInfo,
					[field]: isNaN(parsed) ? undefined : parsed,
				}

				// Remove any fields that are undefined or match defaults to keep the object clean
				Object.keys(updatedModelInfo).forEach(key => {
					const typedKey = key as keyof ModelInfo
					if (updatedModelInfo[typedKey] === undefined || updatedModelInfo[typedKey] === defaultModelInfo[typedKey]) {
						delete updatedModelInfo[typedKey]
					}
				})

				setApiConfigurationField(modelInfoKey as keyof ProviderSettings, Object.keys(updatedModelInfo).length > 0 ? updatedModelInfo : null)
			}
		},
		[customModelInfo, setApiConfigurationField, modelInfoKey, defaultModelInfo],
	)

	return (
		<div className="flex flex-col gap-3">
			<div className="text-sm text-vscode-descriptionForeground whitespace-pre-line">
				{t("settings:providers.customModel.capabilities")}
			</div>

			<div>
				<VSCodeTextField
					value={currentModelInfo?.maxTokens?.toString() || defaultModelInfo.maxTokens?.toString() || ""}
					type="text"
					style={{
						borderColor: (() => {
							const value = currentModelInfo?.maxTokens

							if (!value) {
								return "var(--vscode-input-border)"
							}

							return value > 0 ? "var(--vscode-charts-green)" : "var(--vscode-errorForeground)"
						})(),
					}}
					onInput={handleInputChange("maxTokens")}
					placeholder={t("settings:placeholders.numbers.maxTokens")}
					className="w-full">
					<label className="block font-medium mb-1">
						{t("settings:providers.customModel.maxTokens.label")}
					</label>
				</VSCodeTextField>
				<div className="text-sm text-vscode-descriptionForeground">
					{t("settings:providers.customModel.maxTokens.description")}
				</div>
			</div>

			<div>
				<VSCodeTextField
					value={
						currentModelInfo?.contextWindow?.toString() || defaultModelInfo.contextWindow?.toString() || ""
					}
					type="text"
					style={{
						borderColor: (() => {
							const value = currentModelInfo?.contextWindow

							if (!value) {
								return "var(--vscode-input-border)"
							}

							return value > 0 ? "var(--vscode-charts-green)" : "var(--vscode-errorForeground)"
						})(),
					}}
					onInput={handleInputChange("contextWindow")}
					placeholder={t("settings:placeholders.numbers.contextWindow")}
					className="w-full">
					<label className="block font-medium mb-1">
						{t("settings:providers.customModel.contextWindow.label")}
					</label>
				</VSCodeTextField>
				<div className="text-sm text-vscode-descriptionForeground">
					{t("settings:providers.customModel.contextWindow.description")}
				</div>
			</div>
		</div>
	)
}
