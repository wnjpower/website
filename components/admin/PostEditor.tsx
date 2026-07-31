'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Rocket, Trash2, Loader2, Check, AlertCircle,
  Bold, Italic, Heading2, List, Link2, ImagePlus, Eye, PenLine,
} from 'lucide-react';
import SeoPanel from './SeoPanel';
import ImageUpload from './ImageUpload';
import { savePost, deletePost, suggestSlug, type PostInput } from '@/app/admin/post-actions';
import { POST_TYPE_LABELS, POST_TYPES, postPath, type PostType } from '@/lib/posts-shared';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-ink ' +
  'focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand';

export interface PostFormValue {
  id?: string;
  type: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  coverAlt: string;
  status: 'draft' | 'published';
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  noindex: boolean;
}

export default function PostEditor({ initial }: { initial: PostFormValue }) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormValue>(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [tab, setTab] = useState<'write' | 'seo'>('write');
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof PostFormValue>(key: K, value: PostFormValue[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(status: 'draft' | 'published') {
    startTransition(async () => {
      const payload: PostInput = { ...form, status };
      const result = await savePost(payload);
      if (result.ok) {
        setMessage({ ok: true, text: result.message ?? '저장했습니다.' });
        setForm((prev) => ({ ...prev, status, id: result.id ?? prev.id }));
        if (!form.id && result.id) {
          router.replace(`/admin/posts/${result.id}`);
        }
        router.refresh();
      } else {
        setMessage({ ok: false, text: result.error });
      }
    });
  }

  function remove() {
    if (!form.id) return;
    if (!confirm('이 글을 완전히 삭제합니다. 되돌릴 수 없습니다. 계속할까요?')) return;
    startTransition(async () => {
      const result = await deletePost(form.id!);
      if (result.ok) router.push('/admin/posts');
      else setMessage({ ok: false, text: result.error });
    });
  }

  async function autoSlug() {
    if (!form.title.trim()) return;
    set('slug', await suggestSlug(form.title));
  }

  const path = postPath(form.type, form.slug || 'new-post');

  return (
    <div className="space-y-4">
      {/* ── 상단 바 ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/posts"
            aria-label="목록으로"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-brand hover:border-brand transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-ink truncate">
              {form.id ? '글 수정' : '새 글 쓰기'}
            </h1>
            <p className="text-sm text-slate-500">
              {form.status === 'published' ? '발행됨' : '임시 저장 상태'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {form.id && (
            <button
              onClick={remove}
              disabled={isPending}
              aria-label="삭제"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-300 text-slate-400 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => submit('draft')}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[0.9375rem] font-semibold text-slate-600 hover:border-brand hover:text-brand transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            임시 저장
          </button>
          <button
            onClick={() => submit('published')}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-700 text-white font-bold px-5 py-2.5 text-[0.9375rem] transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            발행
          </button>
        </div>
      </div>

      {message && (
        <p
          className={`flex gap-2 items-start rounded-lg px-4 py-3 text-sm ${
            message.ok
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.ok ? <Check className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
          {message.text}
        </p>
      )}

      {/* 좁은 화면에서는 글쓰기/SEO를 탭으로 나눈다 */}
      <div className="xl:hidden inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          onClick={() => setTab('write')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold ${tab === 'write' ? 'bg-brand text-white' : 'text-slate-500'}`}
        >
          <PenLine className="w-4 h-4" /> 글쓰기
        </button>
        <button
          onClick={() => setTab('seo')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold ${tab === 'seo' ? 'bg-brand text-white' : 'text-slate-500'}`}
        >
          <Eye className="w-4 h-4" /> SEO 점검
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(0,380px)] gap-5 items-start">
        {/* ── 본문 편집 ── */}
        <div className={`space-y-4 ${tab === 'seo' ? 'hidden xl:block' : ''}`}>
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
              <Field label="게시판">
                <select className={inputClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {POST_TYPES.map((t) => (
                    <option key={t} value={t}>{POST_TYPE_LABELS[t as PostType]}</option>
                  ))}
                </select>
              </Field>
              <Field label="제목">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  onBlur={() => { if (!form.slug) void autoSlug(); }}
                  placeholder="예) 대구 공장 전기공사 비용, 무엇으로 결정되나"
                  maxLength={200}
                />
              </Field>
            </div>

            <Field label="주소 (URL)" help={`완성된 주소: ${path}`}>
              <div className="flex gap-2">
                <input
                  className={`${inputClass} font-mono text-sm`}
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="daegu-factory-electric-cost"
                />
                <button
                  type="button"
                  onClick={autoSlug}
                  className="whitespace-nowrap rounded-lg border border-slate-300 px-3.5 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand"
                >
                  자동 생성
                </button>
              </div>
            </Field>

            <Field label="대표 사진">
              <ImageUpload value={form.coverImage} onChange={(url) => set('coverImage', url)} />
            </Field>

            {form.coverImage && (
              <Field label="대표 사진 설명" help="사진이 안 보일 때 대신 읽히는 글입니다. 이미지 검색에도 쓰입니다.">
                <input
                  className={inputClass}
                  value={form.coverAlt}
                  onChange={(e) => set('coverAlt', e.target.value)}
                  placeholder="예) 대구 달서구 공장 배전반 설치 현장"
                />
              </Field>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <MarkdownToolbar onInsert={(text) => set('body', form.body + text)} />
            <textarea
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              rows={24}
              placeholder={PLACEHOLDER}
              className="w-full px-4 py-4 text-base leading-relaxed text-ink focus:outline-none resize-y font-mono"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <Field label="목록 요약" help="비워두면 본문 앞부분을 자동으로 씁니다.">
              <textarea
                className={inputClass}
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                rows={2}
                maxLength={200}
              />
            </Field>
          </div>
        </div>

        {/* ── SEO ── */}
        <div className={`space-y-4 xl:sticky xl:top-4 ${tab === 'write' ? 'hidden xl:block' : ''}`}>
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            <Field
              label="핵심 키워드"
              help="이 글로 검색에 걸리고 싶은 말 하나. 아래 점검 항목이 전부 이 값을 기준으로 계산됩니다."
            >
              <input
                className={inputClass}
                value={form.focusKeyword}
                onChange={(e) => set('focusKeyword', e.target.value)}
                placeholder="예) 대구 공장 전기공사 비용"
                maxLength={60}
              />
            </Field>

            <Field label="검색 결과 제목" help="비워두면 위의 글 제목이 그대로 쓰입니다.">
              <input
                className={inputClass}
                value={form.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
                placeholder={form.title}
                maxLength={80}
              />
            </Field>

            <Field label="검색 결과 설명">
              <textarea
                className={inputClass}
                value={form.metaDescription}
                onChange={(e) => set('metaDescription', e.target.value)}
                rows={3}
                maxLength={160}
              />
            </Field>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.noindex}
                onChange={(e) => set('noindex', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <span className="text-sm text-slate-600 leading-snug break-keep">
                <span className="font-semibold text-ink">검색엔진에 노출하지 않기</span>
                <br />
                내부 공지처럼 검색에 뜨면 안 되는 글에만 켜세요.
              </span>
            </label>
          </div>

          <SeoPanel
            input={{
              title: form.title,
              metaTitle: form.metaTitle,
              metaDescription: form.metaDescription,
              slug: form.slug,
              body: form.body,
              focusKeyword: form.focusKeyword,
              coverAlt: form.coverAlt,
            }}
            postPath={path}
          />
        </div>
      </div>
    </div>
  );
}

function MarkdownToolbar({ onInsert }: { onInsert: (text: string) => void }) {
  const buttons = [
    { icon: Heading2, label: '소제목', text: '\n\n## 소제목\n\n' },
    { icon: Bold,     label: '굵게',   text: '**굵은 글씨**' },
    { icon: Italic,   label: '기울임', text: '*기울임*' },
    { icon: List,     label: '목록',   text: '\n\n- 항목 1\n- 항목 2\n' },
    { icon: Link2,    label: '링크',   text: '[링크 글자](/services/factory)' },
    { icon: ImagePlus, label: '사진',  text: '\n\n![사진 설명](사진 주소)\n\n' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      {buttons.map((b) => {
        const Icon = b.icon;
        return (
          <button
            key={b.label}
            type="button"
            onClick={() => onInsert(b.text)}
            title={b.label}
            className="inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-brand transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
            {b.label}
          </button>
        );
      })}
      <span className="ml-auto text-xs text-slate-400 px-2 hidden sm:block">
        버튼을 누르면 글 맨 끝에 서식이 추가됩니다
      </span>
    </div>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-ink">{label}</label>
      {children}
      {help && <p className="text-xs text-slate-500 leading-relaxed break-keep">{help}</p>}
    </div>
  );
}

const PLACEHOLDER = `여기에 글을 쓰세요.

## 소제목은 ## 로 시작합니다

문단은 빈 줄로 나눕니다.

- 목록은 하이픈으로 시작합니다
- 두 번째 항목

**굵게** 쓰려면 별표 두 개로 감쌉니다.
[링크](/services/factory) 는 대괄호와 소괄호로 만듭니다.
![사진 설명](사진주소) 로 사진을 넣습니다.`;
