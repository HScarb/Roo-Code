import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeButtonLink } from "@src/components/common/VSCodeButtonLink"
import { useSelectedModel } from "@src/components/ui/hooks/useSelectedModel"

import { inputEventTransform } from "../transforms"
import { ModelCapabilitySettings } from "../ModelCapabilitySettings"

type CerebrasProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const Cerebras = ({ apiConfiguration, setApiConfigurationField }: CerebrasProps) => {
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
				value={apiConfiguration?.cerebrasApiKey || ""}
				type="password"
				onInput={handleInputChange("cerebrasApiKey")}
				placeholder={t("settings:placeholders.apiKey")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.cerebrasApiKey")}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.apiKeyStorageNotice")}
			</div>
			{!apiConfiguration?.cerebrasApiKey && (
				<VSCodeButtonLink href="https://cloud.cerebras.ai?utm_source=roocode" appearance="secondary">
					{t("settings:providers.getCerebrasApiKey")}
				</VSCodeButtonLink>
			)}
			<ModelCapabilitySettings
				apiConfiguration={apiConfiguration}
				setApiConfigurationField={setApiConfigurationField}
				modelInfoKey="cerebrasCustomModelInfo"
				defaultModelInfo={selectedModel.info}
			/>
		</>
	)
}
