// Add a new entry at the top when a new season starts, and add a matching roster-YYYY-YY.csv file.
const rosterSeasons = [
  { id: '2026-27', label: '2026-27', file: 'roster-2026-27.csv' }
];

const fallbackRosterGroups = {
  forwards: [
    [3, 'Ethan Garlock', 'Senior', "6'3", '195', 'R', 'Princeton, NJ'],
    [6, "Justin D'Antona", 'Sophomore', "5'9", '190', 'L', 'Melrose, MA'],
    [8, 'Cooper Reger', 'Freshman', "6'1", '172', 'L', 'Roanoke, VA'],
    [10, 'Zack Stewart', 'Junior', "6'0", '195', 'L', 'Richmond, VA'],
    [11, 'Michael McCabe', 'Freshman', "5'11", '170', 'R', 'Matawan, NJ'],
    [14, 'Barrett Lunder', 'Senior', "5'8", '165', 'L', 'South Salem, NY'],
    [15, 'Tyler Gordon', 'Senior', "6'0", '170', 'R', 'Woodbridge, VA'],
    [16, 'Jacob Wachtel', 'Sophomore', "6'0", '175', 'R', 'New Providence, NJ'],
    [21, 'Gavin Nau', 'Sophomore', "6'0", '185', 'R', 'Hopewell, NJ'],
    [24, 'West Vaillant', 'Sophomore', "5'8", '165', 'L', 'Exeter, NH'],
    [26, 'Chase Olszewski', 'Freshman', "6'0", '175', 'L', 'Florham Park, NJ'],
    [29, 'Marshall Campbell', 'Senior', "5'11", '245', 'R', 'Richmond, VA'],
    [40, 'Jackson DeVivo', 'Sophomore', "6'0", '180', 'L', 'Newburyport, MA'],
    [41, 'Kam Khazai', 'Senior', "5'8", '170', 'L', 'McLean, VA'],
    [42, 'Ewan Andrew', 'Senior', "5'10", '175', 'R', 'Cary, NC']
  ],
  defensemen: [
    [2, 'Bryan Rice', 'Junior', "6'0", '200', 'L', 'Bowie, MD'],
    [7, 'JH Lages', 'Junior', "6'0", '180', 'R', 'McLean, VA'],
    [9, 'Sean Mohr', 'Sophomore', "6'0", '175', 'R', 'Mamaroneck, NY'],
    [13, 'Murphy MacLeod', 'Sophomore', "5'9", '162', 'R', 'Westford, MA'],
    [18, 'Casey Reagan', 'Freshman', "6'3", '200', 'R', 'Pittsford, NY'],
    [19, 'Hunter Day', 'Sophomore', "5'9", '150', 'R', 'Reston, VA'],
    [20, 'Tyler Skarka', 'Sophomore', "5'9", '175', 'R', 'Leesburg, VA'],
    [22, 'Max Sullivan', 'Junior', "5'10", '190', 'R', 'Cary, NC'],
    [25, 'Billy Linardakis', 'Freshman', "5'7", '149', 'L', 'Brick, NJ'],
    [27, 'Dhruv Thakare', 'Junior', "5'11", '170', 'L', 'Scotch Plains, NJ']
  ],
  goalies: [
    [30, 'Declan Heffernan', 'Freshman', "6'1", '190', 'L', 'Bay Shore, NY'],
    [31, 'Wyatt Cleveland', 'Freshman', "6'0", '150', 'L', 'Roanoke, VA'],
    [32, 'Aidan Khazai', 'Freshman', "5'10", '185', 'L', 'McLean, VA'],
    [33, 'Tucker Forrest', 'Junior', "5'9", '160', 'L', 'Vienna, VA']
  ]
};

const rosterColumns = ['#', 'Name', 'Year', 'Height', 'Weight', 'Shot / Catch', 'Hometown'];
const yearAbbreviations = { Freshman: 'FR', Sophomore: 'SO', Junior: 'JR', Senior: 'SR', '5th': '5TH' };

// RFC4180-style parser: a field is only treated as quoted if it starts with a quote character.
function parseRosterCsv(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const text = csv.replace(/\r\n/g, '\n');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += char;
    } else if (char === '"' && field === '') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter(cells => cells.some(cell => cell !== ''));
}

function renderRosterGroups(rosterGroups) {
  document.querySelectorAll('.roster-section').forEach(section => {
    const group = section.dataset.group;
    const players = rosterGroups[group] || [];
    const handLabel = group === 'goalies' ? 'Glove' : 'Shoots';
    const columns = rosterColumns.map(column => column === 'Shot / Catch' ? handLabel : column);
    section.innerHTML = `<h3>${section.dataset.title}</h3><div class="roster-table roster-table-head">${columns.map(column => `<span>${column}</span>`).join('')}</div>${players.map(player => `<div class="roster-table"><span>${player[0]}</span><strong>${player[1]}</strong><span>${yearAbbreviations[player[2]] || player[2]}</span><span>${player[3]}"</span><span>${player[4]}</span><span>${player[5]}</span><span>${player[6]}</span></div>`).join('')}`;
  });
}

function updateSeasonText(season) {
  document.querySelectorAll('[data-season-text]').forEach(el => { el.textContent = season.label; });
  const sheet = document.querySelector('.roster-sheet');
  if (sheet) sheet.setAttribute('aria-label', `${season.label} Virginia Tech Hokies roster`);
}

async function loadRoster(season) {
  try {
    const response = await fetch(season.file, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${season.file}`);
    const rows = parseRosterCsv(await response.text()).slice(1).filter(row => row.length > 2 && row[2]);
    if (!rows.length) throw new Error(`No rows in ${season.file}`);
    const rosterGroups = {};
    rows.forEach(([group, number, name, year, height, weight, shot, hometown]) => {
      if (!rosterGroups[group]) rosterGroups[group] = [];
      rosterGroups[group].push([number, name, year, height, weight, shot, hometown]);
    });
    renderRosterGroups(rosterGroups);
  } catch (error) {
    renderRosterGroups(fallbackRosterGroups);
    console.info(`${season.file} is not available; showing the local fallback roster.`);
  }
  updateSeasonText(season);
}

function initSeasonSelect() {
  const select = document.querySelector('#roster-season-select');
  if (!select) return;
  select.innerHTML = rosterSeasons.map(season => `<option value="${season.id}">${season.label}</option>`).join('');
  select.addEventListener('change', () => {
    const season = rosterSeasons.find(item => item.id === select.value) || rosterSeasons[0];
    loadRoster(season);
  });
}

initSeasonSelect();
loadRoster(rosterSeasons[0]);
