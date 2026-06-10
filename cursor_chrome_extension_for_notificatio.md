# Chrome extension for notification management
_Exported on 6/10/2026 at 16:53:59 GMT+5 from Cursor (3.7.19)_

---

**User**

i want to Build a Chrome extension that blocks all browser notification popups and push notifications with a single toolbar click. When Focus Mode is ON, no site can interrupt you. When turned OFF, a session summary shows how many notifications were blocked and from which sites.

Flow: Click toolbar icon → Activate → All notifications silenced → Deactivate → View session report

Analyze the above requirements properly and generate answer based on below points:
1- What are the functional requirements
2- If any flow is unclear in above requirement ask necessary questions



---

**Cursor**

Analyzing the requirements and checking the workspace for existing Chrome extension context.


# Focus Mode Chrome Extension — Requirements Analysis

Below is a structured breakdown of **functional requirements** and **clarifying questions** based on your described flow and what Chrome extensions can realistically do.

---

## 1. Functional Requirements

### 1.1 Core Feature: Focus Mode Toggle

| ID | Requirement | Details |
|----|-------------|---------|
| **FR-01** | Single-click toolbar activation | User clicks the extension icon in the Chrome toolbar to turn Focus Mode **ON** or **OFF**. |
| **FR-02** | Visual state indicator | The toolbar icon (and/or badge) must clearly show whether Focus Mode is **ON** or **OFF** (e.g., colored vs gray, badge text, tooltip). |
| **FR-03** | Global notification blocking | When Focus Mode is **ON**, **all websites** are prevented from showing browser notification popups (Web Notifications API). |
| **FR-04** | Push notification blocking | When Focus Mode is **ON**, push-triggered notifications (via service workers / Push API) must also be silenced or intercepted so they do not appear as system/browser popups. |
| **FR-05** | Restore on deactivate | When Focus Mode is **OFF**, notification behavior returns to each site’s prior permission/state (or a defined default — see questions below). |

**Technical note:** Chrome’s `chrome.contentSettings.notifications` API can block notifications per-origin or globally. Push notifications that surface through the Notifications API are typically covered by the same content setting. Counting blocked notifications may require a background service worker that hooks into notification events or uses `chrome.debugger` / content-script interception — this is a design decision with tradeoffs.

---

### 1.2 Session Tracking & Reporting

| ID | Requirement | Details |
|----|-------------|---------|
| **FR-06** | Session boundary | A “session” starts when Focus Mode is turned **ON** and ends when it is turned **OFF**. |
| **FR-07** | Blocked notification count | On deactivate, show the **total number of notifications blocked** during that session. |
| **FR-08** | Per-site breakdown | The session report must list **which sites** attempted to send notifications and **how many per site** (e.g., `github.com: 3`, `slack.com: 12`). |
| **FR-09** | Session summary UI | After deactivation, present the report in a popup, side panel, or dedicated page (format TBD). |
| **FR-10** | Session data scope | Counts and site data apply only to the **current session** (unless persistence/history is explicitly required). |

---

### 1.3 User Experience & Interaction

| ID | Requirement | Details |
|----|-------------|---------|
| **FR-11** | Minimal friction | No extra confirmation dialogs for toggle ON/OFF unless explicitly required. |
| **FR-12** | Immediate effect | Blocking must take effect **immediately** after activation, without page reload. |
| **FR-13** | Report on OFF only | The session summary is shown **when Focus Mode is turned OFF**, not when turned ON. |
| **FR-14** | Dismiss report | User can dismiss the summary and continue browsing normally. |

---

### 1.4 Extension Infrastructure

| ID | Requirement | Details |
|----|-------------|---------|
| **FR-15** | Manifest V3 compliance | Extension must use Manifest V3 (required for new Chrome extensions). |
| **FR-16** | Permissions | Likely needs: `notifications`, `contentSettings`, `storage`, `activeTab` or broad host access, and possibly `alarms` for session timing. |
| **FR-17** | Background service worker | Handles toggle state, applies blocking rules, tracks blocked events, and persists session data. |
| **FR-18** | State persistence | Focus Mode ON/OFF state should survive browser restart (optional but typical). |
| **FR-19** | Icon & branding | Toolbar icon with ON/OFF variants; optional name like “Focus Mode”. |

---

### 1.5 Blocking Behavior (Detailed)

| ID | Requirement | Details |
|----|-------------|---------|
| **FR-20** | Block Web Notifications | Intercept or deny `new Notification()` and `Notification.requestPermission()` while Focus Mode is ON. |
| **FR-21** | Block permission prompts | While ON, sites should not be able to newly grant notification permission (or prompts should be suppressed). |
| **FR-22** | Count only blocked attempts | Increment counters when a notification **would have been shown** but was suppressed — not when a site merely has permission granted. |
| **FR-23** | Origin attribution | Each blocked notification must be attributed to its **origin** (scheme + host + port), not just page title. |

---

### 1.6 Edge Cases & Reliability

| ID | Requirement | Details |
|----|-------------|---------|
| **FR-24** | Multiple tabs / windows | Blocking applies across **all tabs and windows**, not only the active tab. |
| **FR-25** | Incognito support | Define whether Focus Mode works in incognito (requires explicit `incognito` manifest setting and user opt-in). |
| **FR-26** | Browser restart mid-session | Define behavior if Chrome closes while Focus Mode is ON (resume session vs reset counts). |
| **FR-27** | Rapid toggle | Turning ON → OFF → ON quickly should not corrupt session data or lose counts. |
| **FR-28** | Extension’s own notifications | Clarify whether the extension itself may show notifications (e.g., “Focus Mode activated”) or must stay silent. |

---

### 1.7 Out of Scope (Unless You Say Otherwise)

These are commonly confused with “notifications” but are **not** covered by standard Web Notifications blocking:

- Native OS notifications from **desktop apps** (Slack app, etc.)
- **Chrome system notifications** (updates, sync, etc.)
- In-page **toast/banner UI** built with HTML/CSS (not the Notifications API)
- **Sound alerts** on web pages
- **Email/SMS** or other non-browser channels

---

## 2. Clarifying Questions (Unclear Flows)

### A. Toggle & UI behavior

1. **Click behavior:** Does one click toggle ON/OFF, or does ON open a popup with a switch and OFF show the report? Your flow says “Click → Activate” and “Deactivate → View report” — is deactivation always a second click on the same icon?

2. **Report presentation:** Where should the session summary appear?
   - Popup when you click the icon after turning OFF?
   - Automatic popup immediately on deactivate?
   - Side panel / full options page?

3. **Focus Mode ON feedback:** When activated, should there be any UI feedback (badge, brief toast, icon animation), or **complete silence** including from the extension itself?

### B. Session definition

4. **Session reset:** If the user turns Focus Mode OFF, views the report, then turns it ON again — is that a **new session** with counters reset to zero?

5. **Long-running sessions:** If Focus Mode stays ON for hours/days, should the report still be one continuous session, or should sessions auto-expire (e.g., midnight, or after N hours)?

6. **Browser crash / restart:** If Chrome restarts while Focus Mode is ON, should blocking resume automatically and **continue the same session**, or start fresh?

### C. Blocking semantics

7. **Restore previous permissions:** When Focus Mode turns OFF, should each site return to its **exact prior** notification permission (`allow` / `block` / `ask`), or simply stop overriding and leave whatever Chrome currently has?

8. **Already-visible notifications:** Does “block” mean only **new** notifications, or also clearing/dismissing notifications already in the system tray?

9. **Notification permission prompts:** While ON, should sites be blocked from **asking** for notification permission, or only blocked from **displaying** after permission exists?

10. **In-page vs system notifications:** Should the extension block only **system/browser notification popups**, or also in-page notification UI (e.g., Slack-style banners inside the tab)?

### D. Counting & reporting accuracy

11. **What counts as “blocked”?**
    - Only notifications that were actively suppressed?
    - Also permission requests denied?
    - Push events received but not displayed?

12. **Per-site granularity:** Report by **registrable domain** (`slack.com`) or **full origin** (`app.slack.com` vs `hooks.slack.com`)?

13. **Unknown / extension origins:** How should notifications from `chrome-extension://` or opaque origins be labeled in the report?

14. **Zero-block sessions:** If Focus Mode was ON but nothing was blocked, should the report say “0 notifications blocked” or be skipped entirely?

### E. Scope & platform

15. **Incognito:** Should Focus Mode work in incognito windows? (User must enable “Allow in incognito” in extension settings.)

16. **Other Chromium browsers:** Must it work only in Chrome, or also Edge/Brave/Opera?

17. **Sync across devices:** Should Focus Mode state or session history sync via Chrome Sync?

### F. Persistence & history

18. **History beyond last session:** Is only the **most recent** session report needed, or a log of past sessions (daily/weekly stats)?

19. **Export/share:** Should users export the session report (CSV, copy to clipboard)?

### G. Settings & customization

20. **Allowlist / blocklist:** When Focus Mode is ON, should **all** sites be blocked with no exceptions, or should users whitelist critical sites (e.g., calendar reminders)?

21. **Keyboard shortcut:** Is a hotkey required in addition to the toolbar click?

22. **Scheduled Focus Mode:** Auto-enable at certain times (e.g., 9am–5pm), or strictly manual only?

---

## Suggested Flow (Once Questions Are Answered)

```mermaid
stateDiagram-v2
    [*] --> FocusOff
    FocusOff --> FocusOn: Click toolbar icon
    FocusOn --> FocusOn: Notifications blocked, counts increment
    FocusOn --> FocusOff: Click toolbar icon again
    FocusOff --> ShowReport: Display session summary
    ShowReport --> FocusOff: User dismisses
    FocusOff --> FocusOn: Click again (new session)
```

**Minimal interpreted flow (if you want the simplest reading):**

1. **OFF → ON:** Click icon → global notification blocking starts → session timer/counters start at 0.  
2. **ON:** All Web/Push notification popups suppressed; each attempt logged by origin.  
3. **ON → OFF:** Click icon again → blocking stops → popup shows total blocked + per-site list.  
4. **OFF:** Normal Chrome notification behavior resumes.

---

## Summary

**Core functional requirements** are: toolbar toggle, global notification + push silencing while ON, per-session counting by site, and a summary report on deactivate.

The **biggest ambiguities** are: how exactly the click/toggle/report UI works, what “blocked” means for counting, whether permissions are restored or overridden, and whether in-page UI vs system notifications are in scope.

If you answer the questions in sections **A, C, and D** (toggle UI, blocking semantics, counting rules), the requirements become implementation-ready. I can turn that into a technical spec (manifest, APIs, architecture) or user stories next — still in Ask mode, or switch to Agent mode if you want the extension built in the repo.

---

**User**

