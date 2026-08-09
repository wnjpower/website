'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, ExternalLink, Quote, Download } from 'lucide-react';
import {
  saveAeoKeyword,
  deleteAeoKeyword,
  recordAeoObservation,
  deleteAeoObservation,
  type AeoKeywordInput,
} from '@/app/admin/actions';
import {
  AEO_ENGINES,
  AEO_ENGINE_LABELS,
  AEO_GRADE_LABELS,
  type AeoEngine,
  type AeoReport,
} from '@/lib/seo/aeo';
import { Panel, Notice, ResultNote, Chip, Empty, Field, StatTile } from '@/components/admin/ui';

export interface AeoKeywordRow {
  id: string;
  keyword: string;
  question: string;
  targetPath: string | null;
  priority: number;
  active: boolean;
  note: string | null;
}

export interface AeoObservationRow {
  id: string;
  keywordId: string;
  engine: string;
  observedAt: string;
  cited: boolean;
  snippet: string | null;
  note: string | null;
}

export interface AeoDiagnosis {
  keywordId: string;
  report: AeoReport;
}

interface PageOption {
  path: string;
  label: string;
}

/*
 * 진단 항목의 표식.
 *
 * 색만으로 구분하지 않는다 — 색 구분이 어려운 분에게 빨강·초록은 아무 정보가
 * 아니다. 기호를 먼저 두고 색은 보조로만 쓴다(어드민 스위치와 같은 원칙).
 */
const STATUS_MARK = { good: '✓', warn: '△', bad: '✗' } as const;

