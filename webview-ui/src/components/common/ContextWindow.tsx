import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { FormEvent } from "react"

export interface AiModelInfo {
	contextWindow: number
	supportsVision?: boolean
}

interface ContextWindowInputProps {
	modelInfo: AiModelInfo | undefined
	defaultModelInfo: AiModelInfo
	onUpdate: (updatedInfo: AiModelInfo) => void
	label: string
	description: string
	placeholder: string
}

export const ContextWindowInput = ({
	modelInfo,
	defaultModelInfo,
	onUpdate,
	label,
	description,
	placeholder,
}: ContextWindowInputProps) => {
	const currentValue = modelInfo?.contextWindow ?? defaultModelInfo.contextWindow
	const displayValue = currentValue.toString()

	const borderColor = currentValue > 0 ? "var(--vscode-charts-green)" : "var(--vscode-errorForeground)"

	const handleInputChange = (e: FormEvent<HTMLElement> | Event) => {
		const target = (e as FormEvent<HTMLElement>).target as HTMLInputElement
		const inputValue = target.value
		const parsed = parseInt(inputValue)

		onUpdate({
			...(modelInfo || defaultModelInfo),
			contextWindow: isNaN(parsed) ? defaultModelInfo.contextWindow : parsed,
		})
	}

	return (
		<div>
			<VSCodeTextField
				value={displayValue}
				type="text"
				style={{ borderColor }}
				onInput={handleInputChange}
				placeholder={placeholder}
				className="w-full">
				<label className="block font-medium mb-1">{label}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground">{description}</div>
		</div>
	)
}