Answers:
1- one click toggle on off similar to most of VPN extensions (connect/disconnect), on off show the report, we'll discuss further in the chat regarding what should be in report
2- Just the popup/tooltip modal below extension icon to show the report summary again similar to VPN's extensions
3- just the icon animation and color change of extension icon that indicate that focus mode is activated
4- Yes that will be the new session reset to zero
5- Yes report will be one long coninuous session
6- start fresh
7- turn to prior setting
8- only new notification
9- block asking for notification
10- block browser notifications only
11- notifications, permissions and push events as well
12- full origin
13- as blocked
14- it shiould say 0 notifications blocked
15- No 
16- oour current focus is chrome only
17- Will discuss later
18- Also need to save logs of past session
19- yes
20- User can whitelist certain sites url that will be allowed
21- yes add a shortcut key
22- Yes we'll add schedule date and time and we'll further disscuss it 

These are all answers to your questions, if there is any other questions you have ket me know excluding the one we said we'll discuss later

---

**Cursor**

# Updated Requirements — Focus Mode Chrome Extension

Your answers resolve most of the earlier ambiguity. Below is the consolidated **functional requirements** plus **remaining questions** (excluding report details, sync, and schedule specifics, as agreed).

---

## Confirmed User Flow

```mermaid
flowchart LR
    A[Click toolbar icon] --> B{Current state?}
    B -->|OFF → ON| C[Focus Mode activates]
    C --> D[Icon animates / color changes]
    D --> E[Popup opens below icon]
    B -->|ON → OFF| F[Focus Mode deactivates]
    F --> G[Restore prior per-site permissions]
    G --> H[Popup opens with session summary]
    H --> I[Session saved to history log]
    I --> J[New session starts at 0 on next ON]
```

**VPN-style behavior:** Every toolbar click toggles state **and** opens the popup. Activation is indicated only by icon animation/color — no extension toasts.

---

## 1. Functional Requirements (Finalized)

### 1.1 Focus Mode Toggle

| ID | Requirement |
|----|-------------|
| **FR-01** | Single toolbar icon click toggles Focus Mode ON ↔ OFF (VPN connect/disconnect pattern). |
| **FR-02** | Each click opens a popup anchored below the extension icon. |
| **FR-03** | When ON: icon uses distinct color + animation to indicate active Focus Mode. |
| **FR-04** | When OFF: icon returns to inactive appearance. |
| **FR-05** | No extension notification toasts; feedback is icon + popup only. |
| **FR-06** | Keyboard shortcut toggles Focus Mode ON/OFF (same behavior as icon click). |

---

### 1.2 Notification Blocking (Focus Mode ON)

| ID | Requirement |
|----|-------------|
| **FR-07** | Globally block **browser/system notification popups** from all sites (Web Notifications API). |
| **FR-08** | Block **push-triggered** notifications that would surface as browser notifications. |
| **FR-09** | Block sites from **requesting** notification permission while Focus Mode is ON. |
| **FR-10** | Block only **new** notifications; do not dismiss or clear already-visible OS notifications. |
| **FR-11** | Do **not** block in-page HTML/CSS toast/banner UI — browser notifications only. |
| **FR-12** | Blocking applies across all normal Chrome windows/tabs immediately (no reload required). |
| **FR-13** | **Not supported in Incognito** — extension does not run or affect incognito windows. |
| **FR-14** | **Chrome only** — no cross-browser requirement. |

---

### 1.3 Whitelist (Exceptions)

| ID | Requirement |
|----|-------------|
| **FR-15** | User can configure a whitelist of site URLs that remain allowed during Focus Mode. |
| **FR-16** | Whitelisted sites bypass notification blocking (and presumably permission blocking — see Q3 below). |
| **FR-17** | Whitelist is user-managed via extension UI (popup and/or options page — see Q8). |

---

### 1.4 Permission Restoration (Focus Mode OFF)

| ID | Requirement |
|----|-------------|
| **FR-18** | On deactivate, each site’s notification permission returns to its **prior** setting (allow / block / ask), not a global default. |
| **FR-19** | Whitelist overrides are no longer applied once Focus Mode is OFF (sites follow their stored permissions again). |

---

### 1.5 Session Tracking

| ID | Requirement |
|----|-------------|
| **FR-20** | A session begins when Focus Mode turns ON and ends when it turns OFF. |
| **FR-21** | Session counters reset to zero at each new activation. |
| **FR-22** | A session can run indefinitely (hours/days) as one continuous session. |
| **FR-23** | Count three event types per **full origin** (`scheme://host:port`): suppressed notifications, denied permission requests, and received push events. |
| **FR-24** | Unknown / extension origins (e.g. `chrome-extension://`) are logged under the label **"blocked"**. |
| **FR-25** | If nothing was blocked during a session, report must show **"0 notifications blocked"** (wording/details TBD in report discussion). |

---

### 1.6 Session History & Export

| ID | Requirement |
|----|-------------|
| **FR-26** | On each deactivation, save the completed session to a **past sessions log**. |
| **FR-27** | User can view historical session logs beyond the most recent one. |
| **FR-28** | User can export session data (format TBD — see Q5). |
| **FR-29** | Chrome Sync for state/history — **deferred**. |

---

### 1.7 Browser Restart Behavior

| ID | Requirement |
|----|-------------|
| **FR-30** | On browser restart: **start fresh** — no resumed session, counters cleared. |
| **FR-31** | Exact behavior on restart for Focus Mode ON/OFF state and unsaved partial sessions — **needs confirmation** (see Q2). |

---

### 1.8 Scheduling (High-Level — Details Deferred)

| ID | Requirement |
|----|-------------|
| **FR-32** | Support scheduled auto-enable/disable by date and time. |
| **FR-33** | Schedule configuration UI and rules — **to be discussed later**. |

---

### 1.9 Technical / Platform

| ID | Requirement |
|----|-------------|
| **FR-34** | Manifest V3, background service worker, `storage` for session logs and whitelist. |
| **FR-35** | Permissions likely include `contentSettings`, `storage`, `alarms` (for scheduling), and host access for interception/counting. |
| **FR-36** | Popup UI for toggle feedback + session summary; options/history UI for whitelist, logs, export, and schedule. |

---

## 2. Popup Behavior (Partially Defined)

| State transition | Popup opens | Content (high-level) |
|------------------|-------------|----------------------|
| OFF → ON | Yes | Active status + icon state (live stats TBD in report discussion) |
| ON → OFF | Yes | Session summary for ended session + save to history |

Exact fields, layout, and live vs final stats — **deferred** to your report discussion.

---

## 3. Remaining Questions (Not Deferred)

### Q1 — Popup content on ON vs OFF
On **activate** (OFF → ON), should the popup show:
- **(A)** Only “Focus Mode is ON” + duration timer (no counts yet), or  
- **(B)** Live running totals (blocked so far this session), or  
- **(C)** Something else?

On **deactivate** (ON → OFF), the popup is clearly the **final session report** — agreed.

---

### Q2 — Browser restart: Focus Mode state
You said sessions **start fresh** on restart. Please confirm:

- **(A)** Focus Mode auto-turns **OFF** on restart, counters cleared, **in-progress session not saved** to history?  
- **(B)** Focus Mode stays **ON** visually but counters reset to 0 (new session)?  
- **(C)** Something else?

This affects UX and whether partial sessions should be logged.

---

### Q3 — Whitelist scope
For whitelisted URLs during Focus Mode, should those sites:

- **(A)** Get full normal behavior (show notifications **and** show permission prompts), or  
- **(B)** Show notifications only, but still block permission prompts, or  
- **(C)** Other?

---

### Q4 — Whitelist URL matching
When user adds “certain site URLs,” how should matching work?

- **(A)** **Full origin only** — e.g. `https://app.slack.com` (all paths on that origin)  
- **(B)** **Full URL incl. path** — e.g. `https://app.slack.com/client` only  
- **(C)** **Domain-level** — e.g. `*.slack.com`  
- **(D)** User picks per entry (origin vs path vs pattern)

You previously chose **full origin** for reporting; whitelist matching may or may not use the same rule.

---

### Q5 — Export format
For session export, which formats are required?

- Copy to clipboard (plain text summary)  
- CSV  
- JSON  
- All of the above  

---

### Q6 — Session history retention
How long should past session logs be kept?

- **(A)** Forever (until user clears)  
- **(B)** Last N sessions (e.g. 50)  
- **(C)** Last N days (e.g. 30 days)  
- **(D)** User-configurable limit  

Also: should history store **full per-origin breakdown** per session, or only totals?

---

### Q7 — Permission denial counting
If the same origin repeatedly calls `Notification.requestPermission()` during one session, should that count as:

- **(A)** **1 per origin per session** (deduplicated), or  
- **(B)** **Every attempt** (each call increments the count)?

Same question for **push events** if multiple pushes arrive from one origin.

---

### Q8 — Settings UI placement
Where should users manage whitelist, keyboard shortcut info, schedule, history, and export?

- **(A)** All inside the popup (tabs/sections)  
- **(B)** Dedicated **Options** page (`chrome://extensions` → Details → Extension options)  
- **(C)** Popup for summary/toggle; Options page for configuration  

VPN extensions often use popup for status and a separate settings page for rules — worth aligning with that pattern.

---

### Q9 — Keyboard shortcut
- Default shortcut preference? (e.g. `Alt+Shift+F` — Chrome requires user-granted shortcuts via `chrome://extensions/shortcuts`)  
- Should the shortcut **also open the popup**, or only toggle state silently (icon still updates)?

---

### Q10 — Scheduled Focus Mode interaction with manual toggle
When schedule is implemented later, if user **manually** turns OFF during a scheduled ON window (or ON during scheduled OFF):

- **(A)** Manual action wins until next schedule boundary  
- **(B)** Schedule overrides again at next check interval  
- **(C)** Manual toggle disables schedule until user re-enables it  

Worth deciding early for architecture, even if schedule UI comes later.

---

## 4. Explicitly Deferred (Per Your Note)

| Topic | Status |
|-------|--------|
| Report fields, layout, live stats | Discuss in chat |
| Chrome Sync | Discuss later |
| Schedule date/time rules & UI | Discuss later |

---

## 5. Summary

You now have a **implementation-ready core**: VPN-style toggle, popup report, icon-only active feedback, global browser notification blocking with whitelist, permission restore, full-origin attribution, triple event counting, session history, export, shortcut, no incognito, Chrome-only, fresh start on browser restart.

**Ten open questions** above (Q1–Q10) are the main gaps before design/architecture. **Q2, Q3, Q4, and Q6** are the most impactful for implementation.

Answer those when you can, and we can move to technical architecture (manifest, APIs, data model) or refine the report contents in the next message.

---

**User**

1- A
2- B
3- A
4- A
5- B - CSV
6- C
7- B
8- A
9- A - open the pop up as well
10 - B



---

**Cursor**

# Final Requirements Specification — Focus Mode Chrome Extension

All open questions are now resolved. Below is the consolidated, implementation-ready spec.

---

## Product Summary

A **Chrome-only** Manifest V3 extension that toggles **Focus Mode** with one toolbar click (VPN-style). While ON, browser notification popups, push notifications, and permission prompts are blocked globally — except for **whitelisted origins**. On deactivate, a session summary appears in a popup; sessions are logged for **30 days** and exportable as **CSV**.

---

## 1. User Flows

### 1.1 Primary Toggle Flow