function gradeTone(grade: AeoReport['grade']) {
  return grade === 'good' ? 'ok' : grade === 'ok' ? 'warn' : 'err';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function AeoManager({
  rows,
  diagnoses,
  observations,
  pages,
}: {
  rows: AeoKeywordRow[];
  diagnoses: AeoDiagnosis[];
  observations: AeoObservationRow[];
  pages: PageOption[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<AeoKeywordRow> | null>(null);
  const [observing, setObserving] = useState<AeoKeywordRow | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const reportOf = new Map(diagnoses.map((d) => [d.keywordId, d.report]));
  const obsOf = new Map<string, AeoObservationRow[]>();
  for (const o of observations) {
    const list = obsOf.get(o.keywordId) ?? [];
    list.push(o);
    obsOf.set(o.keywordId, list);
  }

  // ── 요약 ────────────────────────────────────────────────
  const active = rows.filter((r) => r.active);
  const avgScore =
    active.length > 0
      ? Math.round(
          active.reduce((sum, r) => sum + (reportOf.get(r.id)?.score ?? 0), 0) / active.length,
        )
      : 0;
  const recent = observations.filter(
    (o) => Date.now() - new Date(o.observedAt).getTime() < 30 * 24 * 60 * 60 * 1000,
  );
  const citedRate =
    recent.length > 0 ? Math.round((recent.filter((o) => o.cited).length / recent.length) * 100) : null;
  const notReady = active.filter((r) => (reportOf.get(r.id)?.grade ?? 'bad') === 'bad').length;
  const lowest =
    active.length > 0
      ? Math.min(...active.map((r) => reportOf.get(r.id)?.score ?? 0))
      : null;

  function run(fn: () => Promise<{ ok: boolean; message?: string; error?: string }>, after?: () => void) {
    startTransition(async () => {
      const result = await fn();
      setMessage(
        result.ok
          ? { ok: true, text: result.message ?? '완료했습니다.' }
          : { ok: false, text: result.error ?? '실패했습니다.' },
      );
      if (result.ok) {
        after?.();
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3.5">
      {message && <ResultNote ok={message.ok} text={message.text} />}

      <Notice tone="info" title="이 점수가 뜻하는 것 — 그리고 뜻하지 않는 것">
        <p className="mb-2">
          점수는 <strong>「답변엔진이 우리 문장을 인용할 준비가 됐는가」</strong>입니다. 사이트 문구를
          기준으로 코드가 계산하며, 문구를 고치면 이 화면에서 바로 반영됩니다.
        </p>
        <p>
          <strong>실제로 인용됐는지는 코드가 알 수 없습니다.</strong> 답변엔진은 순위·인용 조회 수단을
          제공하지 않고 같은 질문에도 답이 매번 달라집니다. 그래서 실제 인용은 직접 물어보고 아래
          <strong>「관찰 기록」</strong>에 남기는 방식으로 추적합니다. 점수는 결과가 아니라 선행 지표입니다 —
          높다고 인용이 보장되지는 않지만, 낮으면 인용될 수 없습니다.
        </p>
      </Notice>

      {rows.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatTile label="추적 중" value={`${active.length}개`} hint={rows.length > active.length ? `중지 ${rows.length - active.length}개` : undefined} />
          <StatTile label="평균 준비도" value={`${avgScore}점`} />
          {/*
            «0개»만 보여주면 51점짜리가 섞여 있어도 다 됐다고 읽힌다.
            가장 낮은 점수를 함께 적어 실제 상태가 드러나게 한다.
          */}
          <StatTile
            label="준비 안 된 키워드"
            value={`${notReady}개`}
            hint={
              notReady > 0
                ? '먼저 손볼 대상입니다'
                : lowest !== null
                  ? `가장 낮은 키워드가 ${lowest}점입니다`
                  : undefined
            }
          />
          <StatTile
            label="최근 30일 인용률"
            value={citedRate === null ? '—' : `${citedRate}%`}
            hint={citedRate === null ? '아직 관찰 기록이 없습니다' : `관찰 ${recent.length}건 기준`}
          />
        </div>
      )}

      {rows.length > 0 && <CsvExport observationCount={observations.length} />}

      <Panel
        title="추적 키워드"
        note="답변엔진에 물었을 때 우리가 나와야 하는 말을 등록하세요. 질문 문장까지 함께 적으면 진단이 정확해집니다."
        flush
        action={
          <button
            onClick={() => setEditing({ priority: 100, active: true, question: '' })}
            className="a-btn a-btn--sm"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            키워드 추가
          </button>
        }
      >
        {rows.length === 0 ? (
          <div className="a-panel-body">
            <Empty>
              아직 추적하는 키워드가 없습니다. 발주처가 답변엔진에 물어볼 법한 말부터 넣어보세요 —
              「대구 공장 전기공사」, 「계약전력 증설 절차」처럼요.
            </Empty>
          </div>
        ) : (
          <div className="a-rows">
            {rows.map((row) => {
              const report = reportOf.get(row.id);
              const list = obsOf.get(row.id) ?? [];
              return (
                <KeywordRow
                  key={row.id}
                  row={row}
                  report={report}
                  observations={list}
                  pending={isPending}
                  onEdit={() => setEditing(row)}
                  onObserve={() => setObserving(row)}
                  onDelete={() => {
                    if (!confirm(`"${row.keyword}" 추적을 중단하고 관찰 기록도 함께 지웁니다. 계속할까요?`)) return;
                    run(() => deleteAeoKeyword(row.id));
                  }}
                  onDeleteObservation={(id) => run(() => deleteAeoObservation(id))}
                />
              );
            })}
          </div>
        )}
      </Panel>

      {editing && (
        <KeywordDialog
          initial={editing}
          pages={pages}
          pending={isPending}
          onCancel={() => setEditing(null)}
          onSave={(input) => run(() => saveAeoKeyword(input), () => setEditing(null))}
        />
      )}

      {observing && (
        <ObservationDialog
          keyword={observing}
          pending={isPending}
          onCancel={() => setObserving(null)}
          onSave={(engine, cited, snippet, note) =>
            run(
              () => recordAeoObservation({ keywordId: observing.id, engine, cited, snippet, note }),
              () => setObserving(null),
            )
          }
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  CSV 내보내기
// ─────────────────────────────────────────────

/**
 * 구글 시트로 넘기기.
 *
 * 두 파일로 나눈다. 진단은 «오늘 기준 어떤 상태인가»라 내보낼 때마다 갱신되는
 * 스냅샷이고, 관찰 기록은 «언제 무엇을 봤는가»라 쌓이는 시계열이다.
 * 한 표에 섞으면 시트에서 둘 다 다루기 어려워진다.
 *
 * 링크는 평범한 <a download>다. 서버가 Content-Disposition으로 파일 이름을
 * 주므로 브라우저가 알아서 내려받는다 — 자바스크립트로 Blob을 만들 이유가 없다.
 */
function CsvExport({ observationCount }: { observationCount: number }) {
  return (
    <Panel
      title="구글 시트로 내보내기"
      note="CSV로 내려받아 구글 시트에 올리면 됩니다. 진단표를 같은 시트에 계속 덧붙이면 «기준일» 칸으로 점수 추이를 볼 수 있습니다."
    >
      <div className="flex flex-wrap gap-2">
        <a href="/api/admin/aeo/export?type=keywords" download className="a-btn a-btn--sm">
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          키워드 진단표
        </a>
        <a href="/api/admin/aeo/export?type=observations" download className="a-btn a-btn--sm">
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          관찰 기록
          {observationCount > 0 && (
            <span className="text-muted" style={{ fontSize: 11.5 }}>{observationCount}건</span>
          )}
        </a>
      </div>

      <details style={{ marginTop: 12 }}>
        <summary className="a-link" style={{ fontSize: 12.5, cursor: 'pointer' }}>
          구글 시트에 올리는 방법
        </summary>
        <ol
          className="text-muted break-keep"
          style={{ fontSize: 12.5, lineHeight: 1.85, margin: '8px 0 0', paddingLeft: 18 }}
        >
          <li>위 버튼으로 파일을 내려받습니다.</li>
          <li>구글 시트에서 <strong>파일 → 가져오기 → 업로드</strong>로 그 파일을 올립니다.</li>
          <li>
            추이를 보려면 가져오기 위치를 <strong>「현재 시트에 추가」</strong>로 고르세요.
            매달 같은 시트에 쌓이고, <strong>기준일</strong> 칸으로 피벗을 만들면 점수가
            어떻게 움직였는지 보입니다.
          </li>
        </ol>
        <p className="text-muted break-keep" style={{ fontSize: 12, marginTop: 8 }}>
          ⚠️ 구글 시트의 <code>IMPORTDATA</code>로 이 주소를 직접 부를 수는 없습니다.
          관리자 로그인이 필요한데 시트는 로그인 정보를 보내지 못하고, 인증을 풀면
          <strong> 어떤 키워드를 노리고 있는지가 공개</strong>됩니다. 내려받아 올리는 편이 맞습니다.
        </p>
      </details>
    </Panel>
  );
}

// ─────────────────────────────────────────────
//  키워드 한 줄
// ─────────────────────────────────────────────

function KeywordRow({
  row,
  report,
  observations,
  pending,
  onEdit,
  onObserve,
  onDelete,
  onDeleteObservation,
}: {
  row: AeoKeywordRow;
  report?: AeoReport;
  observations: AeoObservationRow[];
  pending: boolean;
  onEdit: () => void;
  onObserve: () => void;
  onDelete: () => void;
  onDeleteObservation: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const lastCited = observations.find((o) => o.cited);

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontWeight: 600 }}>{row.keyword}</span>
            {!row.active && <Chip tone="muted">중지</Chip>}
            {report && (
              <Chip tone={gradeTone(report.grade)}>
                {report.score}점 · {AEO_GRADE_LABELS[report.grade]}
              </Chip>
            )}
          </div>
          {row.question && (
            <p className="text-muted break-keep" style={{ fontSize: 12.5, marginTop: 3 }}>
              “{row.question}”
            </p>
          )}
          <p className="text-muted" style={{ fontSize: 11.5, marginTop: 3 }}>
            {report?.matchedLabel ? `담당 ${report.matchedLabel}` : '담당 페이지 없음'}
            {observations.length > 0
              ? ` · 관찰 ${observations.length}건${lastCited ? ` · 최근 인용 ${formatDate(lastCited.observedAt)}` : ' · 인용 확인 없음'}`
              : ' · 관찰 기록 없음'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => setOpen((v) => !v)} className="a-btn a-btn--sm" disabled={pending}>
            {open ? '접기' : '자세히'}
          </button>
          <button onClick={onObserve} className="a-btn a-btn--sm" disabled={pending}>
            관찰 기록
          </button>
          <button onClick={onEdit} className="a-btn a-btn--icon a-btn--sm a-btn--ghost" aria-label="수정" disabled={pending}>
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button onClick={onDelete} className="a-btn a-btn--icon a-btn--sm a-btn--ghost" aria-label="삭제" disabled={pending}>
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {open && report && (
        <div className="mt-3 space-y-3" style={{ paddingLeft: 2 }}>
          {/* 진단 항목 */}
          <ul className="space-y-1.5">
            {report.checks.map((check) => (
              <li key={check.id} className="flex gap-2" style={{ fontSize: 12.5 }}>
                <span
                  aria-hidden
                  style={{
                    flex: 'none',
                    width: 14,
                    color:
                      check.status === 'good'
                        ? 'var(--color-accent)'
                        : check.status === 'warn'
                          ? '#8a6d1f'
                          : '#a4352b',
                  }}
                >
                  {STATUS_MARK[check.status]}
                </span>
                <span className="min-w-0 break-keep">
                  <span style={{ fontWeight: check.status === 'good' ? 400 : 500 }}>{check.label}</span>
                  {check.hint && (
                    <span className="text-muted block" style={{ fontSize: 11.5, marginTop: 1 }}>
                      {check.hint}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {/* 인용 후보 문장 */}
          {report.bestAnswer && (
            <div className="blueprint" style={{ padding: '10px 12px' }}>
              <p
                className="display text-muted"
                style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}
              >
                <Quote className="w-3 h-3 inline mr-1" strokeWidth={1.5} aria-hidden />
                인용될 가능성이 가장 높은 문장
                {report.bestAnswerPosition !== null &&
                  ` — 본문 ${Math.round(report.bestAnswerPosition * 100)}% 지점`}
              </p>
              <p className="break-keep" style={{ fontSize: 12.5, lineHeight: 1.65 }}>
                {report.bestAnswer}
              </p>
              {report.matchedPath && (
                <a
                  href={report.matchedPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted inline-flex items-center gap-1"
                  style={{ fontSize: 11.5, marginTop: 6 }}
                >
                  {report.matchedPath}
                  <ExternalLink className="w-3 h-3" strokeWidth={1.5} aria-hidden />
                </a>
              )}
            </div>
          )}

          {/* 관찰 기록 */}
          <div>
            <p
              className="display text-muted"
              style={{ fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 5 }}
            >
              관찰 기록
            </p>
            {observations.length === 0 ? (
              <p className="text-muted break-keep" style={{ fontSize: 12 }}>
                아직 없습니다. ChatGPT나 Perplexity에 위 질문을 그대로 물어보고, 우리 사이트가
                답에 나오는지 [관찰 기록]으로 남기세요.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {observations.slice(0, 10).map((o) => (
                  <li key={o.id} className="flex items-start gap-2" style={{ fontSize: 12 }}>
                    <span className="text-muted mono-num flex-shrink-0" style={{ width: 74 }}>
                      {formatDate(o.observedAt)}
                    </span>
                    <span className="flex-shrink-0" style={{ width: 88 }}>
                      {AEO_ENGINE_LABELS[o.engine as AeoEngine] ?? o.engine}
                    </span>
                    <Chip tone={o.cited ? 'ok' : 'muted'}>{o.cited ? '인용됨' : '안 나옴'}</Chip>
                    <span className="min-w-0 flex-1 text-muted break-keep">
                      {o.snippet || o.note || ''}
                    </span>
                    <button
                      onClick={() => onDeleteObservation(o.id)}
                      className="a-btn a-btn--icon a-btn--sm a-btn--ghost flex-shrink-0"
                      aria-label="기록 삭제"
                      disabled={pending}
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  키워드 추가·수정
// ─────────────────────────────────────────────

function KeywordDialog({
  initial,
  pages,
  pending,
  onCancel,
  onSave,
}: {
  initial: Partial<AeoKeywordRow>;
  pages: PageOption[];
  pending: boolean;
  onCancel: () => void;
  onSave: (input: AeoKeywordInput) => void;
}) {
  const [form, setForm] = useState({
    keyword: initial.keyword ?? '',
    question: initial.question ?? '',
    targetPath: initial.targetPath ?? '',
    priority: initial.priority ?? 100,
    active: initial.active ?? true,
    note: initial.note ?? '',
  });

  return (
    <Panel title={initial.id ? '키워드 수정' : '키워드 추가'}>
      <div className="space-y-3.5">
        <Field
          label="키워드"
          help="답변엔진 답에 우리가 나와야 하는 말. 예: 대구 공장 전기공사"
        >
          <input
            className="bp-input"
            value={form.keyword}
            maxLength={100}
            onChange={(e) => setForm({ ...form, keyword: e.target.value })}
          />
        </Field>

        <Field
          label="실제 질문 문장"
          help="사람이 ChatGPT에 그대로 칠 법한 문장을 적으세요. 이게 있어야 «이 질문에 답하는 문장이 우리 사이트에 있는가»를 볼 수 있습니다."
        >
          <input
            className="bp-input"
            placeholder="예: 대구에서 공장 계약전력 증설은 어떻게 하나요?"
            value={form.question}
            maxLength={300}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
        </Field>

        <Field
          label="담당 페이지"
          help="비워두면 사이트 전체에서 가장 잘 맞는 페이지를 자동으로 찾습니다. 특정 페이지로 끌고 가고 싶을 때만 지정하세요."
        >
          <select
            className="bp-input"
            value={form.targetPath}
            onChange={(e) => setForm({ ...form, targetPath: e.target.value })}
          >
            <option value="">자동으로 찾기</option>
            {pages.map((p) => (
              <option key={p.path} value={p.path}>
                {p.label} — {p.path}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="우선순위" help="작을수록 목록 위에 옵니다">
            <input
              type="number"
              className="bp-input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            />
          </Field>
          <Field label="추적 상태">
            <select
              className="bp-input"
              value={form.active ? 'on' : 'off'}
              onChange={(e) => setForm({ ...form, active: e.target.value === 'on' })}
            >
              <option value="on">추적 중</option>
              <option value="off">중지</option>
            </select>
          </Field>
        </div>

        <Field label="메모" help="왜 이 키워드를 노리는지 적어두면 나중에 판단하기 쉽습니다.">
          <textarea
            className="bp-input"
            rows={2}
            value={form.note}
            maxLength={1000}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Field>

        <div className="flex gap-2">
          <button
            className="a-btn a-btn--solid"
            disabled={pending || !form.keyword.trim()}
            onClick={() =>
              onSave({
                id: initial.id,
                keyword: form.keyword,
                question: form.question,
                targetPath: form.targetPath || null,
                priority: form.priority,
                active: form.active,
                note: form.note,
              })
            }
          >
            저장
          </button>
          <button className="a-btn" onClick={onCancel} disabled={pending}>
            취소
          </button>
        </div>
      </div>
    </Panel>
  );
}

// ─────────────────────────────────────────────
//  관찰 기록
// ─────────────────────────────────────────────

function ObservationDialog({
  keyword,
  pending,
  onCancel,
  onSave,
}: {
  keyword: AeoKeywordRow;
  pending: boolean;
  onCancel: () => void;
  onSave: (engine: AeoEngine, cited: boolean, snippet: string, note: string) => void;
}) {
  const [engine, setEngine] = useState<AeoEngine>('chatgpt');
  const [cited, setCited] = useState(true);
  const [snippet, setSnippet] = useState('');
  const [note, setNote] = useState('');

  const ask = keyword.question || keyword.keyword;

  return (
    <Panel title="관찰 기록" note={`"${keyword.keyword}"에 대한 답변엔진 결과를 남깁니다.`}>
      <div className="space-y-3.5">
        <Notice tone="info" title="이렇게 확인하세요">
          <p className="mb-1.5">아래 문장을 답변엔진에 그대로 물어보세요.</p>
          <p className="blueprint break-keep" style={{ padding: '8px 10px', fontSize: 12.5 }}>
            {ask}
          </p>
          <p className="mt-1.5" style={{ fontSize: 12 }}>
            답에 <strong>우앤주전력이 언급되거나 wnjpower.com이 출처로 붙으면</strong> 「인용됨」입니다.
            같은 질문도 답이 매번 조금씩 다르니, 한 달에 한 번 정도 같은 조건으로 확인하면 추이가 보입니다.
          </p>
        </Notice>

        <div className="grid grid-cols-2 gap-3">
          <Field label="답변엔진">
            <select
              className="bp-input"
              value={engine}
              onChange={(e) => setEngine(e.target.value as AeoEngine)}
            >
              {AEO_ENGINES.map((e) => (
                <option key={e} value={e}>
                  {AEO_ENGINE_LABELS[e]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="결과">
            <select
              className="bp-input"
              value={cited ? 'yes' : 'no'}
              onChange={(e) => setCited(e.target.value === 'yes')}
            >
              <option value="yes">인용됨 — 우리가 답에 나왔다</option>
              <option value="no">안 나옴</option>
            </select>
          </Field>
        </div>

        <Field
          label="인용된 대목"
          help="답변에서 우리를 언급한 문장을 붙여넣으세요. 어떤 문장이 먹히는지 알면 다른 페이지에도 같은 식으로 쓸 수 있습니다."
        >
          <textarea
            className="bp-input"
            rows={3}
            value={snippet}
            maxLength={2000}
            onChange={(e) => setSnippet(e.target.value)}
          />
        </Field>

        <Field label="메모" help="예: 경쟁사 3곳이 먼저 나오고 우리는 네 번째">
          <textarea
            className="bp-input"
            rows={2}
            value={note}
            maxLength={1000}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>

        <div className="flex gap-2">
          <button
            className="a-btn a-btn--solid"
            disabled={pending}
            onClick={() => onSave(engine, cited, snippet, note)}
          >
            기록 저장
          </button>
          <button className="a-btn" onClick={onCancel} disabled={pending}>
            취소
          </button>
        </div>
      </div>
    </Panel>
  );
}
