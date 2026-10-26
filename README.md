# Virginia Tech Club Hockey

 A dependency-free responsive homepage for Virginia Tech Club Hockey. It includes the team identity, primary navigation, featured article carousel, upcoming game, latest result, and watch sections.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server. No package installation is required.

Replace the typographic VT crest in `index.html` with the official team logo asset when one is available. The roster page uses a single-page 2024-25 roster PDF recreated from the supplied final page; replace `roster.pdf` with the original extracted page when the source PDF is added to the project.

## Search indexing

`robots.txt` points search engines to `sitemap.xml`. When adding or removing a public page, update the sitemap and give the page its own descriptive title, meta description, and canonical URL. When publishing a news article, also add its `article.html?article=...` URL to the sitemap. News article metadata is set by `article.js` from each article's front matter and content. Submit the sitemap in Google Search Console after verifying the domain; rankings depend on ongoing useful content, links, and search performance, not metadata alone.

## Roster

Update `roster-2026-27.csv` directly in GitHub or open it in Excel or Google Sheets. Keep the header row (`group,number,name,year,height,weight,shot,hometown`) unchanged. The `group` column must be `forwards`, `defensemen`, or `goalies`. Write height as feet and inches without a quote mark, for example `6'1` (the page adds the inch mark automatically). The Roster page loads this file automatically and lists players in the row order you save them in.

## GitHub news

The News page reads Markdown articles from the `news` folder in GitHub. The homepage carousel uses the three newest articles by date automatically.

To publish an article:

1. Copy `news/ARTICLE-TEMPLATE.txt` and rename the copy with lowercase hyphens, for example `2026-09-12-season-opener.md`.
2. Replace the `title`, `category`, `summary`, and `date` values at the top.
3. Write the full article below the closing `---` line using Markdown.
4. Add an optional `image:` field with a direct image URL.
5. Upload or commit the new `.md` file to the repository's `news` folder.
6. Wait about a minute: a GitHub Action (`.github/workflows/news-index.yml`) rebuilds `news/news-index.json` and adds the article to `sitemap.xml` automatically. Check the Actions tab if it doesn't appear.
7. Refresh the website. The News page caches the list for 5 minutes, so a hard refresh may be needed.

The News page reads `news/news-index.json`, not the `.md` files directly. If the Action is ever unavailable, run `python3 generate-news-index.py` locally and commit the changed `news/news-index.json` and `sitemap.xml`.

Use `news/ARTICLE-FORMAT.txt` for the field reference. The article date controls the newest-first order. The template and format reference are `.txt` files, so they will not appear as news cards.

## Game notes

Export the notes from Adobe as a PDF and upload the file to the `game-notes` folder in GitHub. Name it `YYYY-MM-DD-opponent.pdf`, such as `2026-09-11-nc-state.pdf`. The Game Notes page creates a tile automatically, sorted newest first, and opens the selected PDF in a shared viewer with an `All game notes` link.

## Game photos

Create one folder per game inside `photos` and name it `YYYY-MM-DD-opponent`, such as `2026-09-12-unc`. Put all JPG, JPEG, PNG, GIF, or WEBP images for that game inside the folder. Upload the folder to GitHub. The Photos page creates the album tile automatically, and the album page displays every image in the folder.

## Stats

Update `stats/skaters-2026-27.csv` and `stats/goalies-2026-27.csv` directly in GitHub or open them in Excel or Google Sheets. Keep the first-row headers and their order unchanged, then edit the values in each player's row. The Stats page loads the CSV files automatically after they are committed. See `stats/README.txt` for the column order.

## Game reports

Add one Markdown file to `game-reports` for each completed game. Name it with the exact game ID from `scores.html`, such as `2026-09-11-nc-state.md`. The shared report page loads the title, summary, and recap from that file automatically. Update the score values in `games-2026-27.csv` separately; the report matchup and homepage score cards read those values automatically. See `game-reports/REPORT-TEMPLATE.txt` for the format.

## Scores and schedule

Update every game in `games-2026-27.csv`. Keep the header row unchanged and edit `vt_score` and `opp_score` when a result is final. Use `TBD` for games that have not been played. The Scores page, homepage result cards, and Game Report matchup all load this one file automatically. Do not edit the static game cards in `scores.html`; they are fallback markup only.

## Starting a new season

Scores, Roster, and Stats each read from a CSV file named with the current season, and each page has a Season dropdown to switch between years. To add a new season instead of overwriting the current one:

1. Duplicate the current season's CSV file(s) and rename the copies with the new season, for example `games-2027-28.csv`, `roster-2027-28.csv`, `stats/skaters-2027-28.csv`, and `stats/goalies-2027-28.csv`. Fill in the new season's data.
2. In `scores.js`, `roster.js`, and `stats.js`, add a new entry to the top of the `gameSeasons` / `rosterSeasons` / `statsSeasons` list at the top of each file, pointing at the new file name(s). The top entry is what loads by default, so put the newest season first.
3. Update the filename in `scores-home.js` and `game-report.js` (the line that fetches `games-2026-27.csv`) to the new season's games file, since the homepage cards and game report page always show the current season and have no dropdown.
4. Replace `schedule.jpg` with the new season's schedule graphic.
5. For Photos, just create new album folders as usual (see below) — the year is read automatically from the folder name, so no file renaming is needed there.

Older seasons remain selectable from each dropdown as long as their CSV files stay in the project.

## Auto-updating stats

Run `python3 scripts/update_stats.py d2` after a D2 game to pull the latest numbers from the ACHA stats feed into `stats/*.csv`. For D3, export the player and goalie tables from GameSheet (they save to Downloads as `player-stats*.csv` and `goalie-stats*.csv`), then run `python3 scripts/update_stats.py d3` to merge them into `M2A/stats/*.csv`. Use `all` for both and `--dry-run` to preview. Existing names, positions and row order are kept; only the stat columns change. Then review with `git diff` and commit.
