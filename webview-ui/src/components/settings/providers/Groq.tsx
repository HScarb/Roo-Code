import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import { type ProviderSettings, groqDefaultModelInfo } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeButtonLink } from "@src/components/common/VSCodeButtonLink"

import { inputEventTransform } from "../transforms"
import { ContextWindowInput } from "../../common/ContextWindow"

type GroqProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const Groq = ({ apiConfiguration, setApiConfigurationField }: GroqProps) => {
	const { t } = useAppTranslation()

	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	return (
		<>
			<VSCodeTextField
				value={apiConfiguration?.groqApiKey || ""}
				type="password"
				onInput={handleInputChange("groqApiKey")}
				placeholder={t("settings:placeholders.apiKey")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.groqApiKey")}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.apiKeyStorageNotice")}
			</div>
			{!apiConfiguration?.groqApiKey && (
				<VSCodeButtonLink href="https://console.groq.com/keys" appearance="secondary">
					{t("settings:providers.getGroqApiKey")}
				</VSCodeButtonLink>
			)}
			<ContextWindowInput
				modelInfo={apiConfiguration?.CustomModelInfo || undefined}
				defaultModelInfo={groqDefaultModelInfo}
				onUpdate={(updatedInfo) => {
					setApiConfigurationField("CustomModelInfo", updatedInfo)
				}}
				label={t("settings:providers.customModel.contextWindow.label")}
				description={t("settings:providers.customModel.contextWindow.description")}
				placeholder={t("settings:placeholders.numbers.contextWindow")}
			/>
		</>
	)
}
