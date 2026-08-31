# 행간 배포 가이드

이 폴더 전체가 하나의 웹앱이에요. 아래 순서대로 따라오시면 돼요.

## 1. GitHub에 올리기

1. github.com에서 로그인
2. 오른쪽 위 `+` 버튼 → `New repository` 클릭
3. 이름을 `haenggan`으로 입력하고 `Create repository` 클릭
4. 만들어진 저장소 페이지에서 `uploading an existing file` 링크 클릭
5. 이 폴더 안의 파일을 **전부 다** (폴더 구조 그대로) 화면에 드래그 앤 드롭
   - 단, `node_modules` 폴더는 없으니 신경 안 쓰셔도 돼요
6. 아래 `Commit changes` 버튼 클릭

## 2. Vercel로 배포하기

1. vercel.com 접속 → `Continue with GitHub`로 로그인 (자동으로 계정 연동)
2. `Add New...` → `Project` 클릭
3. 방금 만든 `haenggan` 저장소 선택 → `Import` 클릭
4. 배포 설정 화면에서 `Environment Variables` 항목을 펼치고 아래처럼 입력:
   - Name: `ANTHROPIC_API_KEY`
   - Value: 발급받은 본인의 API 키 값
5. `Deploy` 버튼 클릭 (1~2분 정도 걸려요)

## 3. 완성

배포가 끝나면 `haenggan-xxxx.vercel.app` 같은 주소가 생겨요. 그 주소로 들어가면 바로 앱이 열리고, 이 주소를 카톡에 붙여넣으면 눌러서 바로 쓸 수 있어요.

## 나중에 코드를 고치고 싶다면

GitHub 저장소 안에서 파일을 열어 연필 아이콘을 누르면 웹에서 바로 수정할 수 있고, 저장(`Commit`)하면 Vercel이 자동으로 다시 배포해줘요.
