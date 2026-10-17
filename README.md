# VINYL — Personal Music Journal (Chrome Extension)

**VINYL** is a burgundy-themed personal music journal Chrome Extension (`320 × 600` popup) designed for music lovers to record daily album reviews, flip between album artwork and setlists, and keep track of upcoming music releases and live concert tickets.

---

## Key Features

1. **TODAY (Daily Album & Review)**
   - **Interactive Album / Setlist Swap**: View a large, vinyl-inspired album cover card with release year, genre, and duration—or click the **Setlist (`세트리스트`)** button (or the cover itself) to smoothly swap to the full track-by-track list.
   - **Album Search via iTunes API**: Search any artist or album in real time to automatically populate high-resolution cover art, release year, genre, total duration, and complete tracklist (defaults to **Oasis — *(What's the Story) Morning Glory?***).
   - **Personal Music Review**: Write and edit your personal impressions right below the album card.

2. **RELEASES (Upcoming Album & Single Calendar)**
   - Browse upcoming albums and singles with release dates and genres.
   - Filter releases by artist, title, or genre, synchronize with external music APIs, and toggle release-day reminders per album.

3. **LIVE & TICKETS (Concert Schedule)**
   - Keep track of upcoming live concerts, venues, dates, and official ticketing platforms (Interpark, Melon Ticket, YES24, etc.) with direct booking links.

4. **Notification Settings**
   - Easily toggle notifications on or off via the top-right **Settings (`⚙️`)** button for:
     - Master notification switch
     - Upcoming album/single release alerts
     - Concert & ticket opening alerts
     - Daily music journal reminders

---

## Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Google Chrome (or any Chromium-based browser such as Edge, Brave, or Arc)

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd burgundy-music-extension
npm install
```

### 2. Build the Extension
```bash
npm run build
```
This command compiles the React application and outputs the production-ready Chrome Extension files into the `dist/` directory (including `manifest.json` and `HeeMusic_icon.png`).

### 3. Load into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the **`dist`** folder inside this project directory (`/burgundy-music-extension/dist`).
5. Pin **VINYL — Music Journal** from your Chrome Extensions toolbar to open the `320 × 600` popup anytime.

---

## How to Use

1. **Swapping Between Album Cover & Setlist**:
   - In the **TODAY** tab, click the **`세트리스트`** button at the top-right of the card (or click directly on the album cover) to flip to the full tracklist.
   - Click **`앨범 메인`** (or **`앨범 사진으로`**) to swap back to the main album cover view.
2. **Changing Today's Album**:
   - Click **`편집하기`** in the **TODAY** tab.
   - Use **앨범 API 검색** to search for any album (e.g., *Oasis*, *IU*, *DAY6*) and automatically import its cover and tracklist, or use **직접 수정** to customize fields manually.
3. **Writing a Review**:
   - Click anywhere on the review note box at the bottom of the **TODAY** tab (or click **`리뷰 수정`**) to write and save your thoughts.
4. **Managing Release & Concert Alerts**:
   - Switch to the **RELEASES** or **LIVE & TICKETS** tab and click the bell icon (`🔔`) on any item to enable or disable individual alerts.
   - Click the top-right **Settings (`⚙️`)** icon to manage global notification preferences.

---

## Development

To preview and develop in a local browser tab with hot-reload:

```bash
npm run dev
```

For planned external API integrations (Instagram Graph API, KOPIS Concert API, and release calendars), see [`plan.md`](./plan.md).
