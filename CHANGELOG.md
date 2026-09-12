# Changelog / 변경 내역

## Static multi-file package

### English

- Replaced the single-file entry with `index.html` for static-site publishing.
- Extracted the existing CSS into `css/styles.css` without modifying its contents.
- Extracted the five original JavaScript blocks into `math.js`, `geometry.js`, `cart-model.js`, `renderer.js`, and `app.js` without modifying their contents.
- Preserved script dependency order with classic `defer` loading and the existing `CartLab` namespace.
- Decoded the repeated embedded JPEG once into `assets/images/reference.jpg` without recompression. Both reference-image elements use the same file.
- Extracted the inline favicon into `assets/icons/favicon.svg`.
- Used relative asset paths for domain-root and repository-subpath hosting.
- Added `.nojekyll`, bilingual README files, source-parity metadata, verification notes, and an optional Node.js validation script.
- Retained the original screenshot as a README preview, explicitly labeled as an earlier preview.
- Did not introduce a build system, CDN, runtime dependency, backend, sensor connection, or hardware control.
- Did not alter geometry, materials, shaders, controls, labels, dimensions, or modeling assumptions. This is a packaging change, not a new modeling or rendering release.

### 한국어

- 정적 사이트 배포 진입점을 `index.html`로 구성했습니다.
- 기존 CSS를 내용 변경 없이 `css/styles.css`로 분리했습니다.
- 기존 JS 블록 5개를 내용 변경 없이 `math.js`, `geometry.js`, `cart-model.js`, `renderer.js`, `app.js`로 분리했습니다.
- 일반 `defer` 로딩으로 기존 의존 순서와 `CartLab` 네임스페이스를 유지했습니다.
- 중복 내장 JPEG를 재압축 없이 `assets/images/reference.jpg` 하나로 추출하고 두 이미지 요소에서 공유합니다.
- 인라인 파비콘을 `assets/icons/favicon.svg`로 추출했습니다.
- 도메인 루트와 저장소 하위 경로에 대응하도록 상대 경로를 사용했습니다.
- `.nojekyll`, 영문·한국어 README, 원본 일치 기록, 검증 기록, 선택 실행하는 Node.js 검사 스크립트를 추가했습니다.
- 기존 미리보기 이미지는 이전 버전의 미리보기임을 명시해 README에 유지했습니다.
- 빌드 도구, CDN, 런타임 의존성, 백엔드, 센서 연결, 하드웨어 제어를 추가하지 않았습니다.
- 형상, 재질, 셰이더, 조작 기능, 라벨, 치수 및 모델링 가정은 변경하지 않았습니다. 모델링·렌더링 개선이 아닌 파일 구성 변경입니다.

## Verification boundary / 검증 범위

See [QA](docs/QA.md). Source and generated-model parity were verified. New GPU rendering, interactive control, and PNG export validation were blocked by WebGL context creation failure in the test environment; they are not reported as passed.

[검증 기록](docs/QA.md)을 참고하세요. 소스 및 생성 모델의 동일성은 확인했습니다. 테스트 환경의 WebGL 컨텍스트 생성 실패로 실제 GPU 렌더링·뷰어 조작·PNG 저장 재검증은 수행하지 못했으며, 통과한 것으로 표기하지 않습니다.
