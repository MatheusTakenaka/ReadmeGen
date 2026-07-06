import { AI_PROVIDERS, type AIProviderId } from '../types';

interface AIProviderSelectorProps {
  selected: AIProviderId;
  onChange: (provider: AIProviderId) => void;
}

export function AIProviderSelector({ selected, onChange }: AIProviderSelectorProps) {
  return (
    <div className="ai-provider-selector">
      <label htmlFor="ai-provider">Escolha a IA</label>
      <select
        id="ai-provider"
        value={selected}
        onChange={(e) => onChange(e.target.value as AIProviderId)}
      >
        {AI_PROVIDERS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
      <p className="ai-provider-description">
        {AI_PROVIDERS.find((p) => p.id === selected)?.description}
      </p>
    </div>
  );
}