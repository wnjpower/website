'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Loader2, X, AlertCircle } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase-browser';

const MAX_BYTES = 10 * 1024 * 1024; // 10MB — DB 버킷 제한과 같은 값
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif';

/**
 * Supabase Storage(media 버킷)로 이미지를 올리고 공개 URL을 돌려준다.
 *
 * 업로드는 브라우저에서 직접 Storage로 간다. 서버 라우트를 거치면 Vercel의
 * 요청 본문 크기 제한(4.5MB)에 걸려 사진 한 장도 못 올리는 경우가 생긴다.
 * 쓰기 권한은 Storage 정책(is_admin())이 판정하므로 브라우저 직행이라도 안전하다.
 */
export default function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > MAX_BYTES) {
      setError(`사진이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB). 10MB 이하로 올려주세요.`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createBrowserSupabase();

      // 파일명에 한글·공백이 있으면 URL이 깨지므로 안전한 이름으로 새로 만든다
      const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { cacheControl: '31536000', upsert: false });

      if (uploadError) {
        setError(
          uploadError.message.includes('row-level security')
            ? '업로드 권한이 없습니다. 관리자 계정인지 확인해 주세요.'
            : `업로드 실패: ${uploadError.message}`,
        );
        return;
      }

      const { data } = supabase.storage.from('media').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : '업로드 중 문제가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
          {/* 외부 URL이 올 수 있어 next/image 대신 img를 쓴다 (도메인 등록 불필요) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="업로드한 이미지 미리보기" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="이미지 제거"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-8 text-slate-500 hover:border-brand hover:text-brand transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-semibold">올리는 중…</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-sm font-semibold">사진 올리기</span>
              <span className="text-xs text-slate-400">JPG · PNG · WEBP · 10MB 이하</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          // 같은 파일을 다시 선택해도 onChange가 발생하도록 초기화한다
          e.target.value = '';
        }}
      />

      {value && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 font-mono"
          aria-label="이미지 주소"
        />
      )}

      {error && (
        <p className="flex gap-2 items-start text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
