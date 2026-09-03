# Virginia Tech Club Hockey

 A dependency-free responsive homepage for Virginia Tech Club Hockey. It includes the team identity, primary navigation, featured article carousel, upcoming game, latest result, and watch sections.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server. No package installation is required.

Replace the typographic VT crest in `index.html` with the official team logo asset when one is available. The roster page uses a single-page 2024-25 roster PDF recreated from the supplied final page; replace `roster.pdf` with the original extracted page when the source PDF is added to the project.

## GitHub news

The News page reads Markdown articles from the `news` folder in GitHub. The homepage carousel uses the three newest articles by date automatically.

To publish an article:

1. Copy `news/ARTICLE-TEMPLATE.txt` and rename the copy with lowercase hyphens, for example `2026-09-12-season-opener.md`.
2. Replace the `title`, `category`, `summary`, and `date` values at the top.
3. Write the full article below the closing `---` line using Markdown.
4. Add an optional `image:` field with a direct image URL.
5. Upload or commit the new `.md` file to the repository's `news` folder.
6. Refresh the website after GitHub has saved the file.

Use `news/ARTICLE-FORMAT.txt` for the field reference. The article date controls the newest-first order. The template and format reference are `.txt` files, so they will not appear as news cards.

## Game notes

Export the notes from Adobe as a PDF and upload the file to the `game-notes` folder in GitHub. Name it `YYYY-MM-DD-opponent.pdf`, such as `2026-09-11-nc-state.pdf`. The Game Notes page creates a tile automatically, sorted newest first, and opens the selected PDF in a shared viewer with an `All game notes` link.

## Game photos

Create one folder per game inside `photos` and name it `YYYY-MM-DD-opponent`, such as `2026-09-12-unc`. Put all JPG, JPEG, PNG, GIF, or WEBP images for that game inside the folder. Upload the folder to GitHub. The Photos page creates the album tile automatically, and the album page displays every image in the folder.

## Stats

Update `stats/skaters.csv` and `stats/goalies.csv` directly in GitHub or open them in Excel or Google Sheets. Keep the first-row headers and their order unchanged, then edit the values in each player's row. The Stats page loads the CSV files automatically after they are committed. See `stats/README.txt` for the column order.
