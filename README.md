# Wearwise — v1.4

Mobile-friendly progressive web app for weather-based personal clothing recommendations.

## Get started

1. Upload all files in this folder (preserving the file names) to a static HTTPS host such as GitHub Pages, Netlify, or Vercel. No build step or server/database is required.
2. Open the hosted URL in Safari. On iPhone, choose Share → Add to Home Screen.
3. Search for a destination and choose the matching result, select a date and outside hours, then press **Get forecast & recommendation**.
4. Use **Daily log** to record actual clothing and comfort. The selected day's full hourly forecast snapshot will be attached to the log when date and location match.
5. Regularly use **My data → Export JSON backup**. In **Settings**, you can import a backup.

## What is included

- Open-Meteo destination lookup and 16-day hourly forecast API (internet connection required for fresh weather).
- Personal clothing recommendations that rank previously successful logged outfit combinations by similarity of weather and activity, accounting for negative comfort feedback.
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

## v1.3: Editable wardrobe

- Settings → Manage your clothing options: add, rename, or delete choices for bottoms, base layers, additional layers and outer layers.
- New options immediately appear in Daily log menus; old logs are never altered when clothing choices change.
- Wardrobe customizations stay in the device's local storage and are now included in JSON exports. Importing older backups without wardrobe data leaves current choices unchanged.
- Replaced in v1.4: the recommender now uses empirical feedback and does not hardcode garment warmth. Newly added garments require logged successful wear before recommendation.

## v1.4: Pattern-based recommendations

- Replaced temperature-to-garment rules with a similarity-based ranking of observed combinations and outcomes. Weather variables influence similarity, not fixed garment warmth ratings.
- Only outfits with at least one **good** or **perfect** result are recommended. Hot, cold, and mixed outcomes contribute negative or cautious evidence.
- Exact outfit combinations use base, additional layer, outer layer, and bottoms. Removed wardrobe items do not appear in future suggestions; historical logs remain unchanged.
- Confidence reflects proximity and amount of supporting evidence. New garments require successful logs before they can be recommended.
- Saved data and JSON backups use the same format as earlier versions. This is an experimental model and is not a validated statistical prediction of comfort.

### Update instructions and data safety
1. On your current site, go to **My data → Export JSON backup** before updating.
2. Extract the ZIP and upload its **eight** files directly into the root of your existing GitHub repository, replacing matching filenames and adding `pattern.js`.
3. Confirm the GitHub Pages deployment completes, reload Safari/Chrome, and check the footer shows **Wearwise v1.4**.
4. Check that your old logs still appear. Do not clear site data; histories are browser-local.

The algorithm's confidence labels are descriptive, not calibrated accuracy probabilities. Only logged comfort categories (perfect/good/hot/cold/mixed) are used for scores. Notes are shown as evidence but not automatically interpreted as labels.
