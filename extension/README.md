# Focus Mode — Chrome Extension

Block browser notification popups with one toolbar click. When Focus Mode is on, notifications are suppressed and queued for review. When you turn off, a full session report shows what tried to interrupt you.

## Features

### Phase 1
- VPN-style toolbar toggle (ON/OFF) with icon color change and `ON` badge
- Keyboard shortcut: `Alt+Shift+F` (configurable at `chrome://extensions/shortcuts`)
- Blocks browser notifications, push display, and permission prompts
- Whitelist specific origins for uninterrupted alerts
- Notification queue (up to 500 per session) with origin, message, and timestamp
- Full session report on deactivate

### Phase 2
- **Session history** — last 30 days, browsable in History tab
- **CSV export** — per session or all history from report footer and History tab
- **Schedule** — recurring daily windows (days of week + start/end time, local timezone)
- **Schedule conflict UI** — manual OFF during scheduled ON shows re-enable time + Disable schedule
- Auto-purge of sessions older than 30 days

## Tech Stack

- Chrome Manifest V3
- React 18 + TypeScript + Tailwind CSS
- Vite + `@crxjs/vite-plugin`
- `chrome.storage.local` + `unlimitedStorage` + `chrome.alarms`

## Setup

```bash
cd extension
npm install
npm run generate-icons
npm run build
```

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/dist` folder

## Development

```bash
npm run dev
```

Load the `dist` folder produced by the dev watcher.

## Schedule Examples

| Rule | Days | Start | End |
|------|------|-------|-----|
| Work hours | Mon–Fri | 09:00 | 17:00 |
| Evening focus | Mon–Sun | 19:00 | 23:00 |
| Overnight | Fri, Sat | 22:00 | 06:00 |

Schedule checks run every 1 minute. Manual toggles are temporary; the schedule re-applies on the next check unless you click **Disable schedule**.

## CSV Export Format

One row per queued notification:

| Column | Example |
|--------|---------|
| `session_id` | uuid |
| `session_start` | ISO 8601 |
| `session_end` | ISO 8601 |
| `duration_seconds` | `3600` |
| `origin` | `https://github.com` |
| `message` | `PR review — hackathon-task-3` |
| `timestamp` | ISO 8601 |
| `type` | `notification` or `push` |

Sessions with no queued notifications export one row with empty notification fields.

## Manual Test Checklist

### Phase 1
1. Turn ON → block test notification → turn OFF → verify report
2. Whitelist origin → notification not blocked
3. Restart Chrome while ON → stays ON, timer/queue reset

### Phase 2
4. Complete session → entry appears in History tab
5. History banner shows "kept for the last 30 days"
6. Expand history card → same report sections as Status OFF view
7. Export CSV from report footer → valid spreadsheet
8. Create Mon–Fri 09:00–17:00 rule → enable schedule → auto-ON in window
9. Manually OFF during window → banner with re-enable time
10. Click Disable schedule → no auto re-enable on next alarm
11. Export all from History tab

### Quick test snippet (browser console)

```javascript
new Notification('Focus test', { body: 'Should be blocked' });
```

## Known Limitations

- Browser notifications only — in-page HTML toasts are not blocked
- Push events may log as `"Push event received"` when payload is unreadable
- Schedule uses local browser timezone only
- Schedule check granularity: 1 minute
- No Chrome Sync or Incognito support
- `chrome.action.openPopup()` from shortcut may require recent Chrome

## Project Structure

```
extension/
├── src/
│   ├── background/     # Service worker, history, schedule, alarms
│   ├── content/        # Page notification hooks
│   ├── popup/          # React UI (Status, History, Whitelist, Schedule)
│   └── shared/         # Types, schedule utils, constants
├── public/icons/
└── dist/               # Load this in Chrome
```
