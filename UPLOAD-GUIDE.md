# Virginia Tech Hockey Content Upload Guide

Use this guide to update the website through GitHub. The site reads these files and folders automatically after your changes are committed.

## Before You Start

1. Open the repository on GitHub: `kyledbeene/vticehockey`.
2. Open the folder or file described in the section you are updating.
3. Add or edit the content.
4. Click **Commit changes**.
5. Wait for GitHub Pages to deploy, then refresh the website.

Keep existing file names, column headers, and formats exactly as shown. Use lowercase letters and hyphens in new file and folder names.

## Photos

Create one folder inside `photos` for each game. Name the folder with the game's date and opponent:

```text
photos/2026-09-12-unc/
```

Add the image files inside that folder. Supported formats are JPG, JPEG, PNG, GIF, and WEBP.

Example:

```text
photos/
└── 2026-09-12-unc/
    ├── team-arrival.jpg
    ├── first-period.png
    └── celebration.webp
```

Upload the folder and its images to GitHub. The Photos page creates the album automatically and displays the images in the folder. Do not put images directly in `photos` without a game folder.

## Game Notes

Export the game notes from Adobe as a PDF and add the PDF to the `game-notes` folder. Name it with the game date and opponent in lowercase hyphenated form:

```text
game-notes/2026-09-11-nc-state.pdf
```

The date must use `YYYY-MM-DD`, followed by the opponent name. For example:

```text
game-notes/
├── 2026-09-11-nc-state.pdf
└── 2026-09-12-unc.pdf
```

After the PDF is committed, the Game Notes page finds it automatically, sorts notes newest first, and opens it in the shared viewer. Use a PDF rather than an image or Word document.

## Scores

Edit `games-2026-27.csv`. Do not edit the score cards in `scores.html`; those cards are fallback markup only.

Keep this header unchanged:

```csv
id,date,location,opponent,vt_score,opp_score
```

Find the game row and replace `TBD` with the final scores:

```csv
2026-09-11-nc-state,2026-09-11,Away,NC State D1,4,2
```

The columns are:

```text
id, date, location, opponent, Virginia Tech score, opponent score
```

Use `TBD` for a game that has not been played. Keep the existing `id`, date, location, and opponent unless the schedule itself needs to change. The Scores page, homepage result card, and Game Report matchup all use this file.

## Roster

Edit `roster-2026-27.csv`. Keep this header unchanged:

```csv
group,number,name,year,height,weight,shot,hometown
```

The `group` column must be `forwards`, `defensemen`, or `goalies`. Write height as feet and inches without a quote mark, for example `6'1` (the page adds the inch mark for you). Rows display in the order they are saved, so keep players grouped together and sorted however you want them to appear.

## Game Reports

Add one Markdown file to `game-reports` for each completed game. The file name must exactly match the game's `id` in `games.csv`, followed by `.md`.

Example file:

```text
game-reports/2026-09-11-nc-state.md
```

Use this format:

```markdown
---
title: Hokies open the season against NC State
summary: Virginia Tech starts the season with a strong road performance.
date: 2026-09-11
---

Write the complete game recap here.

## Scoring summary

Add scoring details here.
```

The report page gets the matchup and score from `games-2026-27.csv`, and gets the title, summary, date, and recap from the Markdown file. Update the score in `games-2026-27.csv` separately; do not put the score in the report file as a replacement for the CSV score.

## Articles

Add one Markdown file to the `news` folder. Use a date-based name with lowercase hyphens:

```text
news/2026-09-12-season-opener.md
```

Put the article information at the top between the two `---` lines:

```markdown
---
title: Hokies open the season with a win
category: GAME RECAP
author: Your Name
summary: Virginia Tech begins the season with a convincing road win.
date: 2026-09-12
---

Write the full article here.

Add paragraphs, headings, links, and other Markdown as needed.
```

The `title`, `category`, `summary`, and `date` fields appear in the News page and cards. Add an optional `author` field to display a byline on the full article page. You may also add an optional direct image URL:

```yaml
image: https://example.com/photo.jpg
```

The article date controls newest-first ordering. Files such as `ARTICLE-FORMAT.txt` are instructions only and will not appear as articles.

## Stats

Update the two CSV files in the `stats` folder:

```text
stats/skaters-2026-27.csv
stats/goalies-2026-27.csv
```

You can edit them directly in GitHub or open them in Excel or Google Sheets. Keep the first row, column names, and column order unchanged. Edit the matching player's row and use `--` when a statistic is not available yet.

Skater header and example row:

```csv
#,Player,Pos,GP,G,A,PTS,Pt/G,PPG,SHG,GWG,SOG,W,PIM,SH%
7,Jordan Example,F,12,8,11,19,1.58,2,0,1,42,0,6,19.0
```

Goalie header and example row:

```csv
#,Player,Pos,GP,W,L,OTL,SOL,GA,GAA,SVS,SV%,SO,Min,SOW
30,Taylor Example,G,12,8,3,1,0,24,2.00,301,0.926,2,720,0
```

After committing the files, refresh the Stats page. The page loads the latest CSV values automatically.

## Starting a New Season

Scores, Roster, and Stats each have a Season dropdown and read from a CSV file named for that season, so a new season does not overwrite the old one:

1. Duplicate the current CSV file(s) and rename the copies with the new season, for example `games-2027-28.csv`, `roster-2027-28.csv`, `stats/skaters-2027-28.csv`, `stats/goalies-2027-28.csv`. Fill in the new data.
2. Add a new entry to the top of the season list at the top of `scores.js`, `roster.js`, and `stats.js`, pointing to the new file name(s). The top entry becomes the default season shown on page load.
3. Update the filename referenced in `scores-home.js` and `game-report.js` to the new season's games file, since the homepage cards and the game report page do not have a dropdown and always show the current season.
4. Replace `schedule.jpg` with the new schedule graphic.
5. Photos need no renaming — just add new dated album folders as usual and the Season filter picks up the year automatically.

## Quick Checklist

- Photos are inside a dated game folder under `photos`.
- Scores are updated in the current season's `games-YYYY-YY.csv`, not in static HTML.
- Report file names exactly match the corresponding game IDs.
- Article files include valid front matter and a date.
- Stats headers and column order are unchanged.
- Roster header and `group` values (`forwards`, `defensemen`, `goalies`) are unchanged.
- Changes are committed to GitHub before refreshing the site.
