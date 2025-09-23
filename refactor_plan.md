### 实施计划：抽取并重用模型配置组件

**目标：** 将"最大输出token数"和"上下文窗口大小"设置项抽象为通用组件，并集成到所有相关的 LLM Provider 中。

**优化后的步骤：**

1.  **创建新的通用组件 `ModelCapabilitySettings.tsx`**
    *   **位置：** `webview-ui/src/components/settings/`
    *   **功能：**
        *   提供两个输入框，分别用于设置"最大输出token数" (`maxTokens`) 和"上下文窗口大小" (`contextWindow`)。
        *   接收 `apiConfiguration` 和 `setApiConfigurationField` 作为 props，用于读取和更新配置。
        *   接收一个 `modelInfoKey` 的 prop (例如: `"openAiCustomModelInfo"`, `"anthropicCustomModelInfo"` 等)，使其能够动态地更新 `apiConfiguration` 中对应的配置对象。
        *   包含必要的标签、描述和输入验证逻辑，与 `OpenAICompatible.tsx` 中的现有实现保持一致。
        *   支持可选的 `defaultModelInfo` prop，用于提供合理的默认值。

2.  **修改 `ProviderSettings` 类型定义**
    *   **文件：** `packages/types/src/provider-settings.ts`
    *   **修改内容：** 为主要 Provider 添加 `customModelInfo` 字段：
        *   为现有的 provider schemas 添加 `customModelInfo: modelInfoSchema.nullish()` 字段
        *   主要目标 providers: `anthropic`, `gemini`, `mistral`, `groq`, `xai`, `cerebras`, `sambanova`, `fireworks`, `featherless` 等
    *   **目的：** 统一数据结构，方便新组件进行统一处理，并确保类型安全。

3.  **重构 `OpenAICompatible.tsx`**
    *   **修改内容：**
        *   引入新的 `ModelCapabilitySettings.tsx` 组件。
        *   移除原有的 `maxTokens` 和 `contextWindow` 输入框的 JSX 和相关逻辑 (大约第290-365行)。
        *   在原位置使用 `<ModelCapabilitySettings ... />`，并传入 `modelInfoKey="openAiCustomModelInfo"` 以及其他必要的 props。

4.  **将新组件集成到主要 Provider 中**
    *   **涉及文件：** `Anthropic.tsx`, `Gemini.tsx`, `Mistral.tsx`, `Groq.tsx`, `XAI.tsx`, `Cerebras.tsx`, `SambaNova.tsx`, `Fireworks.tsx`, `Featherless.tsx`
    *   **修改内容：**
        *   在每个组件中引入并使用 `ModelCapabilitySettings.tsx`。
        *   为每个组件传递对应的 `modelInfoKey`，例如在 `Anthropic.tsx` 中使用 `modelInfoKey="anthropicCustomModelInfo"`。
    *   **预期效果：** 所有集成了该组件的 Provider 设置页面都将出现相同的"最大输出token数"和"上下文窗口大小"配置项。

5.  **后端联动验证**
    *   `setApiConfigurationField` 函数是实现前后端联动的关键。只要新组件正确地调用此函数来更新 `apiConfiguration` 对象，现有的保存机制就会将修改后的配置同步到后端。
    *   验证数据流是否正确，确保对 `maxTokens` 和 `contextWindow` 的修改能够被正确地保存和应用。


### 6. 后端适配计划（已更新）

**目标：** 确保后端在处理 LLM 请求时，能够正确读取并使用前端设置的自定义 `maxTokens` 和 `contextWindow`。

**核心思路：** 后端的大部分请求逻辑都位于 `src/api/providers/` 目录下的各个 `Provider` 实现中。每个 `Provider` 都有一个 `getModel()` 方法，该方法是获取模型参数（如 `maxTokens`）的关键入口。因此，我们的适配工作将集中在修改这些 `getModel()` 方法上。

**实施步骤：**

1.  **创建通用的模型信息合并工具函数**
    *   **位置：** `src/api/providers/utils/modelInfo.ts` (如果不存在则创建)
    *   **函数名：** `mergeModelInfo(defaultInfo: ModelInfo, customInfo?: Partial<ModelInfo> | null): ModelInfo`
    *   **功能：**
        *   接收一个默认的 `ModelInfo` 对象和一个可选的、包含用户自定义设置的 `customInfo` 对象。
        *   返回一个新的 `ModelInfo` 对象，其中 `customInfo` 中的非 `null` 和非 `undefined` 的值将覆盖 `defaultInfo` 中的对应值。
        *   特别处理 `maxTokens` 和 `contextWindow`，确保用户输入（即使是空字符串或 `0`）能够被正确应用或忽略。

2.  **修改各个 Provider 的 `getModel()` 方法**
    *   **目标文件：** `src/api/providers/` 目录下的所有相关 provider 文件，例如 `anthropic.ts`, `gemini.ts`, `bedrock.ts`, `openai.ts` 等。
    *   **修改内容：**
        *   在每个 `getModel()` 方法的实现中，首先获取模型的默认 `ModelInfo`。
        *   从 `this.options` (即 `ProviderSettings`) 中获取对应的 `...CustomModelInfo` 对象（例如，`this.options.anthropicCustomModelInfo`）。
        *   调用新创建的 `mergeModelInfo` 函数，将默认信息和自定义信息合并。
        *   返回包含合并后 `info` 的模型对象。

3.  **处理继承关系**
    *   许多 `Provider` 继承自 `BaseOpenAiCompatibleProvider` ([`src/api/providers/base-openai-compatible-provider.ts`](src/api/providers/base-openai-compatible-provider.ts))。我们需要在基类或各个子类中适当地应用上述逻辑。
    *   对于直接继承 `BaseProvider` ([`src/api/providers/base-provider.ts`](src/api/providers/base-provider.ts)) 的 `Provider`（如 `anthropic.ts`），需要直接修改其 `getModel()` 方法。

**示例代码（伪代码）：**

```typescript
// In 'src/api/providers/anthropic.ts'

import { mergeModelInfo } from "./utils/modelInfo"; // 假设的工具函数路径

// ... in AnthropicHandler class

  getModel() {
    const modelId = this.options.apiModelId;
    let id = modelId && modelId in anthropicModels ? (modelId as AnthropicModelId) : anthropicDefaultModelId;
    let defaultInfo: ModelInfo = anthropicModels[id];

    // ... existing logic for 1M context beta ...

    // NEW: Merge with custom model info from settings
    const customInfo = this.options.anthropicCustomModelInfo;
    const mergedInfo = mergeModelInfo(defaultInfo, customInfo);

    const params = getModelParams({
      format: "anthropic",
      modelId: id,
      model: mergedInfo, // Use the merged info
      settings: this.options,
    });

    return {
      id: /* ... */,
      info: mergedInfo, // Return the merged info
      ...params,
    };
  }
```

通过这种方式，我们可以系统地、统一地将用户的自定义配置应用到所有相关的 LLM Provider 中，确保在发起 API 请求时使用的是正确的参数。
