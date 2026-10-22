# GTR Partner Network V8 — 웹사이트 배포 안내

## 이번 버전 변경 사항

- **모바일 첫 화면**에서 `$2,400 (10%) / bộ`가 보이도록 변경. 기준 판매가격은 GTR STANDARD 정가 $24,000. 실제 계약 할인 등은 별도 정산.
- `Apply as a partner` 대신 각 언어에 맞게 **"나도 수수료 벌고 싶어요!"**에 해당하는 행동 유도 문구 사용.
- 모바일에서는 첫 화면 신청 버튼으로 **신청서 팝업**을 즉시 엽니다. PC에서는 페이지의 신청서로 이동합니다.
- 신청서 입력: 이름, 지역, 전화번호, **Zalo/WeChat/WhatsApp 선택 및 ID**, 이메일(선택), 직업(선택), 메모, 파트너 소개 코드, 개인정보 처리 동의.
- 신청서 제출은 브라우저에서 **`/api/apply` → Vercel 서버 → Google Apps Script → 비공개 Google Sheets** 순서로 전송되며, Apps Script가 이메일 알림을 보냅니다.
- 베트남어 / 중국어 간체 / 영어 제공. 기존 GTR 제품, Wix 비교 카드, Wix 설치 사례 링크 등은 유지.

## 파일 업로드

1. 기존 GitHub 저장소 `zotdd/gtr-partner-network`를 GitHub Desktop으로 클론합니다. `my-ai-tools` (ClipForge) 저장소는 건드리지 않습니다.
2. 이 ZIP을 압축 해제하고 **ZIP 안의 파일 및 폴더 전체**를 로컬 `gtr-partner-network` 폴더에 복사합니다. `index.html`, `assets/`, `api/`, `package.json`이 저장소 최상위에 있어야 합니다. `.git` 폴더는 삭제하지 않습니다.
3. GitHub Desktop에서 Commit → Push origin을 눌러 업데이트합니다.
4. 기존 Vercel `gtr-partner-network` 프로젝트는 자동으로 재배포됩니다. Vercel Application Preset은 `Other`, 루트는 `./`이며, `api/apply.js`는 Vercel의 Node.js Function으로 실행됩니다.
5. **아래 Google Sheets 연결 전에는 신청 데이터가 저장되지 않습니다.** 사이트에서 오류를 표시하는 것이 정상입니다.

## Google Sheets 연결

별도 다운로드한 `GTR_Google_Sheets_Setup.zip` 내부 `SETUP_KO.md`를 따라 하세요. 그곳에 Google Apps Script `Code.gs`가 들어 있습니다. 필요한 Vercel Production 환경변수는 아래 두 개입니다.

- `GTR_SHEETS_WEBHOOK_URL` = 본인이 Google Apps Script에서 배포한 `https://script.google.com/macros/s/.../exec` URL
- `GTR_WEBHOOK_SECRET` = 본인이 생성한 강한 무작위 비밀 문자열. Google Apps Script의 Script Properties에 **똑같은 값**을 등록합니다.

이 두 값은 **Vercel Environment Variables / Google Apps Script Script Properties에만** 저장하고 GitHub 파일이나 화면 캡처에 넣지 마세요. 새 변수 등록 후 Vercel Production Redeploy가 필요합니다.

## 공개 전 확인할 점

- 사이트의 신청서를 실제로 제출하고, Google Sheets `Applications` 탭에 새 행이 생성되는지 확인합니다.
- 알림 이메일 수신을 확인합니다. 안 오더라도 시트에 저장됐다면 신청은 접수된 것입니다. 메일 발송은 Google의 일일 전송 한도가 적용됩니다.
- 입력값이 개인정보이므로 스프레드시트의 공유 설정은 **제한됨(Restricted)**으로 둡니다. 누구나 보는 시트로 공개하지 마세요.
- 자동 봇 가입이 많아지면 Turnstile과 속도 제한, 개인정보 보관·삭제 정책을 추가해야 합니다.
- 수수료 승급 구간은 기존 V7/V6 제안 초안을 유지합니다. 기본 10%, 최고 15%, 36대부터 15%는 사업상 확정 검토가 필요합니다. 가격·총판 지원 범위도 D&G와 계약 조건을 확인하세요.
- Vercel Hobby는 상업적 운영에 제한이 있어 정식 사업용 공개 시 적합한 플랜을 선택해야 합니다.

## 검수 체크리스트

- 모바일 폭 390px에서 $2,400 (10%) 및 주요 CTA가 첫 화면에 표시되는지
- CTA 클릭 → Zalo/WeChat/WhatsApp 선택 가능한 신청서 즉시 표시되는지
- 개인정보 동의 없이 제출이 차단되는지
- 베트남어/中文/EN 전환 시 필드 이름과 버튼이 바뀌는지
- Google Sheets에 저장되는 정보와 이메일 알림이 일치하는지
- 실제 고객에게 공개하기 전에 자체 테스트 데이터 삭제
