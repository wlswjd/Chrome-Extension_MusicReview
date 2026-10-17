import { useEffect, useState } from "react";
import {
  Disc3,
  CalendarDays,
  Ticket,
  Star,
  ExternalLink,
  Pencil,
  Check,
  X,
  Sparkles,
  CalendarClock,
  DiscAlbum,
  ListMusic,
  Search,
  Settings,
  Bell,
  BellOff,
  RefreshCw,
  Clock3,
  ArrowLeftRight
} from "lucide-react";

const STORAGE_VERSION = "v3";

// 오아시스 정규 2집: (What's the Story) Morning Glory? 기본 데이터
const initialAlbum = {
  title: "(What's the Story) Morning Glory?",
  artist: "Oasis",
  year: "1995",
  releaseDate: "1995. 10. 02",
  genre: "Britpop · Rock",
  duration: "50분 06초",
  subtitle: "2ND STUDIO ALBUM",
  activeTrackIndex: 3, // Don't Look Back in Anger
  coverUrl: "",
  tracks: [
    "Hello",
    "Roll with It",
    "Wonderwall",
    "Don't Look Back in Anger",
    "Hey Now!",
    "[Untitled] (The Swamp Song Excerpt 1)",
    "Some Might Say",
    "Cast No Shadow",
    "She's Electric",
    "Morning Glory",
    "[Untitled] (The Swamp Song Excerpt 2)",
    "Champagne Supernova"
  ]
};

const initialReview =
  "90년대 브릿팝의 정점을 찍은 오아시스의 명반.\n'Wonderwall'과 'Don't Look Back in Anger'로 이어지는 흐름은 언제 들어도 가슴이 벅차오른다.\n마지막 트랙 'Champagne Supernova'의 긴 여운까지 단 한 곡도 버릴 곡이 없는 완벽한 앨범!";

const initialReleases = [
  {
    id: "rel-1",
    date: "10. 21",
    year: "2026",
    artist: "IVE (아이브)",
    title: "3rd EP [EMPATHY]",
    type: "컴백 예정",
    genre: "K-Pop · Dance",
    notified: true
  },
  {
    id: "rel-2",
    date: "10. 24",
    year: "2026",
    artist: "DAY6 (데이식스)",
    title: "Digital Single [Autumn Letter]",
    type: "신곡 공개",
    genre: "Band · Rock",
    notified: true
  },
  {
    id: "rel-3",
    date: "10. 30",
    year: "2026",
    artist: "LE SSERAFIM",
    title: "Mini Album [HOT & COOL]",
    type: "컴백 예정",
    genre: "Pop · R&B",
    notified: false
  },
  {
    id: "rel-4",
    date: "11. 04",
    year: "2026",
    artist: "백예린 (Yerin Baek)",
    title: "Single [Midnight Vinyl]",
    type: "음원 발매",
    genre: "Indie · R&B",
    notified: true
  },
  {
    id: "rel-5",
    date: "11. 11",
    year: "2026",
    artist: "태연 (TAEYEON)",
    title: "6th Mini Album [Winter Rose]",
    type: "정규/미니",
    genre: "발라드 · 팝",
    notified: false
  }
];

const initialConcerts = [
  {
    id: "con-1",
    artist: "Oasis",
    title: "OASIS LIVE '26 WORLD TOUR IN SEOUL",
    date: "2026. 10. 21",
    venue: "고양종합운동장 주경기장",
    status: "예매 진행중",
    platform: "인터파크 티켓",
    url: "https://tickets.interpark.com/",
    notified: true
  },
  {
    id: "con-2",
    artist: "아이유 (IU)",
    title: "2026 IU HEREH WORLD TOUR CONCERT ENCORE",
    date: "2026. 11. 14 – 11. 15",
    venue: "KSPO DOME (올림픽체조경기장)",
    status: "예매 오픈 D-5",
    platform: "멜론티켓",
    url: "https://ticket.melon.com/",
    notified: true
  },
  {
    id: "con-3",
    artist: "DAY6 (데이식스)",
    title: "DAY6 CONCERT [THE PRESENT : AUTUMN]",
    date: "2026. 12. 05 – 12. 07",
    venue: "고척스카이돔",
    status: "티켓 오픈 예정",
    platform: "YES24 티켓",
    url: "https://ticket.yes24.com/",
    notified: false
  }
];

