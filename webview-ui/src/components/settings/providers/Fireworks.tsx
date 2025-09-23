import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeButtonLink } from "@src/components/common/VSCodeButtonLink"
import { useSelectedModel } from "@src/components/ui/hooks/useSelectedModel"

import { inputEventTransform } from "../transforms"
import { ModelCapabilitySettings } from "../ModelCapabilitySettings"

type FireworksProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const Fireworks = ({ apiConfiguration, setApiConfigurationField }: FireworksProps) => {
	const { t } = useAppTranslation()
	const selectedModel = useSelectedModel(apiConfiguration)

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
				value={apiConfiguration?.fireworksApiKey || ""}
				type="password"
				onInput={handleInputChange("fireworksApiKey")}
				placeholder={t("settings:placeholders.apiKey")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.fireworksApiKey")}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.apiKeyStorageNotice")}
			</div>
			{!apiConfiguration?.fireworksApiKey && (
				<VSCodeButtonLink href="https://fireworks.ai/" appearance="secondary">
					{t("settings:providers.getFireworksApiKey")}
				</VSCodeButtonLink>
			)}
			<ModelCapabilitySettings
				apiConfiguration={apiConfiguration}
				setApiConfigurationField={setApiConfigurationField}
				modelInfoKey="fireworksCustomModelInfo"
				defaultModelInfo={selectedModel.info}
			/>
		</>
	)
}