```mermaid
stateDiagram-v2
    [*] --> FocusOff
    FocusOff --> FocusOn: Click icon OR shortcut
    FocusOn --> FocusOff: Click icon OR shortcut
    
    state FocusOn {
        [*] --> Blocking
        Blocking --> Blocking: Block events, count per origin
    }
    
    state FocusOff {
        [*] --> Idle
    }
```

| Action | Result |
|--------|--------|
| **OFF → ON** | Focus Mode activates → icon animates/changes color → popup opens showing **“Focus Mode is ON”** + **session duration timer** (no block counts) |
| **ON → OFF** | Focus Mode deactivates → prior per-site permissions restored → popup opens with **final session report** → session saved to history |
| **Next ON** | New session; all counters reset to **0** |

### 1.2 Keyboard Shortcut Flow

- Default shortcut: **`Alt+Shift+F`** (user can change via `chrome://extensions/shortcuts`).
- Same behavior as toolbar click: **toggle state + open popup**.

### 1.3 Browser Restart Flow

| Aspect | Behavior |
|--------|----------|
| Focus Mode visual state | **Stays ON** if it was ON before restart |
| Session counters | **Reset to 0** (new session) |
| Prior in-progress session | **Not saved** to history (treated as abandoned) |
| Duration timer | Restarts from 0 |

---

## 2. Functional Requirements

### 2.1 Toggle & UI

| ID | Requirement |
|----|-------------|
| **FR-01** | Single toolbar icon click toggles Focus Mode ON ↔ OFF. |
| **FR-02** | Keyboard shortcut (`Alt+Shift+F` default) toggles Focus Mode and opens popup. |
| **FR-03** | Every toggle opens popup below extension icon (VPN-style). |
| **FR-04** | **ON:** icon color change + animation; popup shows active status + live duration timer only. |
| **FR-05** | **OFF:** icon inactive style; popup shows final session report. |
| **FR-06** | No extension notification toasts. |
| **FR-07** | All configuration lives in the **popup** via tabs/sections (toggle, report, whitelist, history, schedule, export). |

---

### 2.2 Blocking (Focus Mode ON)

| ID | Requirement |
|----|-------------|
| **FR-08** | Block **browser/system notification popups** (Web Notifications API) from all non-whitelisted origins. |
| **FR-09** | Block **push events** that would surface as browser notifications. |
| **FR-10** | Block **notification permission prompts** (`Notification.requestPermission()`). |
| **FR-11** | Block **new** notifications only; do not clear existing OS notifications. |
| **FR-12** | Do **not** block in-page HTML/CSS notification UI. |
| **FR-13** | Apply blocking across all normal Chrome tabs/windows immediately. |
| **FR-14** | **No Incognito** support. |
| **FR-15** | **Chrome only**. |

---

### 2.3 Whitelist

| ID | Requirement |
|----|-------------|
| **FR-16** | User can add/remove whitelisted **full origins** (e.g. `https://app.slack.com`). |
| **FR-17** | Matching is **origin-level** — all paths on that origin are allowed. |
| **FR-18** | Whitelisted origins get **full normal behavior**: notifications, push, and permission prompts. |
| **FR-19** | Whitelist managed in popup settings section. |

---

### 2.4 Permission Restoration (Focus Mode OFF)

| ID | Requirement |
|----|-------------|
| **FR-20** | On deactivate, restore each site’s notification permission to its **prior** setting (allow / block / ask). |
| **FR-21** | Snapshot permissions before overriding when Focus Mode turns ON. |

---

### 2.5 Session Tracking & Counting

| ID | Requirement |
|----|-------------|
| **FR-22** | Session starts at ON, ends at OFF; counters reset on each new activation. |
| **FR-23** | Session may run indefinitely as one continuous period. |
| **FR-24** | Attribute all events to **full origin** (`https://host:port`). |
| **FR-25** | Count **every attempt** — no per-origin deduplication within a session. |
| **FR-26** | Track three event types: **suppressed notifications**, **denied permission requests**, **received push events**. |
| **FR-27** | Unknown / extension origins labeled **`blocked`** in reports. |
| **FR-28** | Zero-event sessions show **“0 notifications blocked”** in report (exact copy TBD in report discussion). |

---

### 2.6 Session History & Export

| ID | Requirement |
|----|-------------|
| **FR-29** | On OFF, persist completed session to history with full per-origin breakdown. |
| **FR-30** | Retain logs for **last 30 days**; auto-purge older entries. |
| **FR-31** | User can browse past sessions in popup **History** tab. |
| **FR-32** | Export session(s) as **CSV** from popup. |
| **FR-33** | Chrome Sync — **deferred**. |

---

### 2.7 Scheduling (High-Level)

| ID | Requirement |
|----|-------------|
| **FR-34** | Support scheduled auto-enable/disable by date/time (details deferred). |
| **FR-35** | If user manually toggles during a scheduled window, **schedule re-applies at next check interval** (manual override is temporary). |
| **FR-36** | Schedule UI in popup; uses `chrome.alarms` or equivalent. |

---

### 2.8 Platform & Restart

| ID | Requirement |
|----|-------------|
| **FR-37** | Manifest V3 + service worker background script. |
| **FR-38** | Persist: Focus Mode ON/OFF, whitelist, schedule, session history, permission snapshots. |
| **FR-39** | On browser restart while ON: remain ON, reset counters/timer, do not save abandoned session. |

---

## 3. Popup Structure (Recommended Tabs)

| Tab | Purpose |
|-----|---------|
| **Status** | Toggle, icon state, duration timer (ON) or latest session summary (OFF) |
| **History** | Past sessions (30-day window), drill-down per origin |
| **Whitelist** | Add/remove origins |
| **Schedule** | Date/time rules (details TBD) |
| **Export** | Download session data as CSV |

---

## 4. Data Model (Conceptual)

### 4.1 Active Session (in memory + storage)

```
{
  startedAt: timestamp,
  isActive: boolean,
  events: [
    { origin: string, type: 'notification' | 'permission' | 'push', timestamp }
  ]
}
```

### 4.2 Completed Session (history log)

```
{
  id: uuid,
  startedAt, endedAt, durationMs,
  totalBlocked: number,
  byOrigin: { [origin]: { notifications, permissions, push, total } },
  exportedAt?: timestamp
}
```

### 4.3 Permission Snapshot

```
{ [origin]: 'allow' | 'block' | 'ask' }  // captured at Focus Mode ON
```

### 4.4 CSV Export (minimum columns)

| Column | Example |
|--------|---------|
| `session_id` | `uuid` |
| `session_start` | ISO 8601 |
| `session_end` | ISO 8601 |
| `duration_seconds` | `3600` |
| `origin` | `https://github.com` |
| `notifications_blocked` | `3` |
| `permissions_denied` | `1` |
| `push_events_blocked` | `2` |
| `total_blocked` | `6` |

---

## 5. Technical Architecture Notes

| Concern | Likely approach |
|---------|-----------------|
| Global block | `chrome.contentSettings.notifications.set({ primaryPattern: '<all_urls>', setting: 'block' })` + whitelist exceptions |
| Permission prompts | Content script override of `Notification.requestPermission` + block at content-settings layer |
| Push counting | Service worker message interception or `chrome.debugger` (heavier); or content-script hook on registration/show paths |
| Restart persistence | `chrome.storage.local` for state, whitelist, history, snapshots |
| Schedule | `chrome.alarms` with periodic check; manual toggle flag cleared on next alarm |
| Popup timer | `setInterval` in popup while open; background tracks `startedAt` for accuracy when popup closed |

---

## 6. Still Deferred (Agreed)

| Topic | Status |
|-------|--------|
| Exact report layout & copy (OFF popup fields, “0 blocked” wording) | Discuss in chat |
| Chrome Sync | Discuss later |
| Schedule rules (recurring, timezone, multiple windows) | Discuss later |

---

## 7. One Minor Confirmation (Optional)

For **FR-30** (30-day retention): you chose **“last N days.”** Confirm whether **30 days** is the fixed value or user-configurable in popup settings. Default assumption: **fixed 30 days**, purge on extension load + daily alarm.

---

## 8. Requirements Completeness

| Area | Status |
|------|--------|
| Toggle & popup behavior | ✅ Complete |
| Blocking scope | ✅ Complete |
| Whitelist | ✅ Complete |
| Counting rules | ✅ Complete |
| History & CSV export | ✅ Complete |
| Restart behavior | ✅ Complete |
| Shortcut | ✅ Complete |
| Schedule conflict rule | ✅ Complete |
| UI placement | ✅ Complete |
| Report content details | ⏳ Next discussion |
| Schedule implementation details | ⏳ Later |
| Chrome Sync | ⏳ Later |

This spec is sufficient to begin **technical design** (manifest, file structure, API choices) and **UI wireframes**. When you are ready, we can define the OFF-session report fields or move to architecture/implementation — in Agent mode if you want it built in the repo.

---

**User**

Now our functional requirements are clear, let's discuss about the edge cases 
list down the most importat and recurring edge cases not extreme rare cases

---

**Cursor**

# Edge Cases — Focus Mode Chrome Extension

Below are **important, recurring** edge cases grounded in your finalized requirements — not one-in-a-million scenarios. Each includes **what can go wrong** and **how the extension should behave**.

---

## 1. Toggle & Session Boundaries

These happen often with VPN-style extensions.

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E1** | **Rapid double-click** on icon or shortcut | User accidentally toggles ON → OFF → ON within seconds | Each valid toggle is a state change. OFF saves session to history; immediate re-ON starts a **new session at 0**. Debounce toggle (~300ms) in the background to avoid accidental double-fires. |
| **E2** | **Shortcut + icon click at nearly the same time** | Both fire on one user action | Background worker owns a single source of truth. Ignore duplicate toggle within debounce window; popup opens once. |
| **E3** | **Popup open during toggle** | Status tab may show stale ON/OFF or timer | Popup listens for `storage` / messaging updates and refreshes immediately on state change. |
| **E4** | **User closes popup without reading report** | Common after deactivating | Session is already saved to history (FR-29). User can reopen popup or use History tab. |
| **E5** | **Toggle OFF → ON from popup without leaving popup** | User ends session and immediately starts another | OFF flow completes (save, restore permissions, show report) before ON applies new block rules and resets counters. Serialize toggle operations. |

---

## 2. Browser Restart & Extension Lifecycle

You chose **stay ON, reset counters** — this will confuse users if not handled clearly.

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E6** | **Restart while Focus Mode ON** | Session was 2 hours; counters reset | Remain ON; counters and timer **reset to 0**; **do not** save pre-restart session. Popup ON view should hint that the timer restarted (e.g. “Session restarted after browser reload”). |
| **E7** | **Extension service worker restarts** (idle, update, crash) | MV3 workers sleep; in-memory counters can be lost | Persist `startedAt`, `isActive`, and event counts to `chrome.storage` on **every increment** (or batched every few seconds). Reload state on worker wake. |
| **E8** | **Extension disabled then re-enabled** | User toggles extension off in `chrome://extensions` | Define clearly: Focus Mode → OFF, blocking removed, permissions restored from last snapshot, partial session not saved. |
| **E9** | **Extension updated while Focus Mode ON** | Chrome may reload the extension | Treat like E7: restore ON state from storage; if counters were persisted, keep them; if not, document reset behavior consistently with E6. |

