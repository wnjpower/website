'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { FieldDef } from '@/lib/content/schema';
import ImageUpload from './ImageUpload';
import { Switch } from './ui';

/**
 * 스키마(FieldDef)를 보고 편집 UI를 그린다.
 *
 * 필드를 추가할 때 이 파일을 고칠 일은 없다. lib/content/schema.ts에 한 줄
 * 넣으면 여기서 알아서 그려진다 — "개발자 없이 편집"의 전제 조건이다.
 *
 * 입력 상자는 사이트 폼과 같은 .bp-input을 쓴다. 글꼴 크기는 16px 이상이다 —
 * iOS Safari는 그보다 작은 입력창에 포커스가 가면 화면을 자동으로 확대해 버려서,
 * 폰으로 편집할 때 매우 불편하다.
 */

type Value = unknown;
type Obj = Record<string, unknown>;

export function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: Value;
  onChange: (next: Value) => void;
}) {
  const describedBy = field.help ? `${field.key}-help` : undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={field.key} className="bp-label" style={{ marginBottom: 0 }}>
          {field.label}
          {field.readOnly && <span className="ml-2 opacity-70">수정 불가</span>}
        </label>
        {field.maxLength && typeof value === 'string' && (
          <CharCount value={value} max={field.maxLength} />
        )}
      </div>

      <FieldInput field={field} value={value} onChange={onChange} describedBy={describedBy} />

      {field.help && (
        <p id={describedBy} className="a-help">
          {field.help}
        </p>
      )}
    </div>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  const near = !over && len > max * 0.9;
  return (
    <span
      className="mono-num"
      style={{
        fontSize: 11,
        fontWeight: over ? 700 : 400,
        color: over ? 'var(--a-err)' : near ? 'var(--a-warn)' : 'rgba(29,31,32,0.45)',
      }}
    >
      {len}/{max}
    </span>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  describedBy,
}: {
  field: FieldDef;
  value: Value;
  onChange: (next: Value) => void;
  describedBy?: string;
}) {
  switch (field.type) {
    case 'boolean':
      return <Switch checked={Boolean(value)} onChange={onChange} label={field.label} />;

    case 'select':
      return (
        <select
          id={field.key}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={describedBy}
          className="bp-input"
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'textarea':
    case 'richtext':
      return (
        <textarea
          id={field.key}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          rows={field.type === 'richtext' ? 3 : 4}
          aria-describedby={describedBy}
          className="bp-input"
          placeholder={field.placeholder}
        />
      );

    case 'tags':
      return <TagsInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />;

    case 'image':
      return <ImageUpload value={typeof value === 'string' ? value : ''} onChange={onChange} />;

    case 'list':
      return <ListInput field={field} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} />;

    case 'url':
    case 'text':
    default:
      return (
        <input
          id={field.key}
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          readOnly={field.readOnly}
          aria-describedby={describedBy}
          placeholder={field.placeholder}
          className="bp-input"
          style={field.readOnly ? { background: 'var(--color-neutral-100)', opacity: 0.75 } : undefined}
        />
      );
  }
}

/**
 * 문자열 배열 — 한 줄에 하나씩 입력한다.
 *
 * 태그 UI(칩 추가/삭제)보다 줄바꿈 텍스트가 낫다. 순서를 바꾸거나 여러 개를
 * 한꺼번에 붙여넣기 쉽고, 사장님이 이미 아는 조작 방식이기 때문이다.
 */
function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join('\n'));

  return (
    <textarea
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }}
      rows={Math.min(10, Math.max(3, value.length + 1))}
      className="bp-input"
      placeholder="한 줄에 하나씩 입력하세요"
    />
  );
}

/** 객체 배열 — 항목 추가·삭제·순서 변경이 가능한 반복 편집기. */
function ListInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: Obj[];
  onChange: (v: Obj[]) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const subFields = field.fields ?? [];
  const maxItems = field.maxItems ?? 20;

  function updateItem(index: number, key: string, next: Value) {
    const copy = value.map((item, i) => (i === index ? { ...item, [key]: next } : item));
    onChange(copy);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const copy = [...value];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
    setOpenIndex(target);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setOpenIndex(null);
  }

  function add() {
    // 새 항목은 하위 필드의 빈 값으로 시작한다.
    // 타입이 맞지 않으면(예: 불리언 자리에 빈 문자열) 화면이 깨지므로 타입별로 채운다.
    const blank: Obj = {};
    for (const f of subFields) {
      blank[f.key] =
        f.type === 'boolean' ? false
        : f.type === 'tags' ? []
        : f.type === 'select' ? (f.options?.[0]?.value ?? '')
        : '';
    }
    onChange([...value, blank]);
    setOpenIndex(value.length);
  }

  return (
    <div className="space-y-2">
      {value.map((item, index) => {
        const title =
          (field.itemTitleKey && String(item[field.itemTitleKey] ?? '')) || `${index + 1}번 항목`;
        const isOpen = openIndex === index;

        return (
          <div key={index} style={{ border: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
            <div className="flex items-center gap-1 px-1.5 py-1.5">
              {/* 항목 번호 — 사이트 표(W-01, A-01)와 같은 표기 */}
              <span className="display flex-shrink-0 w-7 text-center" style={{ fontSize: 12.5, color: 'rgba(29,31,32,0.4)' }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex-1 min-w-0 text-left truncate px-1 py-1.5"
                style={{ fontSize: 13.5, fontWeight: 500 }}
              >
                {title}
              </button>

              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="위로"
                className="a-btn a-btn--icon a-btn--sm a-btn--ghost"
              >
                <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label="아래로"
                className="a-btn a-btn--icon a-btn--sm a-btn--ghost"
              >
                <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="삭제"
                className="a-btn a-btn--icon a-btn--sm a-btn--ghost a-btn--danger"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {isOpen && (
              <div
                className="px-3.5 py-4 space-y-4"
                style={{ borderTop: '1px solid var(--color-divider)', background: 'var(--a-panel)' }}
              >
                {subFields.map((sub) => (
                  <FieldRenderer
                    key={sub.key}
                    field={{ ...sub, key: `${field.key}-${index}-${sub.key}` }}
                    value={item[sub.key]}
                    onChange={(next) => updateItem(index, sub.key, next)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {value.length < maxItems ? (
        <button type="button" onClick={add} className="a-btn a-btn--block a-btn--sm" style={{ borderStyle: 'dashed' }}>
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          항목 추가
        </button>
      ) : (
        <p className="a-help text-center">최대 {maxItems}개까지 추가할 수 있습니다.</p>
      )}
    </div>
  );
}
