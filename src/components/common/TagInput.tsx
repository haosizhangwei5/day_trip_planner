import { useState, type KeyboardEvent } from 'react';

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  color?: 'orange' | 'red';
}

export function TagInput({ tags, onChange, placeholder = '入力してEnter', color = 'orange' }: Props) {
  const [input, setInput] = useState('');

  function addTag() {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput('');
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  const tagClass =
    color === 'red'
      ? 'bg-red-100 text-red-700 border border-red-200'
      : 'bg-orange-100 text-orange-700 border border-orange-200';

  return (
    <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-200 rounded-xl focus-within:border-orange-400 bg-white min-h-[48px] items-center transition-colors">
      {tags.map((tag, i) => (
        <span key={i} className={`tag-enter flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${tagClass}`}>
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="hover:opacity-60 transition-opacity ml-0.5 text-xs leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder-gray-400"
      />
    </div>
  );
}