---

## 3. Permission Snapshot & Restoration

Happens whenever users browse many sites during a session.

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E10** | **Site never had a notification setting before** | No prior entry in snapshot | On OFF, restore to Chrome default (`ask`) for that origin. |
| **E11** | **User changes site permission manually** (lock icon / Chrome Settings) **while Focus Mode ON** | Conflicts with your snapshot | Snapshot is restore source on OFF — manual changes during Focus Mode may be **overwritten** on deactivate. Show a brief note in popup: “Site permissions are managed while Focus Mode is active.” |
| **E12** | **Same origin, HTTP and HTTPS** | `http://example.com` and `https://example.com` are different origins | Snapshot and whitelist treat them separately. Normalize user input to explicit origin. |
| **E13** | **Restore runs while tabs are open** | Open tabs may cache old permission state | After restore, already-open tabs may need reload for permission prompts to reflect restored state. Document in UI; optional “permission restored” without forcing reload. |

---

## 4. Whitelist Matching

Users will add URLs inconsistently.

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E14** | **User enters URL with path** (`https://slack.com/client/T123`) | FR-04 says origin-only | Normalize to `https://slack.com` before save; show normalized origin in UI. |
| **E15** | **Missing scheme** (`app.slack.com`) | Invalid whitelist entry | Default to `https://`; validate origin format on add. |
| **E16** | **Subdomain not covered** | User whitelists `https://app.slack.com` but notifications come from `https://hooks.slack.com` | No match — blocked and counted. UI copy: “Whitelist is per origin, not whole domain.” |
| **E17** | **Duplicate whitelist entries** | User adds same origin twice | Deduplicate silently. |
| **E18** | **Whitelisted site during Focus Mode** | Allowed through — should it appear in block counts? | **No.** Only blocked events count. Whitelist is an exception, not a stat. |

---

## 5. Counting & Attribution

Core to the session report; several paths produce notifications.

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E19** | **Same origin fires many permission requests** | FR-25: count every attempt | Each `requestPermission()` call increments `permissions_denied` for that origin. |
| **E20** | **Same origin sends many push events** | High-traffic sites (Slack, Gmail) | Each push event increments `push_events_blocked` separately. |
| **E21** | **Push → `showNotification()` chain** | One user-visible notification might trigger multiple hooks | Define rule: count **push receipt** as `push`; count **suppressed show** as `notification`. Avoid double-counting the same popup — if push handler calls `showNotification` and both are intercepted, count **one** `notification` OR one `push`, not both. **Pick one rule and apply consistently.** |
| **E22** | **Notification from iframe** | Embedded widget requests permission | Attribute to **iframe origin**, not top-level page (per full-origin rule). |
| **E23** | **Opaque / extension origins** | `chrome-extension://`, `blob:`, etc. | Label as **`blocked`** in report per FR-27. |
| **E24** | **Zero events for long ON session** | User expects feedback | Show **“0 notifications blocked”** and duration; still save session on OFF. |

**E21 is the most important counting edge case** — worth locking in before implementation.

---

## 6. Blocking Effectiveness

What users perceive as “notifications” vs what Chrome APIs block.

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E25** | **In-page toast UI** (not Notifications API) | User thinks Focus Mode failed | Per FR-12, these are **out of scope**. UI should say “Browser notifications only — in-page alerts are not blocked.” |
| **E26** | **Site already had `allow` before Focus Mode** | `contentSettings` override should still suppress popups | Blocking must override existing allow while ON; whitelisted origins exempt. |
| **E27** | **Notification arrives exactly as user toggles OFF** | Race between block removal and event | If OFF completes first, event is **not** blocked and **not** counted. If ON at intercept time, count it. Use ordered toggle pipeline (E5). |
| **E28** | **Background tab / minimized window** | User doesn’t see popup but events still fire | Blocking and counting work regardless of tab visibility. |

---

## 7. Popup, History & Export

Daily-use flows.

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E29** | **Export while Focus Mode is ON** | Active session not yet “completed” | Export **completed sessions only**, or offer “export current session so far” as separate action. Recommend: history = completed only; active session visible on Status tab only. |
| **E30** | **30-day retention purge** | Session from exactly 30 days ago | Purge entries where `endedAt < now - 30 days` on load + daily alarm. Sessions at boundary may disappear between views — acceptable. |
| **E31** | **Large session history** | Heavy Slack user, many origins | Paginate History tab; cap CSV export to selected session(s), not unbounded “export all” without warning. |
| **E32** | **CSV special characters in origin** | `https://example.com/path?a=1,b=2` | Proper CSV escaping (quotes, commas). |
| **E33** | **Popup opened but Focus Mode toggled from another window** | Rare with one profile, possible with shortcut | Same as E3 — sync via background broadcast. |

---

## 8. Schedule vs Manual Toggle

You chose **schedule wins at next check** (10-B).

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E34** | **User manually turns OFF during scheduled ON window** | Expectation: “I turned it off, leave me alone” | Temporary OFF until next schedule check; then auto-ON again. Popup should show: “Schedule will re-enable Focus Mode at [time].” |
| **E35** | **Manual ON during scheduled OFF window** | Opposite conflict | At next check, schedule turns OFF again. |
| **E36** | **Laptop sleep / missed alarm** | `chrome.alarms` may fire late | On wake, run catch-up check: if current time falls in scheduled ON window, apply scheduled state. |
| **E37** | **System clock / timezone change** | Alarms and schedule boundaries shift | Recalculate next alarm on `chrome.alarms` + store schedule in explicit timezone (to define in schedule discussion). |

---

## 9. Multi-Tab & Performance

Recurring at scale.

| # | Edge Case | Why it matters | Expected behavior |
|---|-----------|----------------|-------------------|
| **E38** | **Many tabs open while ON** | Content scripts on all pages | Inject only when Focus Mode ON; remove or noop when OFF to reduce overhead. |
| **E39** | **High-frequency events from one tab** | Storage writes on every count | Batch counter writes (e.g. every 1–2s) while keeping popup totals near-real-time when open. |
| **E40** | **User clears browsing data / extension storage** | Whitelist and history wiped if storage cleared | Acceptable; show empty state. Don’t store history in `sync` until sync is defined. |

---

## 10. UX Confusion (Not Bugs, But Recurring Support Issues)

| # | Edge Case | Why it matters | Mitigation |
|---|-----------|----------------|------------|
| **E41** | **Focus ON but user still “sees” alerts** | In-page UI (E25) | Clear scope messaging in popup. |
| **E42** | **Counter reset after restart** | Spec says B, feels like data loss | Short explanatory copy on Status tab after reload-detected session. |
| **E43** | **Schedule re-enables after manual OFF** | Feels aggressive | Visible schedule indicator + next auto-toggle time (E34). |
| **E44** | **`localhost` / dev ports** | `http://localhost:3000` vs `:5173` | Separate origins; common dev confusion — document in whitelist help text. |

---

## Priority Matrix

Focus design and tests on these first:

| Priority | Edge cases | Reason |
|----------|------------|--------|
| **P0 — Must handle** | E1, E5, E6, E7, E10–E13, E14–E16, E19–E22, E25–E27, E34 | Affect correctness, data integrity, or trust |
| **P1 — Should handle** | E2–E4, E8, E17, E18, E24, E29–E32, E36, E38–E39 | Frequent user paths or data quality |
| **P2 — Document in UI** | E41–E44, E30, E37 | Reduces confusion; less code risk |

---

## Decisions Still Worth Locking In

These recur often and aren’t fully specified yet:

1. **E21 — Push + showNotification double-count**  
   Recommended: count **notification show** only when `showNotification()` is intercepted; count **push** only when push event is received and no show follows within a short window — or simpler: **push OR notification, whichever hook fires first per event id**.

2. **E11 — Manual permission changes during Focus Mode**  
   Recommended: snapshot wins on OFF; one-line warning in popup.

3. **E29 — Export during active session**  
   Recommended: completed sessions only in History/CSV; active session stats only on Status tab while ON.

4. **E8 — Extension disabled**  
   Recommended: auto-OFF, restore permissions, discard partial session (consistent with restart abandon logic).

---

## Suggested Test Scenarios (Recurring Paths)

1. ON → browse 5 sites → OFF → verify report, history, CSV.  
2. Rapid double-click toggle → verify one session saved, not two corrupted entries.  
3. Whitelist `https://app.slack.com` → verify notifications work; `hooks.slack.com` still blocked.  
4. Restart browser while ON → verify ON, counters 0, no history entry for old session.  
5. Same site requests permission 5× → count = 5.  
6. Manual OFF during schedule ON → verify re-ON at next check + user message.  
7. Toggle OFF exactly as notification fires → verify deterministic count (E27).

---

If you want to go deeper next, we can nail down **E21 (counting rules)** and the **OFF-session report fields** — those two affect both edge-case handling and what users see in the popup.

---

**User**

E30 - also show in UI that only past 30 days history is maintained
E34 - yes show Schedule will re-enable Focus Mode at [time] but it should also has an option to disable the schedule time

above are some changes i would like rest of them are good expected behavior

before moving on let's discuss features that should be included

1- We are maintaing history 
2- we are having schedule on/off
3- We have keyboard shortcut toggle
4- We have whitelist for url 

clear me what happens to the notifications during focus mode on, will we receieve later or they will be wiped out ? 

---

**Cursor**

# Feature Scope, Your Updates & Notification Behavior

---

## Your Two Spec Updates (Locked In)

### E30 — 30-day history retention
- Auto-purge sessions older than **30 days** (unchanged).
- **UI addition:** History tab (and/or Export) shows persistent copy, e.g.  
  *“Session history is kept for the last 30 days.”*

### E34 — Schedule vs manual OFF
- When user manually turns OFF during a scheduled ON window, show:  
  *“Schedule will re-enable Focus Mode at [time].”*
- **UI addition:** A control on that message — e.g. **“Disable schedule”** or **“Pause schedule”** — so the user can stop auto re-enable without digging into Schedule tab.
- Recommended behavior for **Disable schedule:**
  - Sets schedule to **inactive** (or “paused until user re-enables”).
  - Focus Mode stays **OFF** until user toggles ON manually.
  - Schedule tab reflects disabled/paused state.

---

## Features That Should Be Included

Here is how the four pillars fit together and what each must do.

### 1. Session history

| Aspect | Behavior |
|--------|----------|
| **When saved** | Each time Focus Mode goes **OFF** (completed session). |
| **What’s stored** | Start/end time, duration, totals, per-origin breakdown (notifications, permissions, push). |
| **Retention** | Last **30 days**; older entries purged automatically. |
| **UI** | **History** tab in popup: list of past sessions, drill-down by origin. |
| **Copy** | “Session history is kept for the last 30 days.” |
| **Export** | **CSV** for selected/completed sessions (not in-progress unless you add that later). |
| **Not saved** | Abandoned sessions (browser restart while ON, extension disabled mid-session). |

**Purpose:** Accountability and awareness — “what tried to interrupt me?”

