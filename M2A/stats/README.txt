STATS UPDATE WORKFLOW

Edit skaters-2026-27.csv and goalies-2026-27.csv directly in GitHub. The Stats page loads these files automatically on each visit.

The first row is the column header. Keep the header names and order unchanged. Type a player's current value in the matching row. Use -- when a statistic is not available yet.

skaters-2026-27.csv columns:
#, Player, Pos, GP, G, A, PTS, Pt/G, PPG, SHG, GWG, SOG, W, PIM, SH%

goalies-2026-27.csv columns:
#, Player, Pos, GP, W, L, OTL, SOL, GA, GAA, SVS, SV%, SO, Min, SOW

CSV files can be opened and edited in Excel or Google Sheets. After committing changes to GitHub, refresh stats.html to see the updated rows.

NEW SEASON: duplicate both files with the new season in the name (for example skaters-2027-28.csv), then add a matching entry to the top of the `statsSeasons` list in stats.js so it becomes the default. See the "Starting a new season" section in the main README.md for the full checklist.
