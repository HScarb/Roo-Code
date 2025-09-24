import React, { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { type ProviderSettings, claudeCodeModelInfoSaneDefaults } from "@roo-code/types"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { Slider } from "@src/components/ui"
import { inputEventTransform } from "../transforms"

interface ClaudeCodeProps {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const ClaudeCode: React.FC<ClaudeCodeProps> = ({ apiConfiguration, setApiConfigurationField }) => {
	const { t } = useAppTranslation()

	const handleInputChange = (e: Event | React.FormEvent<HTMLElement>) => {
		const element = e.target as HTMLInputElement
		setApiConfigurationField("claudeCodePath", element.value)
	}
	const handleCustomInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	const maxOutputTokens = apiConfiguration?.claudeCodeMaxOutputTokens || 8000

	return (
		<div className="flex flex-col gap-4">
			<div>
				<VSCodeTextField
					value={apiConfiguration?.claudeCodePath || ""}
					style={{ width: "100%", marginTop: 3 }}
					type="text"
					onInput={handleInputChange}
					placeholder={t("settings:providers.claudeCode.placeholder")}>
					{t("settings:providers.claudeCode.pathLabel")}
				</VSCodeTextField>

				<p
					style={{
						fontSize: "12px",
						marginTop: 3,
						color: "var(--vscode-descriptionForeground)",
					}}>
					{t("settings:providers.claudeCode.description")}
				</p>
			</div>

			<div className="flex flex-col gap-1">
				<div className="font-medium">{t("settings:providers.claudeCode.maxTokensLabel")}</div>
				<div className="flex items-center gap-1">
					<Slider
						min={8000}
						max={64000}
						step={1024}
						value={[maxOutputTokens]}
						onValueChange={([value]) => setApiConfigurationField("claudeCodeMaxOutputTokens", value)}
					/>
					<div className="w-16 text-sm text-center">{maxOutputTokens}</div>
				</div>
				<p className="text-sm text-vscode-descriptionForeground mt-1">
					{t("settings:providers.claudeCode.maxTokensDescription")}
				</p>
			</div>
			<div>
				<VSCodeTextField
					value={
						apiConfiguration?.CustomModelInfo?.contextWindow?.toString() ||
						claudeCodeModelInfoSaneDefaults.contextWindow?.toString() ||
						""
					}
					type="text"
					style={{
						borderColor: (() => {
							const value = apiConfiguration?.CustomModelInfo?.contextWindow

							if (!value) {
								return "var(--vscode-input-border)"
							}

							return value > 0 ? "var(--vscode-charts-green)" : "var(--vscode-errorForeground)"
						})(),
					}}
					onInput={handleCustomInputChange("CustomModelInfo", (e) => {
						const value = (e.target as HTMLInputElement).value
						const parsed = parseInt(value)

						return {
							...(apiConfiguration?.CustomModelInfo || claudeCodeModelInfoSaneDefaults),
							contextWindow: isNaN(parsed) ? claudeCodeModelInfoSaneDefaults.contextWindow : parsed,
						}
					})}
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
