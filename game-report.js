const gameId = new URLSearchParams(window.location.search).get('game') || '';
const gameParts = gameId.split('-');
const gameDate = new Date(Number(gameParts[0]), Number(gameParts[1]) - 1, Number(gameParts[2]));
const opponentKey = gameParts.slice(3).join('-');
const opponentNames = {
  'nc-state': 'NC State D1', 'unc': 'UNC D1', lindenwood: 'Lindenwood', siena: 'Siena', 'weber-state': 'Weber State', liberty: 'Liberty', 'liberty-d1': 'Liberty D1', 'wake-forest': 'Wake Forest', uncw: 'UNCW', hpu: 'HPU', 'fall-classic': 'ACCHL Fall Classic', 'south-carolina': 'South Carolina', wvu: 'WVU', ohio: 'Ohio', 'miami-oh': 'Miami (OH)', maryland: 'Maryland', 'acchl-playoffs': 'ACCHL Playoffs', 'acha-regionals': 'ACHA SE Regionals'
};
const awayGames = new Set(['2026-09-11-nc-state', '2026-09-12-unc', '2026-09-18-lindenwood', '2026-09-19-siena', '2026-09-20-weber-state', '2026-09-25-liberty', '2026-10-09-wake-forest', '2026-10-10-wake-forest', '2026-10-23-hpu', '2026-10-24-hpu', '2026-10-30-liberty-d1', '2026-11-13-liberty']);
const neutralGames = new Set(['2026-11-06-fall-classic', '2026-11-07-fall-classic', '2026-11-08-fall-classic', '2026-11-20-south-carolina', '2027-02-12-acchl-playoffs', '2027-02-13-acchl-playoffs', '2027-02-14-acchl-playoffs', '2027-02-19-acha-regionals', '2027-02-20-acha-regionals']);
const gameLocation = neutralGames.has(gameId) ? 'Neutral' : awayGames.has(gameId) ? 'Away' : 'Home';
const readableDate = gameDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}).toUpperCase();
const opponent = opponentNames[opponentKey] || 'Opponent';

document.title = `${opponent} | Virginia Tech Hockey Game Report`;
document.querySelector('#report-title').innerHTML = `${opponent.toUpperCase()} <em>REPORT.</em>`;
document.querySelector('#report-meta').textContent = `${readableDate} · ${gameLocation}`;
document.querySelector('#report-heading').textContent = `Virginia Tech vs. ${opponent}`;
document.querySelector('#report-copy').textContent = `The complete recap, final score, scoring summary, and game-day notes for Virginia Tech vs. ${opponent} will be added here.`;
document.querySelector('#report-date').textContent = readableDate;
document.querySelector('#report-location').textContent = gameLocation;
document.querySelector('#report-opponent').textContent = opponent;
document.querySelector('#report-opponent-mark').textContent = opponent.split(' ').map((word) => word[0]).join('').slice(0, 4).toUpperCase();