---

### 2. Schedule ON/OFF

| Aspect | Behavior |
|--------|----------|
| **What it does** | Auto-enable/disable Focus Mode at configured date/time (details TBD). |
| **Conflict rule** | Manual toggle is temporary; **schedule re-applies at next check** (your Q10-B). |
| **User escape hatch** | After manual OFF during scheduled ON: show re-enable time **+ option to disable/pause schedule** (your E34 update). |
| **UI** | **Schedule** tab in popup: create/edit rules, enable/disable master switch. |
| **Technical** | `chrome.alarms` + catch-up on wake from sleep. |

**Purpose:** Hands-free focus (work hours, deep-work blocks) without daily manual toggling.

---

### 3. Keyboard shortcut toggle

| Aspect | Behavior |
|--------|----------|
| **Default** | `Alt+Shift+F` (user-configurable in `chrome://extensions/shortcuts`). |
| **Behavior** | Same as icon click: **toggle ON/OFF + open popup**. |
| **UI** | Show shortcut hint on Status tab (e.g. “Alt+Shift+F to toggle”). |

**Purpose:** Fast toggle without reaching for the toolbar.

---

### 4. Whitelist (origins)

| Aspect | Behavior |
|--------|----------|
| **Matching** | **Full origin** only (`https://app.slack.com` — all paths on that origin). |
| **Effect while Focus Mode ON** | Whitelisted origins get **full normal behavior**: notifications, push, permission prompts. |
| **Counting** | Events from whitelisted origins are **not** counted as blocked. |
| **UI** | **Whitelist** tab: add/remove origins, normalize input (strip paths, default `https://`). |
| **Scope note** | `app.example.com` and `api.example.com` are separate origins. |

**Purpose:** Allow critical sites (calendar, pager, team chat) while everything else stays silent.

---

## How They Work Together (Focus Mode ON)

```mermaid
flowchart TD
    A[Focus Mode ON] --> B{Origin whitelisted?}
    B -->|Yes| C[Normal notifications + permissions]
    B -->|No| D[Block permission prompts]
    D --> E[Block push display]
    E --> F[Block notification popups]
    F --> G[Count each blocked event]
    G --> H[Log per full origin]
    
    I[User turns OFF] --> J[Restore prior permissions]
    J --> K[Save session to 30-day history]
    K --> L[Show report in popup]
```

---

## Notification Behavior During Focus Mode ON — Direct Answer

### Short answer
**Blocked notifications are not shown later.** They are **suppressed at the moment they would appear** and are **not queued** for delivery when Focus Mode turns OFF.

---

### What that means in practice

| Notification type | While Focus Mode ON (non-whitelisted) | When you turn OFF |
|-------------------|----------------------------------------|-------------------|
| **New browser popup** (Web Notifications API) | **Blocked** — never appears | **Not delivered later** — that specific alert is lost to the user |
| **Push → notification** | Push may reach the site’s service worker; **popup is blocked** if `showNotification()` is intercepted | **Not shown later** — no Chrome inbox for deferred web notifications |
| **Permission prompt** | **Blocked** — site cannot ask | Site can ask again after OFF (if restored to `ask`) |
| **Already-visible OS notifications** (from before ON) | **Unchanged** — stay in notification center | Still there until user dismisses |
| **Whitelisted origin** | **Normal** — popups show as usual | N/A |

So: **not wiped from the OS tray** (you never clear existing ones), but **not received later** either — blocked ones are **dropped**, not **held**.

---

### Why they don’t come back later

Chrome and the Web Notifications API don’t provide a built-in “hold and replay when unblocked” mechanism. Your spec blocks at:

- `chrome.contentSettings.notifications`
- Content-script / service-worker interception of `Notification` and `requestPermission`

When blocked, the site’s call fails or is noop’d — there is **no platform queue** your extension fills unless **you build one yourself**.

---

### What the user experiences

**During Focus Mode ON**
- No new browser notification popups (except whitelist).
- Sites may still run logic in the background; the user simply doesn’t see the popup.
- Your extension **counts** each blocked attempt for the session report.

**When Focus Mode turns OFF**
- Normal permissions restored per site.
- **No backlog** of suppressed popups appears.
- **New** notifications work again from the next event onward.

**Example:** Slack sends 10 messages while Focus Mode is ON → 10 blocked events in report → user turns OFF → those 10 message notifications **do not** suddenly appear; only **new** Slack activity can notify after OFF.

---

### Optional future feature (not in current spec)

If “receive later” is desired, you’d need an explicit **Notification Queue** feature:

- Intercept `showNotification` payload (title, body, icon, origin).
- Store in `chrome.storage` (with size limits).
- On OFF, show a summary or replay via `chrome.notifications` (extension-owned).

That is **significant extra scope** (storage limits, privacy, replay UX) and is **not** in your current requirements.

---

## Recommended UI Copy (Clarity)

On **Status** tab while ON, consider:

> *“New browser notifications are blocked while Focus Mode is on. They won’t appear later when you turn off. Already-shown notifications are not removed.”*

On **History** tab:

> *“Session history is kept for the last 30 days.”*

On **manual OFF during schedule** (E34):

> *“Schedule will re-enable Focus Mode at [time].”*  
> `[Disable schedule]` or `[Pause schedule]`

---

## Feature Inclusion Checklist (MVP vs Later)

| Feature | Include in MVP? | Notes |
|---------|-----------------|-------|
| Toggle + icon state + popup | ✅ Yes | Core |
| Block notifications / push / permission prompts | ✅ Yes | Core |
| Session report on OFF | ✅ Yes | Core |
| **History (30 days)** | ✅ Yes | You confirmed |
| **Whitelist** | ✅ Yes | You confirmed |
| **Keyboard shortcut** | ✅ Yes | You confirmed |
| **Schedule** | ⚠️ Phase 2 or MVP+ | Rules/UI still TBD; conflict + disable option now defined |
| CSV export | ✅ Yes | |
| Chrome Sync | ❌ Later | Deferred |
| Notification replay queue | ❌ Not in spec | Unless you explicitly add it |

---

## One Decision for You Before Moving On

Confirm this product statement:

> **“Focus Mode blocks and drops new browser notifications; they are not stored or replayed when Focus Mode ends.”**

- **If yes** — current spec is consistent; use the UI copy above.  
- **If no** — we need a **Notification Queue / Replay** feature in requirements (scope, limits, UX).

Once you confirm, good next topics are **OFF-session report fields** or **schedule rules** (recurring vs one-off, timezone).

---

**User**

if notifications are suppressed user may missed the iimportant notifications, so let's save all the notifications of that session in queue with origin for instance 
{Origin} : {Notification receieved} {time stamp}

we save all notifications and when user turns off we show a link that says view all notifications from Focus mode and on click it expands and show all notifications



---

**Cursor**

# Notification Queue — Feature Addition

This changes Focus Mode from **“block and drop”** to **“block display, save for review.”** Below is how it fits your spec, what to build, and what still needs a decision.

---

## Product Behavior (Updated)

| Phase | Behavior |
|-------|----------|
| **Focus Mode ON** | Browser popups are **not shown**. Each suppressed notification is **appended to a session queue** with origin, content, and timestamp. |
| **Focus Mode OFF** | Session report includes a link: **“View all notifications from Focus mode”**. Click **expands** an inline list of queued items. |
| **Whitelisted origins** | Notifications **display normally** → **do not** add to queue (user already saw them). |
| **Next session** | New queue starts **empty** when Focus Mode turns ON again. |

**User-facing clarity (Status tab while ON):**

> *“Notifications are hidden while Focus Mode is on. You can review them when you turn off.”*

---

## Queue Entry Data Model

Minimum per your example:

```ts
{
  origin: string;           // full origin, e.g. "https://app.slack.com"
  message: string;          // human-readable notification text
  timestamp: number;        // Unix ms when intercepted
}
```

**Recommended `message` format** (single string for UI + CSV):

```
{title} — {body}
```

If only title or only body exists, use what’s available. If both empty, use `"Notification"` or `"(No content)"`.

**Optional fields** (useful for dedup/debug; can add later):

| Field | Purpose |
|-------|---------|
| `id` | Unique row id |
| `type` | `'notification'` \| `'push'` |
| `icon` | URL (display only; optional in list) |

**Example queue:**

```
https://mail.google.com  |  "New email — You have 3 unread messages"  |  2026-06-10T14:32:01
https://github.com       |  "PR review requested — hackathon-task-3"   |  2026-06-10T14:35:22
blocked                  |  "Extension notification"                    |  2026-06-10T14:36:00
```

---

## UI — Session Report (OFF)

```
┌─────────────────────────────────────────┐
│  Focus Mode ended                       │
│  Duration: 2h 14m                       │
│  12 notifications blocked               │
│                                         │
│  ▶ View all notifications from        │
│    Focus mode (12)                      │  ← collapsed by default
├─────────────────────────────────────────┤
│  [Expanded]                             │
│  https://mail.google.com                │
│    New email — You have 3 unread...     │
│    2:32 PM                              │
│  https://github.com                     │
│    PR review requested — hackathon...   │
│    2:35 PM                              │
│  ...                                    │
└─────────────────────────────────────────┘
```

**UI rules:**

| Rule | Detail |
|------|--------|
| Collapsed by default | Link shows count: `View all notifications from Focus mode (12)` |
| Expand inline | Same popup Status tab; no new window required |
| Empty queue | Link still shown: `(0)` + *“No notifications were queued this session.”* |
| Sort order | **Newest first** (recommended) or oldest first — pick one |
| Long text | Truncate with ellipsis; full text on hover or tap-to-expand per row |

---

## Relationship to Existing Features

### Session history (30 days)

Queued notifications should be **stored with the completed session** so History tab can show them later.

```ts
Session {
  id, startedAt, endedAt, duration,
  stats: { byOrigin, totals },
  notificationQueue: QueueEntry[]   // NEW
}
```

- **History tab:** Each past session can expand the same “View all notifications…” list.
- **30-day copy:** Unchanged — queue is part of session payload and purges with the session.

### CSV export

Add columns or a second export pattern:

| Option | Approach |
|--------|----------|
| **A (simple)** | One row per notification: `session_id, origin, message, timestamp` |
| **B** | Session summary CSV + separate “notifications” CSV |

**Recommendation:** Option A — one row per queued notification.

### Block counters vs queue

| Event | Counted as blocked? | Added to queue? |
|-------|----------------------|-----------------|
| Suppressed `showNotification` / `Notification` | ✅ Yes | ✅ Yes |
| Push received, no show | ✅ Yes (push count) | ⚠️ Only if payload can be summarized (see below) |
| Denied `requestPermission()` | ✅ Yes | ❌ No — not a notification |
| Whitelisted origin — shown live | ❌ No | ❌ No |

### Permission prompts

Not notifications. Keep in **stats only**, not in the queue (unless you want a separate “permission attempts” list — probably not).

---

## What Gets Captured Technically

| Source | Capturable content |
|--------|-------------------|
| Page `new Notification(title, options)` | Title, body, icon |
| Service worker `registration.showNotification(title, options)` | Title, body, icon |
| Push event (before show) | Push `data` JSON — site-specific; may be opaque |

