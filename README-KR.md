# Smart Cart Studio

[English](README.md) | [한국어](README-KR.md)

다중 센서 융합 기반 사용자 추종형 스마트 카트를 사진 기반으로 재구성한 정적 WebGL 2 뷰어입니다. 기존 단일 HTML을 HTML, CSS, JavaScript, 이미지 파일로 분리했으며, 렌더링 및 조작 코드는 변경하지 않았습니다.

![기존 Smart Cart Studio 미리보기](assets/images/preview.png)

*기존 단일 HTML 버전과 함께 제공된 미리보기입니다. 이번 분리 작업에서 새로 촬영한 렌더링 검증 이미지는 아닙니다.*

## 로컬 실행

ZIP 전체를 풀고 폴더 구조를 유지한 상태로 프로젝트 폴더에서 실행합니다.

```sh
python -m http.server 8000
```

브라우저에서 `http://localhost:8000/`을 엽니다. Windows에서 Python Launcher가 설치되어 있다면 `py -m http.server 8000`도 사용할 수 있습니다. Python 서버는 로컬 확인용이며, GitHub Pages 배포에는 필요하지 않습니다.

npm 설치, 번들러, 빌드, API 키, CDN, 백엔드가 필요하지 않습니다. JavaScript와 WebGL 2 컨텍스트 생성이 가능한 브라우저·기기가 필요합니다. 로컬 확인에는 HTTP 서버 사용을 권장하며, 이번 버전에서 `file://` 직접 실행을 새로 검증했다고 주장하지 않습니다.

## GitHub Pages 배포

1. 이 폴더 **안의 파일과 폴더**를 저장소 최상위에 업로드합니다. `index.html`, `css/`, `js/`, `assets/`, `.nojekyll`이 같은 위치에 있어야 합니다. ZIP 자체만 올리거나, 배포 루트 아래에 `Smart-Cart-Studio/` 폴더를 한 겹 더 넣지 않습니다.
2. **Settings > Pages > Build and deployment**에서 **Source**를 **Deploy from a branch**로 선택합니다.
3. 파일을 올린 브랜치, 일반적으로 **main**을 선택하고 폴더를 **/(root)**로 지정한 다음 저장합니다.

접속 주소는 저장소의 Pages 설정 화면에 표시되는 주소를 사용합니다. 일반적인 프로젝트 페이지 주소 형식은 다음과 같습니다.

```text
https://<username>.github.io/<repository>/
```

앱이 불러오는 파일에는 모두 `./` 상대 경로를 적용했습니다. 사용자명, 도메인, 저장소명이나 `/js/`, `/css/`처럼 도메인 최상위를 가리키는 경로를 하드코딩하지 않았습니다. 이 브랜치 기반 구성에는 별도 Actions 워크플로가 필요하지 않으며, `.nojekyll`은 Jekyll 처리 없이 정적 파일을 게시하기 위한 파일입니다.