const initialSettings = {
  notifyEnabled: true,
  notifyReleases: true,
  notifyConcerts: true,
  notifyDailyReview: false
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(`${key}-${STORAGE_VERSION}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function formatYear(isoDate) {
  if (!isoDate) return "1995";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return String(isoDate).slice(0, 4);
  return String(d.getFullYear());
}

function formatShortMonthDay(isoDate) {
  if (!isoDate) return "10. 25";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "10. 25";
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}. ${day}`;
}

function formatDurationMs(totalMs) {
  if (!totalMs || totalMs <= 0) return "45분 12초";
  const totalSec = Math.round(totalMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = String(totalSec % 60).padStart(2, "0");
  return `${mins}분 ${secs}초`;
}

export default function App() {
  const [album, setAlbum] = useState(() => readStorage("vinyl-album", initialAlbum));
  const [review, setReview] = useState(() => readStorage("vinyl-review", initialReview));
  const [releases, setReleases] = useState(() => readStorage("vinyl-releases", initialReleases));
  const [concerts, setConcerts] = useState(() => readStorage("vinyl-concerts", initialConcerts));
  const [settings, setSettings] = useState(() => readStorage("vinyl-settings", initialSettings));

  const [activeView, setActiveView] = useState("home");
  const [showSettings, setShowSettings] = useState(false);

  // 앨범 메인 사진 <-> 세트리스트 스왑 상태 ("album" | "setlist")
  const [cardSide, setCardSide] = useState("album");

  const [editingReview, setEditingReview] = useState(false);
  const [reviewDraft, setReviewDraft] = useState(review);

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumModalTab, setAlbumModalTab] = useState("api"); // "api" | "manual"
  const [albumDraft, setAlbumDraft] = useState(album);

  // iTunes Album Search state
  const [apiSearchQuery, setApiSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [syncingReleases, setSyncingReleases] = useState(false);
  const [syncingConcerts, setSyncingConcerts] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(`vinyl-album-${STORAGE_VERSION}`, JSON.stringify(album));
  }, [album]);

  useEffect(() => {
    localStorage.setItem(`vinyl-review-${STORAGE_VERSION}`, JSON.stringify(review));
  }, [review]);

  useEffect(() => {
    localStorage.setItem(`vinyl-releases-${STORAGE_VERSION}`, JSON.stringify(releases));
  }, [releases]);

  useEffect(() => {
    localStorage.setItem(`vinyl-concerts-${STORAGE_VERSION}`, JSON.stringify(concerts));
  }, [concerts]);

  useEffect(() => {
    localStorage.setItem(`vinyl-settings-${STORAGE_VERSION}`, JSON.stringify(settings));
  }, [settings]);

  // 최초 실행 시 오아시스 2집 실제 앨범 커버가 비어있다면 iTunes API에서 자동으로 가져옴
  useEffect(() => {
    if (album.artist === "Oasis" && !album.coverUrl) {
      fetch(
        "https://itunes.apple.com/search?term=Oasis+What%27s+the+Story+Morning+Glory&entity=album&limit=1"
      )
        .then((r) => r.json())
        .then((data) => {
          const hit = data?.results?.[0];
          if (hit?.artworkUrl100) {
            const hiRes = hit.artworkUrl100.replace("100x100bb", "500x500bb");
            setAlbum((prev) => ({ ...prev, coverUrl: hiRes }));
          }
        })
        .catch(() => {
          // 오프라인이거나 차단된 경우 내장 앨범 아트워크 유지
        });
    }
  }, []);

  const notify = (message) => {
    setToast(message);
    window.clearTimeout(window.__vinylToastTimer);
    window.__vinylToastTimer = window.setTimeout(() => setToast(""), 2200);
  };

  async function searchAlbumFromApi(e) {
    if (e) e.preventDefault();
    const q = apiSearchQuery.trim();
    if (!q) return;
    setApiLoading(true);
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        q
      )}&country=kr&entity=album&limit=6`;
      const res = await fetch(url);
      const data = await res.json();
      setApiResults(data.results || []);
      if (!data.results?.length) {
        notify("검색된 앨범이 없습니다.");
      }
    } catch {
      notify("앨범 API 조회 중 오류가 발생했습니다.");
    } finally {
      setApiLoading(false);
    }
  }

  async function selectApiAlbum(collection) {
    setApiLoading(true);
    try {
      const lookupUrl = `https://itunes.apple.com/lookup?id=${collection.collectionId}&country=kr&entity=song`;
      const res = await fetch(lookupUrl);
      const data = await res.json();
      const songItems = (data.results || []).filter((item) => item.wrapperType === "track");
      const tracks = songItems.map((t) => t.trackName);
      const totalDurationMs = songItems.reduce(
        (acc, cur) => acc + (cur.trackTimeMillis || 0),
        0
      );

      const highResCover = collection.artworkUrl100
        ? collection.artworkUrl100.replace("100x100bb", "500x500bb")
        : "";

      const updatedAlbum = {
        ...album,
        title: collection.collectionName || album.title,
        artist: collection.artistName || album.artist,
        year: formatYear(collection.releaseDate),
        genre: collection.primaryGenreName || "Pop · Rock",
        duration: formatDurationMs(totalDurationMs),
        coverUrl: highResCover,
        activeTrackIndex: 0,
        tracks: tracks.length > 0 ? tracks : album.tracks
      };

      setAlbum(updatedAlbum);
      setAlbumDraft(updatedAlbum);
      setShowAlbumModal(false);
      setCardSide("album");
      notify("앨범 정보와 세트리스트를 반영했습니다.");
    } catch {
      notify("트랙 정보를 가져오지 못했습니다.");
    } finally {
      setApiLoading(false);
    }
  }

  async function refreshReleasesFromApi() {
    setSyncingReleases(true);
    try {
      const artists = ["Oasis", "IU", "DAY6", "IVE", "LE SSERAFIM", "Coldplay"];
      const randomArtist = artists[Math.floor(Math.random() * artists.length)];
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          randomArtist
        )}&country=kr&entity=album&sort=recent&limit=5`
      );
      const data = await res.json();
      if (data.results?.length) {
        const fetched = data.results.map((item, idx) => ({
          id: `api-${item.collectionId || idx}`,
          date: formatShortMonthDay(item.releaseDate),
          year: formatYear(item.releaseDate),
          artist: item.artistName,
          title: item.collectionName,
          type: item.collectionType === "Album" ? "앨범 발매" : "음원 발매",
          genre: item.primaryGenreName || "Music",
          notified: idx < 2
        }));
        setReleases(fetched);
        notify(`${randomArtist} 관련 발매 정보를 동기화했습니다.`);
      } else {
        setReleases(initialReleases);
        notify("기본 발매 캘린더로 업데이트했습니다.");
      }
    } catch {
      notify("기본 발매 일정을 유지합니다.");
    } finally {
      setSyncingReleases(false);
    }
  }

  function refreshConcertsList() {
    setSyncingConcerts(true);
    window.setTimeout(() => {
      setSyncingConcerts(false);
      notify("공연 및 티켓 일정을 최신 상태로 업데이트했습니다.");
    }, 450);
  }

  function toggleReleaseNotification(id) {
    if (!settings.notifyEnabled || !settings.notifyReleases) {
      notify("설정(⚙️)에서 출시 알림이 꺼져 있습니다.");
      return;
    }
    setReleases((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = !item.notified;
        notify(next ? `${item.artist} 출시 알림을 켰습니다.` : "출시 알림을 해제했습니다.");
        return { ...item, notified: next };
      })
    );
  }

  function toggleConcertNotification(id) {
    if (!settings.notifyEnabled || !settings.notifyConcerts) {
      notify("설정(⚙️)에서 콘서트 알림이 꺼져 있습니다.");
      return;
    }
    setConcerts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = !item.notified;
        notify(next ? `${item.artist} 공연 알림을 켰습니다.` : "공연 알림을 해제했습니다.");
        return { ...item, notified: next };
      })
    );
  }

  function saveReview() {
    setReview(reviewDraft.trim());
    setEditingReview(false);
    notify("이번 음악에 대한 리뷰를 저장했습니다.");
  }

  function saveManualAlbum(e) {
    e.preventDefault();
    if (!albumDraft.title.trim() || !albumDraft.artist.trim()) return;
    const cleanedTracks = albumDraft.tracks.map((t) => t.trim()).filter(Boolean);
    setAlbum({
      ...albumDraft,
      tracks: cleanedTracks.length ? cleanedTracks : album.tracks,
      activeTrackIndex: 0
    });
    setShowAlbumModal(false);
    notify("오늘의 앨범 정보를 저장했습니다.");
  }

  const filteredReleases = releases.filter((item) =>
    `${item.artist} ${item.title} ${item.genre}`.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="app-shell">
      {/* 상단 헤더: 좌측 브랜드(HeeMusic_icon 반영) + 우측 설정 아이콘 */}
      <header className="topbar">
        <button
          className="brand"
          onClick={() => {
            setShowSettings(false);
            setActiveView("home");
          }}
          aria-label="홈으로"
        >
          <img
            src="./HeeMusic_icon.png"
            alt="VINYL Icon"
            className="brand-logo-img"
          />
          <span className="brand-text">
            <b>VINYL</b>
            <small>YOUR PERSONAL MUSIC JOURNAL</small>
          </span>
        </button>

        <button
          className={`settings-button ${showSettings ? "active" : ""}`}
          title="알림 설정"
          aria-label="설정 열기"
          onClick={() => setShowSettings((v) => !v)}
        >
          <Settings size={17} strokeWidth={2.1} />
          {settings.notifyEnabled && <span className="settings-dot" />}
        </button>
      </header>

      {/* 3개 메인 탭 */}
      <nav className="main-nav">
        <button
          className={activeView === "home" && !showSettings ? "nav-item active" : "nav-item"}
          onClick={() => {
            setShowSettings(false);
            setActiveView("home");
          }}
        >
          <DiscAlbum size={13} />
          <span>TODAY</span>
        </button>
        <button
          className={activeView === "releases" && !showSettings ? "nav-item active" : "nav-item"}
          onClick={() => {
            setShowSettings(false);
            setActiveView("releases");
          }}
        >
          <CalendarDays size={13} />
          <span>RELEASES</span>
        </button>
        <button
          className={activeView === "concerts" && !showSettings ? "nav-item active" : "nav-item"}
          onClick={() => {
            setShowSettings(false);
            setActiveView("concerts");
          }}
        >
          <Ticket size={13} />
          <span>LIVE & TICKETS</span>
        </button>
      </nav>

      {/* 설정 화면 (알림 시간대 및 작성자 표기 제외, 깔끔한 알림 토글만 유지) */}
      {showSettings ? (
        <main className="page-content settings-view">
          <div className="settings-card">
            <div className="settings-head">
              <div>
                <span className="kicker">NOTIFICATION SETTINGS</span>
                <h2>알림 설정</h2>
              </div>
              <button className="close-pill" onClick={() => setShowSettings(false)}>
                닫기 <X size={12} />
              </button>
            </div>

            <section className="settings-section">
              <div className="settings-section-title">
                <Bell size={13} />
                <span>음악 출시 · 콘서트 알림 ON/OFF</span>
              </div>

              <label className="toggle-row master">
                <div>
                  <b>전체 알림 활성화</b>
                  <small>출시 일정 및 콘서트 리마인더 알림을 받습니다</small>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifyEnabled}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, notifyEnabled: e.target.checked }))
                  }
                />
                <span className="switch" />
              </label>

              <label className={`toggle-row ${!settings.notifyEnabled ? "disabled" : ""}`}>
                <div>
                  <b>신곡 · 앨범 출시 예정일 알림</b>
                  <small>RELEASES 탭의 관심 앨범 발매 당일 알림</small>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.notifyEnabled}
                  checked={settings.notifyReleases}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, notifyReleases: e.target.checked }))
                  }
                />
                <span className="switch" />
              </label>

              <label className={`toggle-row ${!settings.notifyEnabled ? "disabled" : ""}`}>
                <div>
                  <b>콘서트 · 티켓 예매 오픈 알림</b>
                  <small>LIVE & TICKETS 탭의 공연 예매 일정 알림</small>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.notifyEnabled}
                  checked={settings.notifyConcerts}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, notifyConcerts: e.target.checked }))
                  }
                />
                <span className="switch" />
              </label>

              <label className={`toggle-row ${!settings.notifyEnabled ? "disabled" : ""}`}>
                <div>
                  <b>오늘의 음악 감상 기록 리마인더</b>
                  <small>새로운 추천 앨범과 리뷰 작성 알림</small>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.notifyEnabled}
                  checked={settings.notifyDailyReview}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, notifyDailyReview: e.target.checked }))
                  }
                />
                <span className="switch" />
              </label>
            </section>
          </div>
        </main>
      ) : (
        <>
          {/* 탭 1: TODAY — 상단: [앨범 메인 카드 <-> 세트리스트 스왑] + 하단: [바로 리뷰] */}
          {activeView === "home" && (
            <main className="page-content today-layout">
              {/* 상단 헤더 + 스왑 버튼 + 편집 버튼 */}
              <div className="today-top-bar">
                <div className="today-heading">
                  <span className="overline">YOUR DAILY LISTENING</span>
                  <h1>
                    오늘의 앨범<span>.</span>
                  </h1>
                </div>

                <div className="today-top-actions">
                  <button
                    type="button"
                    className={`swap-view-btn ${cardSide === "setlist" ? "active" : ""}`}
                    onClick={() =>
                      setCardSide((prev) => (prev === "album" ? "setlist" : "album"))
                    }
                    title={
                      cardSide === "album" ? "세트리스트 보기" : "앨범 메인 사진 보기"
                    }
                  >
                    <ArrowLeftRight size={11} />
                    <span>{cardSide === "album" ? "세트리스트" : "앨범 메인"}</span>
                  </button>

                  <button
                    type="button"
                    className="edit-link-btn"
                    onClick={() => {
                      setAlbumDraft({ ...album, tracks: [...album.tracks] });
                      setShowAlbumModal(true);
                    }}
                  >
                    <Pencil size={11} /> 편집하기
                  </button>
                </div>
              </div>

              {/* 스왑 영역: 1) 앨범 큰 메인 카드 OR 2) 세트리스트 카드 */}
              <div className="swappable-stage">
                {cardSide === "album" ? (
                  <section className="hero-album-card">
                    <div
                      className="hero-cover-square"
                      onClick={() => setCardSide("setlist")}
                      title="클릭하면 세트리스트로 전환됩니다"
                    >
                      {album.coverUrl ? (
                        <img
                          src={album.coverUrl}
                          alt={album.title}
                          className="hero-cover-img"
                        />
                      ) : (
                        <div className="hero-cover-poster">
                          <span className="poster-topline">
                            {album.subtitle || "2ND STUDIO ALBUM"}
                          </span>
                          <div className="poster-vinyl-ring">
                            <Disc3 size={56} strokeWidth={0.9} />
                          </div>
                          <strong className="poster-title">{album.title}</strong>
                          <span className="poster-bottom">
                            {album.artist.toUpperCase()} · OFFICIAL ALBUM
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="floating-swap-pill"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardSide("setlist");
                        }}
                      >
                        <ListMusic size={11} /> 세트리스트 보기
                      </button>
                    </div>

                    <div className="hero-meta-content">
                      <div className="hero-kicker-row">
                        <span className="hero-dot" />
                        <span>ALBUM OF THE DAY</span>
                      </div>
                      <h2 className="hero-album-title">{album.title}</h2>
                      <p className="hero-artist-name">{album.artist}</p>

                      <div className="hero-meta-line">
                        <span>{album.year}</span>
                        <i className="dot-sep" />
                        <span>{album.genre}</span>
                      </div>

                      <div className="hero-meta-line sub">
                        <span className="meta-with-icon">
                          <Clock3 size={11} /> {album.duration}
                        </span>
                        <span className="meta-sep">·</span>
                        <button
                          type="button"
                          className="tracks-jump-link"
                          onClick={() => setCardSide("setlist")}
                        >
                          <ListMusic size={11} /> {album.tracks.length} tracks
                        </button>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className="setlist-swap-card">
                    <div className="setlist-card-head">
                      <div>
                        <span className="setlist-kicker">TRACK BY TRACK</span>
                        <h3>
                          세트리스트 <span>{album.tracks.length}</span>
                        </h3>
                      </div>
                      <div className="setlist-head-actions">
                        <button
                          type="button"
                          className="back-to-cover-btn"
                          onClick={() => setCardSide("album")}
                        >
                          <DiscAlbum size={11} /> 앨범 사진으로
                        </button>
                        <button
                          type="button"
                          className="icon-edit-btn"
                          title="세트리스트 편집"
                          onClick={() => {
                            setAlbumDraft({ ...album, tracks: [...album.tracks] });
                            setAlbumModalTab("manual");
                            setShowAlbumModal(true);
                          }}
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    </div>

                    <ol className="setlist-scroll-list">
                      {album.tracks.map((track, idx) => {
                        const isSelected = album.activeTrackIndex === idx;
                        return (
                          <li
                            key={`${track}-${idx}`}
                            className={isSelected ? "active" : ""}
                            onClick={() =>
                              setAlbum((prev) => ({ ...prev, activeTrackIndex: idx }))
                            }
                          >
                            <span className="t-num">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="t-name">{track}</span>
                          </li>
                        );
                      })}
                    </ol>

                    <div className="setlist-card-foot">
                      <span>
                        <Disc3 size={12} /> LISTEN IN ORDER
                      </span>
                      <span>{album.duration}</span>
                    </div>
                  </section>
                )}
              </div>

              {/* 그 밑에 바로 리뷰 영역 */}
              <section className="review-bottom-card">
                <div className="review-card-header">
                  <div className="review-title-left">
                    <span className="review-icon-badge">
                      <Pencil size={10} />
                    </span>
                    <h3>이번 음악에 대한 리뷰</h3>
                  </div>
                  <button
                    type="button"
                    className="review-edit-trigger"
                    onClick={() => {
                      setReviewDraft(review);
                      setEditingReview((v) => !v);
                    }}
                  >
                    {editingReview ? "닫기" : "리뷰 수정"}
                  </button>
                </div>

                {!editingReview ? (
                  <div
                    className="review-note-surface"
                    onClick={() => {
                      setReviewDraft(review);
                      setEditingReview(true);
                    }}
                    title="클릭하여 리뷰 수정"
                  >
                    <p className="review-body-text">{review}</p>
                    <span className="review-star-mark">
                      <Star size={12} />
                    </span>
                  </div>
                ) : (
                  <div className="review-editor-surface">
                    <textarea
                      value={reviewDraft}
                      onChange={(e) => setReviewDraft(e.target.value)}
                      maxLength={500}
                      placeholder="이 앨범에 대한 감상을 자유롭게 기록해 보세요..."
                    />
                    <div className="review-editor-bar">
                      <small>{reviewDraft.length}/500</small>
                      <div>
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => setEditingReview(false)}
                        >
                          취소
                        </button>
                        <button type="button" className="btn-burgundy" onClick={saveReview}>
                          <Check size={11} /> 저장
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </main>
          )}

          {/* 탭 2: RELEASES */}
          {activeView === "releases" && (
            <main className="page-content">
              <div className="tab-frame">
                <div className="tab-head">
                  <div>
                    <span className="kicker">UPCOMING & NEW MUSIC</span>
                    <h2>앨범 · 음원 출시 일정</h2>
                  </div>
                  <button
                    type="button"
                    className="sync-pill"
                    onClick={refreshReleasesFromApi}
                    disabled={syncingReleases}
                  >
                    <RefreshCw size={11} className={syncingReleases ? "spin" : ""} />
                    <span>API 동기화</span>
                  </button>
                </div>

                <label className="compact-search">
                  <Search size={13} />
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="아티스트, 앨범명, 장르 검색..."
                  />
                </label>

                <div className="schedule-list">
                  {filteredReleases.map((item) => (
                    <article className="schedule-card" key={item.id}>
                      <div className="schedule-date-badge">
                        <b>{item.date}</b>
                        <small>{item.year || "2026"}</small>
                      </div>
                      <div className="schedule-body">
                        <div className="schedule-tags">
                          <span className="tag-badge">{item.type}</span>
                          <span className="tag-genre">{item.genre}</span>
                        </div>
                        <h3>{item.artist}</h3>
                        <p>{item.title}</p>
                      </div>
                      <button
                        type="button"
                        className={`bell-btn ${
                          item.notified && settings.notifyEnabled && settings.notifyReleases
                            ? "on"
                            : ""
                        }`}
                        title="출시 알림 켜기/끄기"
                        onClick={() => toggleReleaseNotification(item.id)}
                      >
                        {item.notified &&
                        settings.notifyEnabled &&
                        settings.notifyReleases ? (
                          <Bell size={13} />
                        ) : (
                          <BellOff size={13} />
                        )}
                      </button>
                    </article>
                  ))}
                </div>

                <p className="api-footnote">
                  <Sparkles size={11} />
                  <span>우측 종 아이콘으로 개별 발매 알림을 켜고 끌 수 있습니다.</span>
                </p>
              </div>
            </main>
          )}

          {/* 탭 3: LIVE & TICKETS */}
          {activeView === "concerts" && (
            <main className="page-content">
              <div className="tab-frame">
                <div className="tab-head">
                  <div>
                    <span className="kicker">LIVE & TICKET SCHEDULE</span>
                    <h2>콘서트 & 티켓 정보</h2>
                  </div>
                  <button
                    type="button"
                    className="sync-pill"
                    onClick={refreshConcertsList}
                    disabled={syncingConcerts}
                  >
                    <RefreshCw size={11} className={syncingConcerts ? "spin" : ""} />
                    <span>동기화</span>
                  </button>
                </div>

                <div className="concert-stack">
                  {concerts.map((item) => (
                    <article className="concert-item-card" key={item.id}>
                      <div className="concert-top-row">
                        <span className="concert-status-pill">{item.status}</span>
                        <button
                          type="button"
                          className={`bell-btn ${
                            item.notified && settings.notifyEnabled && settings.notifyConcerts
                              ? "on"
                              : ""
                          }`}
                          title="티켓 오픈 알림 받기"
                          onClick={() => toggleConcertNotification(item.id)}
                        >
                          {item.notified &&
                          settings.notifyEnabled &&
                          settings.notifyConcerts ? (
                            <Bell size={13} />
                          ) : (
                            <BellOff size={13} />
                          )}
                        </button>
                      </div>

                      <h3>{item.artist}</h3>
                      <p className="concert-sub">{item.title}</p>

                      <div className="concert-info-rows">
                        <span>
                          <CalendarClock size={12} /> {item.date}
                        </span>
                        <span>
                          <Ticket size={12} /> {item.venue}
                        </span>
                      </div>

                      <div className="concert-footer-row">
                        <span className="platform-label">{item.platform}</span>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          예매처 바로가기 <ExternalLink size={11} />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>

                <p className="api-footnote">
                  <Sparkles size={11} />
                  <span>설정에서 콘서트 및 티켓 오픈 알림을 켜고 끌 수 있습니다.</span>
                </p>
              </div>
            </main>
          )}
        </>
      )}

      {/* 앨범 검색 / 직접 편집 모달 */}
      {showAlbumModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAlbumModal(false);
          }}
        >
          <div className="modal-sheet">
            <div className="modal-sheet-header">
              <h3>오늘의 앨범 변경 · 편집</h3>
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => setShowAlbumModal(false)}
              >
                <X size={14} />
              </button>
            </div>

            <div className="modal-tabs two-tabs">
              <button
                type="button"
                className={albumModalTab === "api" ? "active" : ""}
                onClick={() => setAlbumModalTab("api")}
              >
                앨범 API 검색
              </button>
              <button
                type="button"
                className={albumModalTab === "manual" ? "active" : ""}
                onClick={() => setAlbumModalTab("manual")}
              >
                직접 수정
              </button>
            </div>

            {albumModalTab === "api" && (
              <div className="modal-body">
                <form className="api-search-bar" onSubmit={searchAlbumFromApi}>
                  <input
                    value={apiSearchQuery}
                    onChange={(e) => setApiSearchQuery(e.target.value)}
                    placeholder="가수 또는 앨범명 (예: Oasis, IU, DAY6)"
                  />
                  <button type="submit" className="btn-burgundy" disabled={apiLoading}>
                    {apiLoading ? "..." : "검색"}
                  </button>
                </form>
                <div className="api-result-list">
                  {apiResults.length === 0 ? (
                    <p className="empty-hint">
                      아티스트나 앨범명을 검색하면 커버 이미지, 발매 연도, 장르, 전체 세트리스트를
                      한 번에 불러옵니다.
                    </p>
                  ) : (
                    apiResults.map((col) => (
                      <button
                        type="button"
                        key={col.collectionId}
                        className="api-result-item"
                        onClick={() => selectApiAlbum(col)}
                      >
                        <img src={col.artworkUrl60} alt="" />
                        <div>
                          <b>{col.collectionName}</b>
                          <small>
                            {col.artistName} · {formatYear(col.releaseDate)}
                          </small>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {albumModalTab === "manual" && (
              <form className="modal-body" onSubmit={saveManualAlbum}>
                <div className="grid-2">
                  <label className="modal-field">
                    <span>아티스트</span>
                    <input
                      value={albumDraft.artist}
                      onChange={(e) =>
                        setAlbumDraft((v) => ({ ...v, artist: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="modal-field">
                    <span>발매 연도</span>
                    <input
                      value={albumDraft.year}
                      onChange={(e) =>
                        setAlbumDraft((v) => ({ ...v, year: e.target.value }))
                      }
                    />
                  </label>
                </div>
                <label className="modal-field">
                  <span>앨범명</span>
                  <input
                    value={albumDraft.title}
                    onChange={(e) =>
                      setAlbumDraft((v) => ({ ...v, title: e.target.value }))
                    }
                    required
                  />
                </label>
                <div className="grid-2">
                  <label className="modal-field">
                    <span>장르</span>
                    <input
                      value={albumDraft.genre}
                      onChange={(e) =>
                        setAlbumDraft((v) => ({ ...v, genre: e.target.value }))
                      }
                    />
                  </label>
                  <label className="modal-field">
                    <span>재생 시간</span>
                    <input
                      value={albumDraft.duration}
                      onChange={(e) =>
                        setAlbumDraft((v) => ({ ...v, duration: e.target.value }))
                      }
                    />
                  </label>
                </div>
                <label className="modal-field">
                  <span>세트리스트 (한 줄에 1곡)</span>
                  <textarea
                    rows={4}
                    value={albumDraft.tracks.join("\n")}
                    onChange={(e) =>
                      setAlbumDraft((v) => ({
                        ...v,
                        tracks: e.target.value.split("\n")
                      }))
                    }
                  />
                </label>
                <div className="modal-footer">
                  <button type="submit" className="btn-burgundy">
                    <Check size={12} /> 저장하기
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <Check size={12} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