**Push-only edge case:** If the site receives push but never calls `showNotification`, queue entry might be:

```
{origin} | "Push event received" | {timestamp}
```

Or parse payload when possible (e.g. `{ title, body }`). Worth defining in implementation.

---

## Edge Cases for the Queue (Important & Recurring)

| # | Case | Expected behavior |
|---|------|-------------------|
| **Q1** | **High volume** (100+ in one session) | Cap or paginate in expanded view (e.g. show 50, “Load more”). Consider **max queue size** (e.g. 500/session). |
| **Q2** | **Storage limit** (`chrome.storage.local` ~5MB) | Request `unlimitedStorage` permission, or cap entries + show “Oldest notifications trimmed.” |
| **Q3** | **Sensitive content** (OTP, banking) | Queue stores plaintext in extension storage — add privacy note in UI. |
| **Q4** | **Duplicate notifications** | Same message 10 times → **10 entries** (matches “count every attempt”). |
| **Q5** | **Empty title/body** | Store fallback message + timestamp. |
| **Q6** | **Browser restart while ON** | You chose “start fresh” for counters — **queue should also clear** on restart (consistent). |
| **Q7** | **Rapid OFF → ON** | OFF saves queue to history; new session starts with empty queue. |
| **Q8** | **E21 double-count** | One user-visible notification → **one queue entry** and **one** block count (not push + show as two rows). |
| **Q9** | **Origin `blocked`** | Same label as stats for extension/opaque origins. |
| **Q10** | **User never expands link** | Data still in History + CSV export. |

---

## Updated Functional Requirements (New / Changed)

| ID | Requirement |
|----|-------------|
| **FR-40** | While Focus Mode is ON, suppress browser notification popups but **persist each** to an in-memory/storage-backed **session queue**. |
| **FR-41** | Each queue entry: **full origin**, **notification message**, **timestamp**. |
| **FR-42** | Whitelisted origins: show notifications normally; **exclude** from queue. |
| **FR-43** | On OFF, session report shows collapsible **“View all notifications from Focus mode (N)”**. |
| **FR-44** | Expanded list groups or lists by entry: origin, message, formatted time. |
| **FR-45** | Persist `notificationQueue` with session in **30-day history**. |
| **FR-46** | Include queued notifications in **CSV export**. |
| **FR-47** | On browser restart while ON, **clear queue** with counters (start fresh). |
| **FR-48** | Permission denials are **not** queued — stats only. |

**FR-08–FR-10** wording shifts from “silenced/lost” to **“hidden and queued for review.”**

---

## Decisions to Confirm (Quick)

1. **Restart:** Clear queue on browser restart while ON? **Recommended: yes** (aligns with E6).

2. **Queue cap:** Max entries per session (e.g. **500**)? **Recommended: yes**, with UI note if trimmed.

3. **Push-only events:** Queue as `"Push event received"` when payload unreadable? **Recommended: yes.**

4. **History tab:** Same expandable queue per past session? **Recommended: yes.**

5. **Privacy copy:** Short line under the link: *“Notification text is stored locally on this device.”* **Recommended: yes.**

6. **Permission prompts:** Queue or stats only? **Recommended: stats only.**

---

## Summary

- **During Focus Mode ON:** Notifications are **hidden**, not deleted — saved as `{ origin, message, timestamp }`.
- **On OFF:** Report includes **“View all notifications from Focus mode (N)”** → expands to full list.
- **History + CSV** should include the queue for the same 30-day window.
- **Whitelist** and **permission prompts** stay outside the queue.

Confirm the six decisions above (or adjust), and we can fold this into the final OFF-session report layout and data schema before architecture/implementation.

---

**User**

Restart: Clear queue on browser restart while ON? Recommended: yes (aligns with E6).

Queue cap: Max entries per session (e.g. 500)? Recommended: yes, with UI note if trimmed.

Push-only events: Queue as "Push event received" when payload unreadable? Recommended: yes.

History tab: Same expandable queue per past session? Recommended: yes.

Privacy copy: Short line under the link: “Notification text is stored locally on this device.” Recommended: yes.

Permission prompts: Queue or stats only? Recommended: stats only.


ok so this is final, let's discuss about the report what should be in report, i see it should contain time stamps notification count and list of notifications what other should be in it for good user experience 

---

**Cursor**

# Session Report — Content & UX Specification

This is the **OFF-state report** (and the same structure reused in **History** for past sessions). It should answer three questions in seconds: *How long was I focused?* *How much tried to interrupt me?* *What did I miss?*

---

## Report Principles

| Principle | Why |
|-----------|-----|
| **Summary first, detail on demand** | Most users scan totals; few expand full lists. |
| **One hero line** | Emotional payoff — “You blocked 12 interruptions in 2h 14m.” |
| **Actionable miss list** | Queue is the main reason to open the report. |
| **Honest empty state** | “0 notifications blocked” should feel like success, not failure. |
| **No clutter on ON** | Live session stays timer-only; full report only on OFF (and History). |

---

## Report Layout (Top → Bottom)

### 1. Session header (always visible)

| Field | Example | Notes |
|-------|---------|-------|
| **Status line** | `Focus Mode ended` | Clear state transition |
| **Hero summary** | `You blocked **12 interruptions** in **2h 14m**` | One sentence; primary UX win |
| **Session window** | `Started 2:15 PM · Ended 4:29 PM · Wed, Jun 10` | Start + end timestamps |
| **Duration** | `2h 14m 32s` | Can be part of hero or separate; keep visible |

**Zero-event hero:**

> `You stayed focused for **2h 14m** — **0 interruptions** blocked.`

---

### 2. Summary stats row (always visible)

Compact **3–4 metric chips/cards**:

| Metric | Label | Example |
|--------|-------|---------|
| **Total blocked** | `Total blocked` | `12` |
| **Notifications** | `Notifications` | `8` |
| **Permission prompts** | `Permission asks` | `2` |
| **Push events** | `Push events` | `2` |

- Numbers are **counts of blocked/denied events** (not queue length only — queue aligns with notifications + push rows per your E21 rule).
- Tapping a chip can **scroll/filter** expanded sections below (nice-to-have, not required for MVP).

---

### 3. Top interruptors (collapsed by default, recommended ON)

**“Top sites this session”** — top **3–5 origins** by total blocked events.

```
1. https://mail.google.com     5
2. https://github.com          3
3. https://www.reddit.com      2
```

| UX detail | Recommendation |
|-----------|----------------|
| Show | Origin host emphasis: `mail.google.com` with full origin on hover |
| Sort | Highest count first |
| Tie-break | Alphabetical by origin |
| Empty | Hide section if all counts are 0 |

This gives value **without** opening the full list.

---

### 4. Per-origin breakdown (collapsible)

**“Breakdown by site”** — expandable table/list.

| Origin | Notifications | Permissions | Push | Total |
|--------|---------------|-------------|------|-------|
| `https://mail.google.com` | 4 | 0 | 1 | 5 |
| `https://github.com` | 3 | 1 | 0 | 4 |
| `blocked` | 1 | 0 | 1 | 2 |

- Collapsed by default if **> 3 origins**; expanded if **≤ 3**.
- Full origin per your spec (FR-24).
- `blocked` row for extension/opaque origins.

---

### 5. Notification queue (collapsible — core feature)

**“View all notifications from Focus mode (8)”**

Expanded row format:

```
https://mail.google.com
  New email — You have 3 unread messages
  2:32 PM

https://github.com
  PR review requested — hackathon-task-3
  2:35 PM
```

| UX detail | Recommendation |
|-----------|----------------|
| Default | **Collapsed**; count in label |
| Sort | **Newest first** |
| Long messages | Truncate ~80 chars; expand per row on click |
| Cap notice | If trimmed at 500: `Showing 500 of 523 — oldest removed` |
| Privacy | Under link: *“Notification text is stored locally on this device.”* |
| Empty | `No notifications were queued this session.` |

---

### 6. Permission activity (stats only, lightweight)

Not a full queue — a **single line or mini section**:

> `2 sites tried to ask for notification permission`  
> `https://news.example.com` (1) · `https://game.example.com` (1)

- Collapsible if more than 2 origins.
- Avoid alarmist tone — informational only.

---

### 7. Whitelist context (conditional)

Only if whitelist is non-empty **and** had allowed traffic (optional enhancement) or simply:

> `3 sites on your whitelist were not blocked.`

With expandable list of whitelisted origins (no queue entries). Helps users understand why some apps still notified.

If whitelist empty → **hide section**.

---

### 8. Schedule context (conditional — E34)

If schedule is **active** and user manually turned OFF during a scheduled ON window:

```
Schedule will re-enable Focus Mode at 5:00 PM
[Disable schedule]   [Keep schedule]
```

If schedule inactive or OFF aligns with schedule → **hide** or show neutral:

> `Next scheduled Focus Mode: Today 9:00 AM` (optional, low priority)

---

### 9. Actions footer (always visible)

| Action | Purpose |
|--------|---------|
| **Turn Focus Mode on again** | Primary CTA after review |
| **Export session (CSV)** | Downloads this session’s stats + queue |
| **View in History** | Jumps to History tab with this session selected |

Secondary: **Dismiss** / close popup (implicit via clicking away).

---

## ON vs OFF Popup (Reminder)

| State | Popup content |
|-------|----------------|
| **ON (active)** | `Focus Mode is ON` + live timer + shortcut hint + optional one-liner: *“Notifications are hidden and saved for review.”* |
| **OFF (report)** | Full report structure above |

Do **not** show full report stats while ON — keeps focus on the timer and reduces noise.

---

## History Tab — Same Report, Slightly Different Chrome

Each history row = collapsed card:

```
Wed Jun 10 · 2:15–4:29 PM · 2h 14m · 12 blocked
```

Expand card → **same sections** as OFF report (header, stats, top sites, breakdown, notification queue, export).

Persistent banner at top of History tab:

> *“Session history is kept for the last 30 days.”*

---

## CSV Export (Aligned with Report)

One row per **queued notification** (primary export), plus optional **session summary** row or separate file.

**Notifications CSV (recommended):**

| Column | Example |
|--------|---------|
| `session_id` | uuid |
| `session_start` | ISO 8601 |
| `session_end` | ISO 8601 |
| `duration_seconds` | 8072 |
| `origin` | `https://mail.google.com` |
| `message` | `New email — You have 3 unread` |
| `timestamp` | ISO 8601 |
| `type` | `notification` \| `push` |

**Optional session summary CSV** (one row per session): totals + per-type counts for analytics-minded users.

---

## Copy & Tone Guide

| Scenario | Hero line |
|----------|-----------|
| High block count | `You blocked **47 interruptions** in **3h 05m**` |
| Low count | `Only **2 interruptions** — nice focus session` |
| Zero | `**0 interruptions** — uninterrupted focus for **1h 30m**` |
| Queue empty but permissions blocked | `**0 notifications** queued · **3 permission** requests blocked` |

Keep tone **neutral-positive** — never shame the user for turning OFF.