공식 안내: [배포 소스 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [GitHub Pages 사이트 생성](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

이 ZIP은 배포용 파일 묶음입니다. 사용자의 GitHub 계정에 업로드·푸시·배포 작업을 수행하지 않습니다.

## 폴더 구성

```text
Smart-Cart-Studio/
  index.html                 페이지 구조 및 스크립트 연결
  .nojekyll                  GitHub Pages 정적 배포 표시
  .gitignore
  css/
    styles.css               기존 스타일과 반응형 구성
  js/
    math.js                  벡터·행렬·변환·색상 연산
    geometry.js              기본 형상과 절차적 메시 생성
    cart-model.js            카트 조립체·재질·라벨·구성 정보
    renderer.js              WebGL 2 셰이더·카메라·렌더링·선택
    app.js                   UI 이벤트·상태·대화상자·PNG 저장
  assets/
    icons/favicon.svg
    images/reference.jpg     기존 내장 참조 이미지를 중복 없이 추출
    images/preview.png       기존 단일 파일 버전의 미리보기
  docs/
    QA.md                    검증 범위와 제한 사항
    refactor-manifest.json   원본 및 추출 파일의 SHA-256 해시
  tests/
    validate.mjs             선택 실행하는 정적·모델 검사
  README.md
  README-KR.md
  CHANGELOG.md
```

JS는 기존 `window.CartLab` 네임스페이스를 유지하며, 위 순서대로 일반 `defer` 스크립트로 로드합니다. 의존성을 리팩터링하지 않은 채 `async`를 추가하거나 로드 순서를 바꾸거나 일부 파일만 `type="module"`로 전환하지 않습니다. 기존 네이티브 WebGL 2 렌더러를 유지했으며 Three.js로 교체하지 않았습니다.

## 유지된 조작 기능

마우스 드래그로 회전, 휠로 확대·축소, 우클릭 드래그로 이동합니다. 터치에서는 회전, 핀치 확대·축소, 두 손가락 이동을 사용합니다. 제품·센서·하부 보기, 부품 선택, 분해 보기, 커버 열기, 카메라 프리셋, 라벨, 그리드, 자동 회전, 배경 전환, 조명 밝기, 렌더 해상도, 원본·도움말 대화상자, 전체 화면 요청, PNG 저장 코드가 그대로 포함되어 있습니다.

키보드에서는 `0`으로 초기 시점, `1`·`2`·`3`으로 제품·센서·하부 보기를 선택하고 `A`·`L`·`G`로 자동 회전·라벨·그리드를 전환합니다.

## 검증

Node.js가 설치되어 있다면 다음 선택 검사를 실행할 수 있습니다.

```sh
node tests/validate.mjs
```

JS 구문과 로드 순서, 상대 경로, 참조 파일 존재 여부, 실제 절차적 모델 생성을 검사합니다. npm 의존성은 없으며, 사이트 배포나 실행에 필요한 단계는 아닙니다.

분리한 JS와 CSS는 원본 인라인 내용과 정확히 일치합니다. 생성된 정점 버퍼와 구성 요소 정보도 동일합니다. 로컬 HTTP 파일 응답 및 브라우저 리소스 로딩 검사는 통과했습니다. 현재 테스트 환경에서는 원본·분리본 모두 WebGL 2 컨텍스트를 생성하지 못했으므로, 이번 작업에서 실제 GPU 렌더링과 조작 기능을 새로 검증했다고 주장하지 않습니다. [검증 기록](docs/QA.md)과 [변경 내역](CHANGELOG.md)을 참고하세요.

## 문제 해결

Pages에서 404가 나오면 배포 브랜치·폴더와 `index.html`의 위치를 확인합니다. 스타일이 깨지거나 스크립트를 찾지 못하면 모든 폴더를 올렸는지, 파일명의 대소문자가 일치하는지, `css/styles.css`·`js/app.js` 등 요청이 성공하는지 확인합니다. Git으로 커밋할 때 `.nojekyll`도 포함합니다. 기존 배포를 교체한 뒤에는 캐시를 무시하고 새로고침합니다.

WebGL 초기화 오류 안내가 나오면 실제 기기에서 브라우저 그래픽 가속 설정 및 WebGL 2 지원 여부를 확인합니다. 기존 오류 안내와 PNG 저장 버튼 비활성화 처리는 그대로 유지했습니다. HTML이 정상 응답한다는 것과 해당 기기에서 WebGL 2를 렌더링할 수 있다는 것은 별개입니다.

## 모델의 범위

제공된 FreeCAD 스크린샷과 설명을 기반으로 한 절차적 재구성입니다. FreeCAD·STEP 원본을 가져온 모델이 아닙니다. 치수, 보이지 않는 구조, 센서 하우징과 일부 배치는 시각적 추정입니다. 센서 광선과 사용자 태그는 설명용 그래픽이며 실측 데이터가 아닙니다. 웹사이트에서 ROS 2 실행, 센서 연결, 모터 제어, 구조·제동·탑승·전도 안전성 검증을 수행하지 않습니다. 이번 파일 분리 작업에서 새로운 라이선스를 임의로 부여하지 않았습니다.
