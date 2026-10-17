# VINYL — External API Integration Plan (`plan.md`)

이 문서는 **VINYL (Burgundy Music Journal)** 크롬 확장 프로그램에 다음 3가지 외부 데이터를 연동하기 위한 아키텍처 및 단계별 구현 계획서입니다.

1. **인스타그램(Instagram) 오늘의 앨범/노래 리뷰 게시물 자동 동기화**
2. **신곡 및 앨범 출시 예정(Upcoming Releases) API 연동**
3. **콘서트 및 티켓 예매 일정(Live & Tickets) API 연동**

---

## 1. Instagram 게시물 리뷰 자동 반영 계획

인스타그램에 오늘의 추천 앨범이나 곡 리뷰를 업로드하면, 확장 프로그램의 **`TODAY` 탭 (오늘의 앨범 + 리뷰 영역)**에 자동으로 반영되도록 구성합니다.

### 1.1 사용 가능한 API 옵션 비교

| 방식 | 대상 계정 | 인증 및 난이도 | 특징 |
| :--- | :--- | :--- | :--- |
| **옵션 A: Instagram Graph API (권장)** | 인스타그램 프로페셔널 (크리에이터/비즈니스) 계정 | Meta Developer 앱 생성 + Long-Lived User Access Token (60일 주기 갱신) | 공식 API로 가장 안정적. 본문(`caption`), 이미지(`media_url`), 게시일(`timestamp`) 조회 가능 |
| **옵션 B: 서드파티 JSON 피드 브릿지 (Behold.so / RSS.app)** | 프로페셔널 또는 연동된 계정 | 간단한 JSON Feed URL 1개 발급 (API 키 노출 걱정 적음) | 백엔드 서버 없이 크롬 확장 프로그램에서 `fetch(FEED_URL)`만으로 즉시 JSON 파싱 가능 |

### 1.2 캡션(본문) 파싱 규칙 설계
인스타그램 게시물 캡션을 일정한 포맷으로 작성하면 앨범 메타데이터와 리뷰 본문을 정확히 분리할 수 있습니다.

```text
[Album] (What's the Story) Morning Glory? - Oasis
오늘의 추천 명반! 첫 트랙부터 마지막 곡까지 브릿팝의 정수를 느낄 수 있는 앨범.
#오아시스 #오늘의음악 #음스타그램
```

1. **1행 파싱 (`[Album] 앨범명 - 아티스트`)**:
   - 캡션 첫 줄에서 `앨범명`과 `아티스트`를 추출합니다.
   - 추출된 키워드로 **iTunes Search API**를 자동 호출하여 고화질 앨범 커버, 발매 연도, 장르, 전체 세트리스트(트랙 목록)를 함께 채웁니다.
2. **본문 추출**:
   - 해시태그(`#`)로 시작하는 줄을 제외한 본문 전체를 **이번 음악에 대한 리뷰** 영역에 반영합니다.

### 1.3 구현 단계 (Phase 1)
1. Meta for Developers에서 앱 생성 후 `instagram_basic` 권한으로 장기 실행 토큰(Long-Lived Token) 발급
2. `GET https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp&limit=1&access_token={TOKEN}` 호출 모듈 작성
3. `chrome.storage.local`에 마지막 동기화 게시물 ID(`lastSyncedMediaId`)를 저장하여 새 게시물이 올라왔을 때만 자동 갱신

---

## 2. 앨범 및 음원 출시 예정 (RELEASES 탭) API 연동 계획

### 2.1 추천 API 조합
1. **Apple Music / iTunes Search & RSS Feed API**
   - **특징**: 별도 인증 키 없이 `https://itunes.apple.com/search` 및 Apple Music RSS Feed(`https://rss.marketingtools.apple.com/api/v2/kr/music/most-played/25/albums.json`)를 통해 국내외 최신 발매 앨범 조회 가능
2. **Spotify Web API (`New Releases` & Artist Albums)**
   - **엔드포인트**: `GET https://api.spotify.com/v1/browse/new-releases?country=KR`
   - **특징**: 정밀한 발매일(`release_date`), 앨범 타입(`album`, `single`), 커버 아트워크 제공
3. **MusicBrainz API (미발매/예정 캘린더 보완)**
   - **엔드포인트**: `GET https://musicbrainz.org/ws/2/release?query=date:[2026-10-17 TO 2026-12-31]&fmt=json`
   - **특징**: 무료 오픈 API로 미래 발매 예정일(`status: Promotion / Official`)로 등록된 글로벌/국내 릴리즈 스케줄 조회 가능

### 2.2 구현 단계 (Phase 2)
1. `src/services/releaseApi.js` 모듈 분리
2. iTunes API + MusicBrainz 향후 발매일 쿼리를 병합하여 날짜순 정렬
3. 사용자가 벨(`Bell`) 아이콘을 켜둔 항목의 발매일이 도래하면 `chrome.alarms` + `chrome.notifications`로 브라우저 푸시 알림 발송

---

## 3. 콘서트 및 티켓 예매 정보 (LIVE & TICKETS 탭) API 연동 계획

### 3.1 추천 API 조합
1. **국내 공연: KOPIS (공연예술통합전산망) Open API (필수 권장)**
   - **제공처**: 문화체육관광부 / 예술경영지원센터 ([kopis.or.kr](https://www.kopis.or.kr/por/cs/openapi/openApiInfo.do))
   - **엔드포인트**: `GET http://www.kopis.or.kr/openApi/restful/pblprfr`
   - **주요 파라미터**:
     - `service`: 발급받은 인증키
     - `stdate` / `eddate`: 조회 시작일~종료일 (예: `20261001` ~ `20261231`)
     - `shcate`: `CCCD` (대중음악/콘서트 장르 코드)
   - **제공 데이터**: 공연명(`prfnm`), 공연 기간(`prfpdfrom`~`prfpdto`), 공연장(`fcltynm`), 공연 상태(`prfstate`), 상세 조회 시 **인터파크/멜론티켓/YES24 등 공식 예매처 직접 링크(`relates`)** 제공
2. **해외/글로벌 투어: Ticketmaster Discovery API 또는 Bandsintown API**
   - **엔드포인트**: `GET https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&apikey={KEY}`
   - **특징**: Oasis, Coldplay 등 해외 밴드/아티스트의 내한 및 월드 투어 일정과 티켓 링크를 실시간으로 조회 가능

### 3.2 CORS 및 XML 파싱 처리 방안
- KOPIS Open API는 기본적으로 XML 응답을 반환하므로, 브라우저 내장 `DOMParser`를 사용해 XML을 JSON 구조로 변환합니다.
- 크롬 확장 프로그램의 `manifest.json` 내 `host_permissions`에 `"*://*.kopis.or.kr/*"`를 추가하면 별도의 프록시 서버 없이도 팝업/백그라운드에서 CORS 제약 없이 직접 호출할 수 있습니다.

---

## 4. 백그라운드 알림 (`chrome.alarms`) 연동 구조

1. `public/background.js` (Service Worker) 추가
2. 하루 1~2회 주기적 알람(`chrome.alarms.create("vinyl-check", { periodInMinutes: 360 })`) 실행
3. `settings.notifyEnabled`가 켜져 있을 때:
   - `notifyReleases === true`: 오늘 발매되는 관심 앨범이 있으면 브라우저 알림 표시
   - `notifyConcerts === true`: 티켓 예매 오픈일 또는 공연 당일 리마인더 알림 표시