---

## Visual Hierarchy (Wireframe)

```
┌────────────────────────────────────────────┐
│  Focus Mode ended                          │
│  You blocked 12 interruptions in 2h 14m    │
│  Started 2:15 PM · Ended 4:29 PM           │
├────────────────────────────────────────────┤
│  [12 Total] [8 Notif] [2 Perm] [2 Push]    │
├────────────────────────────────────────────┤
│  ▼ Top sites this session                  │
│    mail.google.com (5) · github.com (3)    │
├────────────────────────────────────────────┤
│  ▶ Breakdown by site                       │
├────────────────────────────────────────────┤
│  ▶ View all notifications (8)              │
│    Notification text is stored locally...  │
├────────────────────────────────────────────┤
│  2 permission requests blocked  ▶          │
├────────────────────────────────────────────┤
│  [Focus On again]  [Export CSV]            │
└────────────────────────────────────────────┘
```

---

## MVP vs Nice-to-Have

| Include in MVP | Nice-to-have later |
|----------------|-------------------|
| Header + hero + timestamps + duration | Chip tap → scroll to section |
| 4 summary stat chips | Compare vs previous session |
| Top 3 sites | “Peak interruption hour” |
| Collapsible per-origin breakdown | Search/filter in queue |
| Collapsible notification queue + privacy | Mark notification as “important” |
| Permission stats line | Share report |
| Footer CTAs (Focus on, Export) | Session summary CSV separate file |
| Schedule banner + disable (when applicable) | Whitelist “allowed through” counts |
| History uses same template | |

---

## Final Report Content Checklist

**Always show on OFF:**
1. Ended status + hero summary  
2. Start/end timestamps + duration  
3. Total + breakdown (notifications / permissions / push)  
4. Expandable notification queue with count + privacy line  
5. Export + Turn on again actions  

**Show when relevant:**
6. Top sites (if count > 0)  
7. Per-origin breakdown (collapsible)  
8. Permission activity line (if permissions > 0)  
9. Schedule re-enable + disable option (E34)  
10. Queue cap trim notice (if capped)  

**Do not show:**
- Full permission prompt transcripts  
- In-page UI “blocked” items  
- Live stats while session still ON (timer only)  

---

If this matches what you want, the requirements phase is essentially complete: **functional reqs**, **edge cases**, **notification queue**, and **report UX** are all defined. Next step would be **technical architecture** (manifest, file structure, interception strategy) or **UI wireframes per popup tab** — say which you want to tackle first.

---

**User**

if notifications greater than 10 show One hero line else Honest replies 

all of the above mentioned are important include them in report 

now let's discuss the approach 
where will we be saving the data ? which stack we'll be using I prefer React

---

**Cursor**

# Technical Approach — Focus Mode Chrome Extension

This covers **data storage**, **React-based stack**, **architecture**, and the **hero-line rule** you confirmed.

---

## Report Hero Line Rule (Locked In)

| Condition | Hero style |
|-----------|------------|
| **Queued/blocked notifications > 10** | Single standard hero: *“You blocked **{N} interruptions** in **{duration}**”* |
| **Notifications ≤ 10** | **Honest replies** — tone varies by count |

**Honest replies examples:**

| Count | Hero line |
|-------|-----------|
| **0** | *“**0 interruptions** — uninterrupted focus for **{duration}**”* |
| **1–3** | *“Only **{N} interruptions** — nice focus session”* |
| **4–10** | *“**{N} interruptions** blocked in **{duration}**”* |

Use **notification count** (not total permissions + push) for this branch unless you want total interruptions — recommend **notification queue count** for the hero threshold.

---

## Where to Save Data

### Primary store: `chrome.storage.local`

All extension data lives **on-device** in Chrome’s extension storage (not your NestJS backend in this repo).

| Data | Storage key / collection | Notes |
|------|--------------------------|-------|
| Focus Mode ON/OFF | `focusMode.active`, `focusMode.sessionStartedAt` | Restored on worker wake |
| Active session counters | `activeSession.stats` | Per-origin + totals |
| Active notification queue | `activeSession.queue` | Max 500 entries |
| Permission snapshot | `permissionSnapshot` | Map origin → prior setting |
| Whitelist | `whitelist` | Array of origins |
| Schedule config | `schedule` | Rules, enabled, paused |
| Session history (30 days) | `sessionHistory` | Array of completed sessions |
| Last report (optional) | `lastSessionReport` | Quick popup render on OFF |

### Permission: `unlimitedStorage`

Request in manifest. Session history + notification queues over 30 days can exceed the default ~5MB `storage.local` cap.

### What NOT to use (for this project)

| Store | Why skip |
|-------|----------|
| **Backend / API** | Not needed; privacy-first, local-only |
| **IndexedDB** | Only if queues explode; `unlimitedStorage` + cap 500/session is enough for MVP |
| **`chrome.storage.sync`** | Deferred; size limits, not for large queues |
| **`localStorage` in popup** | Lost easily; not shared with background — avoid as source of truth |

### Persistence rhythm

```mermaid
flowchart LR
    A[Content script / SW hooks] --> B[Background service worker]
    B --> C[Update in-memory state]
    C --> D[chrome.storage.local]
    D --> E[Popup reads via storage.onChanged]
```

| Event | Persist |
|-------|---------|
| Each blocked notification | Append to queue + bump counters → **write storage** (batch every 1–2s OK) |
| Toggle ON/OFF | Immediate full persist |
| Browser restart | Read storage → restore ON state, **empty queue & counters** per E6 |
| Daily alarm | Purge `sessionHistory` older than 30 days |

---

## Recommended Stack (React)

| Layer | Choice | Why |
|-------|--------|-----|
| **Extension platform** | Chrome Manifest V3 | Required for new extensions |
| **UI** | **React 18+** | Your preference; good for tabs/popup |
| **Language** | **TypeScript** | Safer models for session/queue types |
| **Build** | **Vite + @crxjs/vite-plugin** or **Plasmo** | React + HMR + MV3 bundling |
| **Popup styling** | **Tailwind CSS** or CSS Modules | Fast, small popup UI |
| **Popup state** | **Zustand** or React Context | Sync with `chrome.storage` |
| **Background** | Plain **TypeScript** service worker | No React in service worker |
| **Content scripts** | TypeScript, compiled separately | Inject notification hooks |

**Recommendation:** **Vite + React + TypeScript + @crxjs/vite-plugin** — full control and matches a typical React workflow. **Plasmo** is a good alternative if you want more extension conventions out of the box.

### Suggested project layout

```
focus-mode-extension/
├── manifest.json
├── src/
│   ├── background/
│   │   ├── index.ts              # Service worker entry
│   │   ├── focus-mode.ts         # Toggle, contentSettings
│   │   ├── session.ts            # Counters, queue, history
│   │   ├── schedule.ts           # chrome.alarms
│   │   ├── permissions.ts        # Snapshot restore
│   │   └── storage.ts            # Typed storage helpers
│   ├── content/
│   │   └── notification-hook.ts  # MAIN world injection
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── tabs/
│   │   │   ├── StatusTab.tsx     # ON timer / OFF report
│   │   │   ├── HistoryTab.tsx
│   │   │   ├── WhitelistTab.tsx
│   │   │   ├── ScheduleTab.tsx
│   │   │   └── ExportTab.tsx
│   │   ├── components/
│   │   │   ├── SessionReport.tsx
│   │   │   ├── NotificationQueue.tsx
│   │   │   ├── StatsChips.tsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useFocusMode.ts   # storage + messaging
│   ├── shared/
│   │   ├── types.ts              # Session, QueueEntry, etc.
│   │   ├── messages.ts           # Runtime message enums
│   │   └── constants.ts
│   └── assets/
│       └── icons/                # ON/OFF animated states
├── vite.config.ts
└── package.json
```

---

## Architecture — Three Layers

### 1. Background service worker (brain)

| Responsibility |
|----------------|
| Toggle Focus Mode ON/OFF |
| Apply/remove `chrome.contentSettings.notifications` (global block + whitelist exceptions) |
| Own session lifecycle (start, end, save to history) |
| Permission snapshot save/restore |
| Queue writes + 500 cap + trim notice flag |
| Schedule alarms + manual override until next check |
| Purge 30-day history |
| Single source of truth for popup & content scripts |

### 2. Content scripts (interception)

Inject **only when Focus Mode is ON** (register/unregister via `chrome.scripting`).

| Hook | Purpose |
|------|---------|
| `Notification.requestPermission()` | Block + message background → permission count |
| `new Notification(...)` | Suppress display, send title/body to queue |
| `ServiceWorkerRegistration.prototype.showNotification` (MAIN world) | Catch SW-backed notifications on many sites |

Each intercept → `chrome.runtime.sendMessage({ type: 'BLOCKED_EVENT', ... })`.

**Push-only (unreadable payload):** background logs `{ origin, "Push event received", timestamp }`.

### 3. Popup (React UI)

| Responsibility |
|----------------|
| VPN-style toggle + tabs (Status, History, Whitelist, Schedule, Export) |
| Subscribe to `chrome.storage.onChanged` + `runtime.onMessage` |
| Render full **SessionReport** on OFF |
| Hero line logic (>10 vs honest replies) |
| Expandable queue, breakdown, schedule banner + disable |
| CSV export (generate `Blob` client-side, trigger download) |

**No React in background** — popup requests state and listens for updates.

---

## Data Flow Diagrams

### Toggle OFF → Report

```mermaid
sequenceDiagram
    participant User
    participant Popup
    participant BG as Background SW
    participant Storage

    User->>Popup: Click icon / shortcut
    Popup->>BG: TOGGLE_FOCUS_MODE
    BG->>BG: End session, restore permissions
    BG->>Storage: Save sessionHistory + clear activeSession
    BG->>Popup: STATE_CHANGED
    Popup->>Storage: Read last session
    Popup->>User: Full report + expandable queue
```

### Block notification while ON

```mermaid
sequenceDiagram
    participant Site
    participant CS as Content script
    participant BG as Background SW
    participant Storage

    Site->>CS: new Notification(title, body)
    CS->>CS: Suppress display
    CS->>BG: NOTIFICATION_BLOCKED
    BG->>BG: Append queue, increment stats
    BG->>Storage: Persist activeSession
    BG->>Popup: Optional live update if open
```

---

## Shared TypeScript Models (`src/shared/types.ts`)

```ts
type QueueEntry = {
  id: string;
  origin: string;
  message: string;
  timestamp: number;
  type: 'notification' | 'push';
};

type OriginStats = {
  notifications: number;
  permissions: number;
  push: number;
  total: number;
};

type Session = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  stats: {
    total: number;
    notifications: number;
    permissions: number;
    push: number;
    byOrigin: Record<string, OriginStats>;
  };
  notificationQueue: QueueEntry[];
  queueTrimmed: boolean; // true if hit 500 cap
};
```

---

## Chrome APIs & Manifest Permissions

