const lastResultCard = document.querySelector('#last-result-card');
const nextUpCard = document.querySelector('#next-up-card');

function parseCsv(csv) { return csv.trim().split(/\r?\n/).slice(1).map(line => { const fields=[]; let field=''; let quoted=false; for (const character of line) { if (character === '"') quoted=!quoted; else if (character === ',' && !quoted) { fields.push(field.trim()); field=''; } else field+=character; } fields.push(field.trim()); return fields; }).filter(row => row[0]); }

function updateCard(card, game, label, detail) {
  if (!card || !game) return;
  card.href = 'scores.html';
  card.querySelector('strong').textContent = label;
  card.querySelector('div span:last-child').textContent = detail;
}

async function updateHomeScores() {
  if (!lastResultCard || !nextUpCard) return;
  try {
    // Update this filename when a new season's games CSV is added.
    const response = await fetch('games-2026-27.csv', { cache: 'no-store' });
    if (!response.ok) throw new Error('Games file unavailable');
    const games = parseCsv(await response.text()).map(row => ({id:row[0], date:row[1], opponent:row[3], scores:[row[4],row[5]]}));
    const completed = games.filter(game => game.scores.every(score => score && score.toUpperCase() !== 'TBD'));
    const upcoming = games.find(game => !completed.includes(game));
    const last = completed[completed.length - 1];
    if (last) {
      const hokieScore = Number(last.scores[0]);
      const opponentScore = Number(last.scores[1]);
      const result = hokieScore > opponentScore ? 'WIN' : hokieScore < opponentScore ? 'LOSS' : 'TIE';
      updateCard(lastResultCard, last, `VT ${last.scores[0]} — ${last.scores[1]} ${last.opponent}`, `${result} / ${last.date}`);
    } else {
      lastResultCard.querySelector('strong').textContent = 'No completed results';
      lastResultCard.querySelector('div span:last-child').textContent = 'VIEW SCORES';
    }
    if (upcoming) updateCard(nextUpCard, upcoming, `VT vs. ${upcoming.opponent}`, upcoming.date);
    else nextUpCard.querySelector('strong').textContent = 'Schedule complete';
  } catch (error) {
    console.info('Homepage score cards will use their loading state until scores.html is available.');
  }
}

updateHomeScores();