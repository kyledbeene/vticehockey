const scoreGrid = document.querySelector('.score-grid');
// Add a new entry at the top when a new season starts, and add a matching games-YYYY-YY.csv file.
const gameSeasons = [
  { id: '2026-27', label: '2026-27', file: 'games-2026-27.csv' }
];
const opponentLogoAssets = [
  'pdf-logos/logo_0.png',
  'pdf-logos/logo_1.png',
  'pdf-logos/logo_2.png',
  'pdf-logos/logo_3.png',
  'pdf-logos/logo_4.png',
  'pdf-logos/logo_5.png',
  'pdf-logos/logo_6.png',
  'pdf-logos/logo_7.png',
  'pdf-logos/logo_8.png',
  'pdf-logos/logo_9.png',
  'pdf-logos/logo_10.png',
  'pdf-logos/logo_11.png',
  'pdf-logos/logo_12.png',
  'pdf-logos/logo_13.png'
];
const opponentLogoMap = {
  'nc-state': 'school-logos/ncstate.png',
  unc: 'school-logos/unc.png',
  lindenwood: 'school-logos/lindenwood.png',
  siena: 'school-logos/siena.png',
  'weber-state': 'school-logos/weberst.png',
  liberty: 'school-logos/libertyaway.png',
  'liberty-d1': 'school-logos/libertyaway.png',
  'wake-forest': 'school-logos/wakeforest.png',
  uncw: 'school-logos/uncw.png',
  hpu: 'school-logos/highpoint.png',
  'fall-classic': 'school-logos/acchl.png',
  'south-carolina': 'school-logos/acha.png',
  wvu: 'school-logos/westvirginia.png',
  ohio: 'school-logos/ohio.png',
  'miami-oh': 'school-logos/miami.png',
  maryland: 'school-logos/maryland.png',
  'acchl-playoffs': 'school-logos/acchl.png',
  'acha-regionals': 'school-logos/acha.png'
};

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
function normalizeOpponentKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function opponentLogo(game, index) {
  if (!game || !game.opponent) return 'school-logos/libertyaway.png';
  const slug = normalizeOpponentKey(game.opponent);
  if (slug === 'liberty' || slug === 'liberty-d1') {
    const location = String(game.location || '').toLowerCase();
    return location.includes('home') ? 'school-logos/libertyhome.png' : 'school-logos/libertyaway.png';
  }
  if (opponentLogoMap[slug]) return opponentLogoMap[slug];
  const seed = (index + game.opponent.length + game.id.length) % opponentLogoAssets.length;
  return opponentLogoAssets[seed];
}
function scoreLogoMarkup(game, logoPath) {
  const initials = opponentMark(game.opponent || 'OPP');
  return `<div class="score-logo opponent-logo-box"><img class="opponent-logo" src="${logoPath}" alt="${escapeHtml(game.opponent)} logo" onerror="this.style.display='none'; this.parentElement.querySelector('.opponent-mark-overlay').style.display='flex';" /><span class="opponent-mark-overlay">${initials}</span></div>`;
}
function gameCard(game, index) {
  const locationClass = game.location.toLowerCase();
  const pendingClass = !game.vt_score || !game.opp_score || game.vt_score.toUpperCase() === 'TBD' || game.opp_score.toUpperCase() === 'TBD' ? ' pending' : '';
  const logoPath = opponentLogo(game, index);
  return `<a class="score-card ${locationClass}${pendingClass}" href="game-report.html?game=${encodeURIComponent(game.id)}"><div class="score-card-header"><small>${formatDate(game.date)}</small><small class="score-location">${escapeHtml(game.location)}</small></div><div class="score-matchup"><div class="score-team"><div class="score-logo"><div class="crest"><span>VT</span><i></i></div></div><strong>Virginia Tech</strong><b>${escapeHtml(game.vt_score || 'TBD')}</b></div><span class="score-vs">VS</span><div class="score-team">${scoreLogoMarkup(game, logoPath)}<strong>${escapeHtml(game.opponent)}</strong><b>${escapeHtml(game.opp_score || 'TBD')}</b></div></div><div class="score-card-footer">Game report <span>↗</span></div></a>`;
}
async function loadGames(season) {
  try {
    const response = await fetch(season.file, {cache:'no-store'});
    if (!response.ok) throw new Error('Games file unavailable');
    const games = parseCsv(await response.text()).map(row => ({id:row[0], date:row[1], location:row[2], opponent:row[3], vt_score:row[4], opp_score:row[5]}));
    scoreGrid.innerHTML = games.map((game, index) => gameCard(game, index)).join('');
  } catch (error) {
    console.info('Games CSV is not available; keeping the static score schedule.');
  }
  document.querySelectorAll('[data-season-text]').forEach(el => { el.textContent = season.label; });
}

function initSeasonSelect() {
  const select = document.querySelector('#scores-season-select');
  if (!select) return;
  select.innerHTML = gameSeasons.map(season => `<option value="${season.id}">${season.label}</option>`).join('');
  select.addEventListener('change', () => {
    const season = gameSeasons.find(item => item.id === select.value) || gameSeasons[0];
    loadGames(season);
  });
}

initSeasonSelect();
loadGames(gameSeasons[0]);