```json
{
  "permissions": [
    "storage",
    "unlimitedStorage",
    "contentSettings",
    "alarms",
    "scripting"
  ],
  "host_permissions": ["<all_urls>"],
  "action": { "default_popup": "popup.html" },
  "background": { "service_worker": "background.js" },
  "commands": {
    "toggle-focus-mode": {
      "suggested_key": { "default": "Alt+Shift+F" }
    }
  }
}
```

| API | Use |
|-----|-----|
| `chrome.contentSettings.notifications` | Global block + whitelist allow |
| `chrome.scripting.registerContentScripts` | Inject hooks when ON |
| `chrome.storage.local` | All persistent data |
| `chrome.alarms` | Schedule + 30-day purge |
| `chrome.commands` | Keyboard shortcut |
| `chrome.runtime.sendMessage` | Popup ↔ background ↔ content |

---

## Blocking + Queue Strategy (Practical MVP)

| Layer | Role |
|-------|------|
| **contentSettings = block** | Ensures popups don’t slip through |
| **Content script intercept** | Capture title/body **before** suppressing |
| **Whitelist** | contentSettings `allow` per origin + skip content hook counting |

Order on intercept:

1. Check whitelist → if allowed, do not hook (or no-op hook).
2. Capture payload → send to background.
3. Return rejected promise / noop so UI never shows.

This gives **defense in depth**: even if a hook misses, `contentSettings` still blocks display.

---

## Popup ↔ Background Communication

| Message | Direction | Payload |
|---------|-----------|---------|
| `TOGGLE_FOCUS_MODE` | Popup → BG | — |
| `GET_STATE` | Popup → BG | — |
| `DISABLE_SCHEDULE` | Popup → BG | — |
| `ADD_WHITELIST` / `REMOVE` | Popup → BG | `{ origin }` |
| `EXPORT_CSV` | Popup (local) | Read session from storage |
| `NOTIFICATION_BLOCKED` | CS → BG | `{ origin, message, type }` |
| `PERMISSION_BLOCKED` | CS → BG | `{ origin }` |
| `STATE_CHANGED` | BG → Popup | `{ active, session }` |

Popup should prefer **`chrome.storage.onChanged`** for UI sync so it stays correct when the shortcut toggles without opening popup first.

---

## CSV Export (Client-Side, React)

Generate in popup — no backend:

```ts
// Pseudocode
const rows = session.notificationQueue.map(n => ({
  session_id, session_start, session_end,
  origin: n.origin,
  message: n.message,
  timestamp: new Date(n.timestamp).toISOString(),
  type: n.type,
}));
downloadBlob(toCsv(rows), `focus-mode-${session.id}.csv`);
```

---

## Stack Summary

| Question | Answer |
|----------|--------|
| **Where is data saved?** | `chrome.storage.local` (+ `unlimitedStorage`) on the user’s machine |
| **Stack** | **React + TypeScript + Vite** (CRXJS or Plasmo), MV3 service worker, content scripts |
| **Backend?** | None for MVP |
| **Source of truth** | Background service worker + storage |
| **UI** | React popup with tabbed report/history/whitelist/schedule/export |

---

## Implementation Order (Suggested)

1. **Manifest + background** — toggle, storage, contentSettings  
2. **Content script** — intercept + message background  
3. **Session + queue** — persist, cap 500, restart behavior  
4. **React popup Status tab** — ON timer, OFF report shell  
5. **SessionReport components** — hero logic, stats, queue, breakdown  
6. **History + purge** — 30-day retention + UI banner  
7. **Whitelist + permissions snapshot**  
8. **CSV export**  
9. **Schedule + E34 disable banner**  
10. **Icon states + shortcut**

---

## One Clarification Before Build

**Hero threshold:** confirm **notification count only** (not permissions + push) for the `> 10` vs honest replies rule. Recommended: **yes — notifications only**, since permissions/push are secondary in the report chips.

If you want to proceed to implementation, switch to **Agent mode** and we can scaffold the extension (`focus-mode-extension/` or a folder in your repo) with this stack. If you want to stay in Ask mode, next we can detail **schedule data model** or **content script injection** specifics.

---

**User**

We'll be achieving this in two phases 
break it down in two points 

---

**Cursor**

# Two-Phase Breakdown

---

## Phase 1 — Core Focus Mode (Block, Queue & Report)

Everything needed for Focus Mode to work end-to-end in a **single session**: toggle, block, save notifications, and show the full report when the user turns OFF.

**Includes:**
- Toolbar toggle + icon color/animation + popup (VPN-style)
- Keyboard shortcut (`Alt+Shift+F`) — toggle + open popup
- Global blocking: browser notifications, push display, permission prompts
- Whitelist (origin-level exceptions with full normal behavior)
- Permission snapshot → restore prior settings on OFF
- Notification queue (`origin`, `message`, `timestamp`) — max 500/session, clear on browser restart
- Session counters (notifications, permissions, push) per full origin
- **Full OFF report:** hero line (>10 vs honest replies), timestamps, duration, stat chips, top sites, per-origin breakdown, expandable queue, permission stats line, privacy copy, “Focus on again” CTA
- **ON popup:** status + live timer only
- Stack: React + TypeScript + Vite (CRXJS/Plasmo), MV3 service worker, `chrome.storage.local` + `unlimitedStorage`
- Core edge cases: debounced toggle, serialized ON/OFF, restart = stay ON / reset queue & counters

**Phase 1 outcome:** User can focus without interruption, review everything they missed in one report, and whitelist critical sites — **no history, export, or schedule yet.**

---

## Phase 2 — History, Export & Schedule

Everything for **retention, automation, and long-term use** across sessions.

**Includes:**
- Save completed sessions to **30-day history** (with full queue + stats)
- Auto-purge sessions older than 30 days + UI: *“Session history is kept for the last 30 days.”*
- **History tab** — past sessions with same expandable report/queue per session
- **CSV export** (notification rows + session metadata)
- **Schedule** auto ON/OFF (date/time rules — details TBD)
- Schedule conflict: manual toggle temporary; re-applies at next check
- E34 banner: *“Schedule will re-enable Focus Mode at [time]”* + **Disable schedule** option
- Export + “View in History” actions in report footer

**Phase 2 outcome:** Users get recurring focus blocks, a rolling 30-day log, and export — without changing Phase 1 blocking/queue behavior.

---

| | Phase 1 | Phase 2 |
|---|---------|---------|
| **Theme** | Works in the moment | Works over time |
| **Report** | Current session only | + History & export |
| **Automation** | Manual + shortcut | + Schedule |
| **Storage** | Active session + settings | + `sessionHistory` + purge |

Switch to **Agent mode** when you want Phase 1 scaffolded in the repo.

---

**User**

Create detailed plan for phase 1, including all the features that we are going to achieve, all the files we are going to build 

---

**Cursor**

Reviewing the repo structure and our Phase 1 requirements to draft a detailed implementation plan.


Repo is essentially empty (git only), so Phase 1 will be a new extension from scratch. Creating the detailed plan.


**Phase 1 placement**

> **Where should the Chrome extension live in this repo?**
> - New `extension/` folder at repo root (recommended) ✔
> - At repo root (no subfolder)
> - Other path (I'll specify in chat)

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing Phase 1 per the plan. Reading the plan and starting scaffolding.


Scaffolding the extension project and creating core files.


Fixing content script injection: content scripts can't use `chrome.scripting` — using DOM injection and background-based injection.


Creating popup files and utilities:


Phase 1 of the Focus Mode Chrome extension is implemented in [`extension/`](extension/). All todos are complete and the build succeeds.

## What was built

**Location:** [`extension/`](extension/) at the repo root

**Core behavior**
- VPN-style toolbar toggle with icon color change + `ON` badge
- `Alt+Shift+F` keyboard shortcut (via `chrome.commands`)
- Global blocking via `contentSettings` + MAIN-world hooks for `Notification`, `requestPermission`, and `showNotification`
- Notification queue (max 500/session) with origin, message, and timestamp
- Full OFF session report (hero line, stats, top sites, breakdown, queue, permissions, CTA)
- Whitelist tab (origin-level exceptions)
- Permission snapshot/restore for whitelisted origins
- Browser restart: stays ON, resets queue/timer

## Load in Chrome

```bash
cd extension
npm install
npm run generate-icons
npm run build
```

Then load **`extension/dist`** as an unpacked extension at `chrome://extensions`.

## Project layout

```
extension/
├── src/
│   ├── background/     # Toggle, session, permissions, icons, messages
│   ├── content/        # MAIN-world hooks + isolated bridge
│   ├── popup/          # React UI (Status + Whitelist tabs)
│   └── shared/         # Types, constants, defaults, origin utils
├── public/icons/       # Generated active/inactive icons
├── dist/               # Build output (load this in Chrome)
└── README.md           # Setup + manual test checklist
```

## Quick test

1. Turn Focus Mode **ON**
2. On any page, run in console:
   ```javascript
   new Notification('Focus test', { body: 'Should be blocked' });
   ```
3. Turn **OFF** → expand **View all notifications from Focus mode** in the report

Phase 2 (history, CSV export, schedule) is intentionally not included yet. See [`extension/README.md`](extension/README.md) for full details and limitations.

---

**User**

Now create a detailed plan for point 2 as well 

---

**Cursor**

Reviewing the Phase 1 implementation to draft an accurate Phase 2 plan.


Reviewing Phase 1 complete. Drafting the Phase 2 plan from the requirements and existing codebase.


**Phase 2 schedule scope**

> **For Phase 2 scheduling, which rule model should we implement?**
> - Recurring daily windows (days of week + start/end time, e.g. Mon–Fri 9am–5pm) — Recommended MVP ✔
> - One-off date/time blocks only (single start + end datetime)
> - Both recurring windows and one-off blocks

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing Phase 2 per the plan. Reviewing the codebase and starting with the data model.


Implementing Phase 2 systematically, starting with the data layer and backend modules.


Creating popup UI components:


Moving schedule utilities to shared code so the popup doesn't import the background bundle.


Phase 2 is implemented and the build passes. Summary:

## Phase 2 Complete

### Backend
- **`history-manager.ts`** — append sessions, 30-day purge, export filtering
- **`schedule-manager.ts`** — daily window evaluation, override handling, next-ON time
- **`purge-manager.ts`** — `schedule-check` (1 min) + `history-purge` (24h) alarms
- **`csv-export.ts`** — RFC4180 CSV generation
- **`shared/schedule-utils.ts`** — shared schedule logic for background + popup
- Updated **`session-manager`**, **`focus-mode`**, **`message-handler`**, **`storage`**, **`index`**
- Added **`alarms`** permission to manifest

### Popup (4 tabs)
- **History** — 30-day banner, session cards, expandable reports, Export all
- **Schedule** — master toggle, rule CRUD (days + times), paused state UI
- **Status** — `ScheduleBanner` (E34) with Disable schedule
- **Report footer** — Export CSV + View in History (highlights session in History tab)

### Storage schema
- `sessionHistory[]`, `schedule`, `scheduleOverride`
- Phase 1 users migrated via `initStorage()` merge defaults

### Load & test
```bash
cd extension
npm run build
```
Load **`extension/dist`** in `chrome://extensions`.

Full docs and test checklist: [`extension/README.md`](extension/README.md).

