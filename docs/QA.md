# QA / 검증 기록

## Scope / 범위

This report covers the conversion of the supplied `Smart-Cart-Studio.html` into a static multi-file package. No GitHub repository was modified or published. The source is identified by SHA-256 in [refactor-manifest.json](refactor-manifest.json).

제공된 `Smart-Cart-Studio.html`의 정적 다중 파일 변환을 검증한 기록입니다. GitHub 저장소 수정이나 공개 배포는 수행하지 않았습니다. 원본 파일의 SHA-256은 [refactor-manifest.json](refactor-manifest.json)에 기록했습니다.

## Passed / 통과

| Check / 검사 | Result / 결과 |
| --- | --- |
| JavaScript source parity / JS 원문 일치 | All five files exactly match the five original inline blocks. / 원본 블록 5개와 정확히 일치 |
| CSS source parity / CSS 원문 일치 | `css/styles.css` exactly matches the original style block. / 원본 스타일 블록과 정확히 일치 |
| JavaScript syntax and script order / JS 구문·순서 | Five classic scripts pass syntax checks and retain ordered `defer` loading. / 5개 스크립트 구문 및 순차 로딩 확인 |
| Reference image / 참조 이미지 | Original embedded JPEG decoded once, without recompression. / 기존 내장 JPEG를 재압축 없이 추출 |
| Generated model / 생성 모델 | 816 primitives, 444,288 vertices, 148,096 triangles; identical buffer and metadata. / 형상·정점 버퍼·구성 정보 동일 |
| Finite geometry / 형상 수치 유효성 | All generated vertex values are finite. / 모든 정점 데이터에 비정상 수치 없음 |
| Static HTTP resources / 정적 HTTP 파일 | Entry HTML and eight unique assets returned HTTP 200 from a local server. / 진입 HTML 및 고유 에셋 8개 모두 HTTP 200 |
| Relative paths / 상대 경로 | Domain-root and repository-subpath URL resolution checked; no root-absolute app assets. / 루트 및 저장소 하위 경로 해석 확인 |
| Browser resource loading / 브라우저 파일 로딩 | CSS, five scripts, and reference JPEG loaded under a synthetic repository base using actual local HTTP responses. / 저장소 경로를 기준으로 CSS·JS·이미지 로딩 확인 |
| Desktop layout / 데스크톱 배치 | 1440 × 960: no document-level horizontal overflow. / 문서 가로 넘침 없음 |
| Tablet layout / 태블릿 배치 | 820 × 1180: no document-level horizontal overflow. / 문서 가로 넘침 없음 |
| Mobile layout / 모바일 배치 | 390 × 844: no document-level horizontal overflow. / 문서 가로 넘침 없음 |
| Initialization fallback / 초기화 실패 대응 | When WebGL 2 was unavailable, the fallback was shown, loading hidden, and capture disabled. / 오류 안내·로딩 해제·저장 버튼 비활성화 확인 |
| Resource failures / 리소스 로딩 실패 | None in the completed resource-loading checks. / 완료한 파일 로딩 검사에서 없음 |

Vertex buffer SHA-256 / 정점 버퍼 SHA-256:

```text
a53690b9e1cb1d2360a749d66866db23372f76bf38abd74462b50d3d210789ba
```

## Not verified / 미검증

The installed Chromium `144.0.7559.96` could not create a WebGL 2 context for either the original or split version. Navigation is also restricted in this environment, so document-loading checks used an injected document with a repository-relative base and intercepted asset requests fulfilled from the actual local HTTP server. Browser policies were not modified.

설치된 Chromium `144.0.7559.96`에서 원본·분리본 모두 WebGL 2 컨텍스트를 생성하지 못했습니다. 이 환경에서는 브라우저 탐색도 제한되어, 문서를 주입하고 저장소 상대 경로를 기준으로 실제 로컬 HTTP 서버의 파일 응답을 연결해 리소스 로딩을 검사했습니다. 브라우저 정책은 수정하지 않았습니다.

Therefore, this release does **not** claim new rendered-frame comparison, camera/selection interaction, sensor animation, fullscreen, PNG export, or device-level Safari/Firefox testing. The layout checks above apply to the loaded interface in the WebGL-unavailable state. Source and generated-model identity are verified, but are not a substitute for a hardware-enabled browser test.

따라서 이번 작업에서 렌더링 프레임 비교, 카메라·부품 선택 조작, 센서 애니메이션, 전체 화면, PNG 저장, 실제 기기의 Safari·Firefox 테스트를 새로 완료했다고 주장하지 않습니다. 위 레이아웃 검사는 WebGL 비활성 상태의 로드된 UI를 대상으로 했습니다. 소스와 생성 모델의 동일성 확인은 실제 그래픽 가속 환경의 브라우저 테스트를 대체하지 않습니다.

The README preview is the image supplied with the original single-file version. It is not presented as a screenshot from the current verification run.

README 미리보기는 기존 단일 파일 버전과 함께 제공된 이미지이며, 이번 검증에서 촬영한 이미지가 아닙니다.

## Re-run static checks / 정적 검사 재실행

```sh
node tests/validate.mjs
```

Requires Node.js only, with no npm packages. Checks syntax, dependency order, local paths, required files, finite model geometry, and component metadata. It is optional and not part of deployment.

Node.js만 필요하며 npm 패키지는 필요하지 않습니다. 구문, 의존 순서, 로컬 경로, 필수 파일, 형상 수치, 구성 요소를 검사합니다. 배포 시 반드시 실행해야 하는 단계는 아닙니다.

## On-device acceptance / 실제 기기 확인

After deployment, open the published URL in a WebGL 2-capable browser, confirm that the loading overlay disappears and the cart is visible, then check product/sensor/underside views, orbit/zoom/pan, component selection, exploded assembly, cover opening, theme and quality settings, and PNG saving. In the console, `window.__cartReady === true` indicates a completed first frame. `CartStudio.stats()` returns model statistics after successful initialization.

배포 후 WebGL 2를 지원하는 브라우저에서 로딩이 사라지고 카트가 보이는지 확인한 다음, 제품·센서·하부 보기, 회전·확대·이동, 부품 선택, 분해 보기, 커버 열기, 배경·해상도 설정, PNG 저장을 확인합니다. 콘솔에서 `window.__cartReady === true`는 첫 프레임 완료를 의미합니다. 초기화 성공 후 `CartStudio.stats()`로 모델 통계를 확인할 수 있습니다.
