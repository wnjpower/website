'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Rocket, Trash2, Loader2,
  Bold, Italic, Heading2, List, Link2, ImagePlus, Eye, PenLine,
} from 'lucide-react';
import SeoPanel from './SeoPanel';
import ImageUpload from './ImageUpload';
import { Field, ResultNote, Switch, CornerMarks } from './ui';
import { savePost, deletePost, suggestSlug, type PostInput } from '@/app/admin/post-actions';
import { POST_TYPE_LABELS, POST_TYPES, postPath, type PostType } from '@/lib/posts-shared';

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
      <div className="a-pagehead" style={{ alignItems: 'center' }}>
        <Link href="/admin/posts" aria-label="목록으로" className="a-btn a-btn--icon">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate" style={{ fontSize: 24 }}>{form.id ? '글 수정' : '새 글 쓰기'}</h1>
          <p className="text-muted" style={{ fontSize: 12.5 }}>
            {form.status === 'published' ? '발행됨' : '임시 저장 상태'}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {form.id && (
            <button
              onClick={remove}
              disabled={isPending}
              aria-label="삭제"
              className="a-btn a-btn--icon a-btn--danger"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
          <button onClick={() => submit('draft')} disabled={isPending} className="a-btn">
            <Save className="w-4 h-4" strokeWidth={1.5} />
            임시 저장
          </button>
          <button onClick={() => submit('published')} disabled={isPending} className="a-btn a-btn--solid">
            <CornerMarks />
            {isPending
              ? <Loader2 className="w-4 h-4 bp-spin" strokeWidth={1.5} />
              : <Rocket className="w-4 h-4" strokeWidth={1.5} />}
            발행
          </button>
        </div>
      </div>

      {message && <ResultNote ok={message.ok} text={message.text} />}

      {/* 좁은 화면에서는 글쓰기/SEO를 탭으로 나눈다.
          .bp-seg가 display를 지정하므로 숨김은 바깥 래퍼가 맡는다 */}
      <div className="xl:hidden">
        <div className="bp-seg">
          <button
            onClick={() => setTab('write')}
            className="bp-seg-opt display"
            data-active={tab === 'write' ? '' : undefined}
          >
            <PenLine className="w-4 h-4" strokeWidth={1.5} /> 글쓰기
          </button>
          <button
            onClick={() => setTab('seo')}
            className="bp-seg-opt display"
            data-active={tab === 'seo' ? '' : undefined}
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} /> SEO 점검
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(0,380px)] gap-4 items-start">
        {/* ── 본문 편집 ── */}
        <div className={`space-y-3.5 ${tab === 'seo' ? 'hidden xl:block' : ''}`}>
          <div className="a-panel a-panel-body space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
              <Field label="게시판">
                <select className="bp-input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {POST_TYPES.map((t) => (
                    <option key={t} value={t}>{POST_TYPE_LABELS[t as PostType]}</option>
                  ))}
                </select>
              </Field>
              <Field label="제목">
                <input
                  className="bp-input"
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
                  className="bp-input mono-num"
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="daegu-factory-electric-cost"
                />
                <button type="button" onClick={autoSlug} className="a-btn">
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
                  className="bp-input"
                  value={form.coverAlt}
                  onChange={(e) => set('coverAlt', e.target.value)}
                  placeholder="예) 대구 달서구 공장 배전반 설치 현장"
                />
              </Field>
            )}
          </div>

          <div className="a-panel">
            <MarkdownToolbar onInsert={(text) => set('body', form.body + text)} />
            <textarea
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              rows={24}
              placeholder={PLACEHOLDER}
              aria-label="본문"
              className="bp-input"
              style={{ border: 'none', background: 'var(--a-panel)', lineHeight: 1.8, padding: 16 }}
            />
          </div>

          <div className="a-panel a-panel-body">
            <Field label="목록 요약" help="비워두면 본문 앞부분을 자동으로 씁니다.">
              <textarea
                className="bp-input"
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                rows={2}
                maxLength={200}
              />
            </Field>
          </div>
        </div>

        {/* ── SEO ── */}
        <div className={`space-y-3.5 xl:sticky xl:top-4 ${tab === 'write' ? 'hidden xl:block' : ''}`}>
          <div className="a-panel a-panel-body space-y-4">
            <Field
              label="핵심 키워드"
              help="이 글로 검색에 걸리고 싶은 말 하나. 아래 점검 항목이 전부 이 값을 기준으로 계산됩니다."
            >
              <input
                className="bp-input"
                value={form.focusKeyword}
                onChange={(e) => set('focusKeyword', e.target.value)}
                placeholder="예) 대구 공장 전기공사 비용"
                maxLength={60}
              />
            </Field>

            <Field label="검색 결과 제목" help="비워두면 위의 글 제목이 그대로 쓰입니다.">
              <input
                className="bp-input"
                value={form.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
                placeholder={form.title}
                maxLength={80}
              />
            </Field>

            <Field label="검색 결과 설명">
              <textarea
                className="bp-input"
                value={form.metaDescription}
                onChange={(e) => set('metaDescription', e.target.value)}
                rows={3}
                maxLength={160}
              />
            </Field>

            <div className="flex items-start justify-between gap-3">
              <span className="break-keep" style={{ fontSize: 13.5 }}>
                <span style={{ fontWeight: 600 }}>검색엔진에 노출하지 않기</span>
                <br />
                <span className="text-muted">내부 공지처럼 검색에 뜨면 안 되는 글에만 켜세요.</span>
              </span>
              <Switch
                checked={form.noindex}
                onChange={(v) => set('noindex', v)}
                label="검색엔진에 노출하지 않기"
              />
            </div>
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
    <div
      className="flex flex-wrap items-center gap-1 px-2 py-1.5"
      style={{ borderBottom: '1px solid var(--color-divider)', background: 'rgba(89,128,166,0.05)' }}
    >
      {buttons.map((b) => {
        const Icon = b.icon;
        return (
          <button
            key={b.label}
            type="button"
            onClick={() => onInsert(b.text)}
            title={b.label}
            className="a-btn a-btn--sm a-btn--ghost"
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            {b.label}
          </button>
        );
      })}
      <span className="a-help ml-auto px-2 hidden sm:block">
        버튼을 누르면 글 맨 끝에 서식이 추가됩니다
      </span>
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
