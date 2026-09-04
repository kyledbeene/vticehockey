const scoreGrid = document.querySelector('.score-grid');
const gamesPath = 'games.csv';

function parseCsv(csv) {
  return csv.trim().split(/\r?\n/).slice(1).map(line => {
    const fields = [];
    let field = '';
    let quoted = false;
    for (const character of line) {
      if (character === '"') quoted = !quoted;
      else if (character === ',' && !quoted) { fields.push(field.trim()); field = ''; }
      else field += character;
    }
    fields.push(field.trim());
    return fields;
  }).filter(row => row[0]);
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character])); }
function formatDate(value) { return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}).toUpperCase(); }
function opponentMark(opponent) { return opponent.split(/\s+/).map(word => word[0]).join('').slice(0, 4).toUpperCase(); }
function gameCard(game) {
  const locationClass = game.location.toLowerCase();
  const pendingClass = !game.vt_score || !game.opp_score || game.vt_score.toUpperCase() === 'TBD' || game.opp_score.toUpperCase() === 'TBD' ? ' pending' : '';
  return `<a class="score-card ${locationClass}${pendingClass}" href="game-report.html?game=${encodeURIComponent(game.id)}"><div class="score-card-header"><small>${formatDate(game.date)}</small><small class="score-location">${escapeHtml(game.location)}</small></div><div class="score-matchup"><div class="score-team"><div class="score-logo"><div class="crest"><span>VT</span><i></i></div></div><strong>Virginia Tech</strong><b>${escapeHtml(game.vt_score || 'TBD')}</b></div><span class="score-vs">VS</span><div class="score-team"><div class="score-logo"><span class="opponent-mark">${escapeHtml(opponentMark(game.opponent))}</span></div><strong>${escapeHtml(game.opponent)}</strong><b>${escapeHtml(game.opp_score || 'TBD')}</b></div></div><div class="score-card-footer">Game report <span>↗</span></div></a>`;
}
async function loadGames() {
  try {
    const response = await fetch(gamesPath, {cache:'no-store'});
    if (!response.ok) throw new Error('Games file unavailable');
    const games = parseCsv(await response.text()).map(row => ({id:row[0], date:row[1], location:row[2], opponent:row[3], vt_score:row[4], opp_score:row[5]}));
    scoreGrid.innerHTML = games.map(gameCard).join('');
  } catch (error) {
    console.info('Games CSV is not available; keeping the static score schedule.');
  }
}
loadGames();
