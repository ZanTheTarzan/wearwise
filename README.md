# Wearwise — v1.1

Mobile-friendly progressive web app for weather-based personal clothing recommendations.

## Get started

1. Upload all files in this folder (preserving the file names) to a static HTTPS host such as GitHub Pages, Netlify, or Vercel. No build step or server/database is required.
2. Open the hosted URL in Safari. On iPhone, choose Share → Add to Home Screen.
3. Search for a destination and choose the matching result, select a date and outside hours, then press **Get forecast & recommendation**.
4. Use **Daily log** to record actual clothing and comfort. The selected day's full hourly forecast snapshot will be attached to the log when date and location match.
5. Regularly use **My data → Export JSON backup**. In **Settings**, you can import a backup.

## What is included

- Open-Meteo destination lookup and 16-day hourly forecast API (internet connection required for fresh weather).
- Personal clothing recommendations that use temperature, feels-like, wind, rain, activity, and nearest matching historical daily clothing summaries.
- 25 transcribed historical **daily summaries** (October 29 through November 23, excluding days with no logs), including clothing and comfort notes. The 625 originally pasted hourly observations are **not** reproduced here. New daily logs can capture actual full forecast snapshots.
- Locally stored records, export/import, PWA home-screen support and offline reopening of cached app shell.

## Limitations

- This is an experimental heuristic/similarity system, not a validated machine-learning model. Similar historic conditions do not prove identical comfort outcomes. Weather and clothing recommendations are estimates.
- Data are stored in localStorage on **one browser/device**. They do not synchronize between devices. No notifications or automatic morning push alerts are included yet.
- Opening `index.html` directly from the Files app may block APIs or storage and won't install the service worker. Host the app on HTTPS.
- Full historical hourly conditions were not imported; historical summary weather values are approximate and should not be treated as exact hourly observations.
- Location search can select the first matching place when you type a destination but do not click a suggestion; select a suggestion for best accuracy.
- A free/noncommercial Open-Meteo tier may have usage conditions; review terms if publicly distributing/commercializing the app.

## v1.1 update

My data now has expandable saved weather summaries and hourly forecast tables. Save confirmation explicitly states when weather was or was not attached. Existing local data and backup format are retained. Export your JSON backup before deploying updates.


## v1.2: automatic snapshots

- The Daily log save button now retrieves matching date-and-location hourly weather automatically; a Forecast-tab lookup is no longer required.
- If the weather request fails, the app asks for explicit permission before saving an entry without a weather snapshot.
- My data now offers **Attach available weather** on user-created records that have none, where the date is within the supported window. This fetches weather afterward and does **not** recover the exact forecast issued on the original date.
- Weather fields in the snapshot are forecast/provider data, **not** independently observed measurements. Data are saved in browser local storage on that device; export backups regularly.
