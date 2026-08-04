// ESLint 9 플랫 설정.
//
// 이 파일은 create-next-app이 만들어 준 그대로였는데, 처음부터 한 번도 돌지
// 않았다. 스캐폴딩은 eslint-config-next가 플랫 설정을 직접 내보내는 최신
// 버전을 전제로
//
//     import nextVitals from "eslint-config-next/core-web-vitals";
//     export default defineConfig([...nextVitals, ...])
//
// 를 썼지만, 원래 깔려 있던 eslint-config-next@14.2.35는 여전히 eslintrc 스타일
// (`module.exports = { extends: [...] }`)이고 exports 맵도 없다. 그래서
// ESM import가 확장자를 못 찾아 ERR_MODULE_NOT_FOUND로 죽었고, 설령
// 찾았더라도 배열이 아니라 객체라서 스프레드에서 또 죽었을 것이다.
//
// ── 왜 이 조합인가
//
// 14는 peer가 `eslint ^7 || ^8`이다. 말 그대로 ESLint 9를 지원하지 않아서,
// 설정을 어떻게 감싸도 규칙 자체가 죽는다(@next/eslint-plugin-next@14의
// no-duplicate-head가 ESLint 9에서 사라진 context.getAncestors()를 부른다).
// 그래서 lint 전용 devDependency인 eslint-config-next만 15로 올렸다 —
// Next 런타임은 14 그대로다. 15의 규칙셋은 14와 사실상 같고 App Router
// 기준이라 이 코드베이스에 그대로 맞는다.
//
// 15도 아직 플랫 설정을 내보내지 않으므로 FlatCompat으로 감싼다.
//
// 짝이 되는 수정: package.json의 overrides에서 eslint-plugin-react-hooks를
// v5 안정판으로 올린다 — 14가 묶어 둔 2023년 canary도 같은 이유로 죽는다
// (이쪽은 context.getScope()).

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default config;
