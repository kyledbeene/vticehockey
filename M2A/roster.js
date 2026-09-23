// Add a new entry at the top when a new season starts, and add a matching roster-YYYY-YY.csv file.
const rosterSeasons = [
  { id: '2026-27', label: '2026-27', file: 'roster-2026-27.csv' }
];

const fallbackRosterGroups = {
  forwards: [
    [4, 'Brody Nyitrai', 'Sophomore', '', '', '', 'Williamsville, NY'],
    [7, 'Taizo Cesari', 'Freshman', '', '', '', 'Blacksburg, VA'],
    [8, 'Colin Coakley', 'Junior', '', '', '', 'Cranford, NJ'],
    [10, 'Mason Skarka', 'Sophomore', '', '', '', 'Leesburg, VA'],
    [11, 'Austin Hryn', 'Junior', '', '', '', 'Cary, NC'],
    [12, 'Joel Vizard', 'Sophomore', '', '', '', 'Arlington, VA'],
    [13, 'Victor Doucet', 'Freshman', '', '', '', 'Wayne, PA'],
    [14, 'Grayson Winkler', 'Junior', '', '', '', 'Olney, MD'],
    [17, 'Lester Benitez', 'Sophomore', '', '', '', 'Silver Spring, MD'],
    [18, 'Colm Mulhall', 'Sophomore', '', '', '', 'Milton, MA'],
    [19, 'Jackson Benward', 'Junior', '', '', '', 'New Providence, NJ'],
    [22, 'Ryan Degnan', 'Freshman', '', '', '', 'Falls Church, VA'],
    [23, 'Christopher Kube', '5th', '', '', '', 'Cranford, NJ'],
    [25, 'Joseph Piccolo', 'Freshman', '', '', '', 'Stafford, VA'],
    [27, 'Tyler Ng', 'Freshman', '', '', '', 'Floral Park, NY'],
    [28, 'Adam Turski', 'Sophomore', '', '', '', 'Blacksburg, VA']
  ],
  defensemen: [
    [2, 'Caelan Rea', 'Junior', '', '', '', 'Waxhaw, NC'],
    [3, 'Alexander Yellin', 'Freshman', '', '', '', 'McLean, VA'],
    [5, 'Tyler Simo', 'Sophomore', '', '', '', 'West Greenwich, RI'],
    [6, 'Sam Hosier', 'Freshman', '', '', '', 'Blacksburg, VA'],
    [9, 'Nicholas Frantz', 'Senior', '', '', '', 'Manassas, VA'],
    [16, 'Thijs Bakker', 'Junior', '', '', '', 'Arlington, VA'],
    [20, 'Logan Pearle', 'Freshman', '', '', '', 'Stamford, CT'],
    [21, 'Dean Hryn', 'Senior', '', '', '', 'Cary, NC'],
    [24, 'Brandon Anderson', 'Junior', '', '', '', 'Middletown, NY'],
    [26, 'Alex Mallios', 'Freshman', '', '', '', 'Manhasset, NY']
  ],
  goalies: [
    [30, 'Dante Dilegge', 'Sophomore', '', '', '', 'Branford, CT'],
    [31, 'Liam Conry', 'Sophomore', '', '', '', 'Brooklyn, NY'],
    [32, 'Matt Kohlhepp', 'Freshman', '', '', '', 'Doylestown, PA']
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
