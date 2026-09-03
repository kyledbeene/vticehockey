const fallbackSkaters = [
  [2, 'Bryan Rice', 'D'], [3, 'Ethan Garlock', 'F'], [6, "Justin D'Antona", 'F'], [7, 'Jackson Lages', 'D'], [8, 'Cooper Reger', 'F'], [9, 'Sean Mohr', 'D'], [10, 'Zack Stewart', 'F'], [11, 'Michael McCabe', 'F'], [13, 'Murphy MacLeod', 'D'], [14, 'Barrett Lunder', 'F'], [15, 'Tyler Gordon', 'F'], [16, 'Jacob Wachtel', 'F'], [18, 'Casey Reagan', 'D'], [19, 'Hunter Day', 'D'], [20, 'Tyler Skarka', 'D'], [21, 'Gavin Nau', 'F'], [22, 'Max Sullivan', 'D'], [24, 'West Vaillant', 'F'], [25, 'William Linardakis', 'D'], [26, 'Chase Olszewski', 'F'], [27, 'Dhruv Thakare', 'D'], [40, 'Jackson DeVivo', 'F'], [41, 'Kam Khazai', 'F'], [42, 'Ewan Andrew', 'F']
];
const fallbackGoalies = [[30, 'Declan Heffernan', 'G'], [31, 'Wyatt Cleveland', 'G'], [32, 'Aidan Khazai', 'G'], [33, 'Tucker Forrest', 'G']];
const tables = document.querySelectorAll('.stats-table');
const loadedRows = new Map();

function parseCsv(csv) {
  return csv.trim().split(/\r?\n/).map(line => {
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
  });
}

function fallbackRows(players) {
  return players.map(player => [...player, ...Array.from({ length: 12 }, () => '--')]);
}

function renderRows(table, rows) {
  const body = table.querySelector('tbody');
  body.innerHTML = rows.map(row => `<tr>${row.map((value, index) => `<td${index === 1 ? ' class="stats-player"' : ''}>${value || '--'}</td>`).join('')}</tr>`).join('');
}

function numericValue(value) {
  const number = Number.parseFloat(String(value).replace('%', ''));
  return Number.isNaN(number) ? null : number;
}

function sortRows(rows, sortKey) {
  const parts = sortKey.split(':');
  const field = parts[0];
  const columnIndex = field === 'stat' ? Number(parts[1]) : ({ number: 0, name: 1, position: 2 }[field]);
  const direction = field === 'stat' ? parts[2] : parts[1];
  const multiplier = direction === 'desc' ? -1 : 1;
  return [...rows].sort((first, second) => {
    let firstValue = first[columnIndex];
    let secondValue = second[columnIndex];
    if (field === 'name') {
      firstValue = firstValue.trim().split(/\s+/).pop().toLowerCase();
      secondValue = secondValue.trim().split(/\s+/).pop().toLowerCase();
    } else if (field === 'number' || field === 'stat') {
      firstValue = numericValue(firstValue);
      secondValue = numericValue(secondValue);
      if (firstValue === null && secondValue === null) return 0;
      if (firstValue === null) return 1;
      if (secondValue === null) return -1;
    } else {
      firstValue = firstValue.toLowerCase();
      secondValue = secondValue.toLowerCase();
    }
    return (firstValue > secondValue ? 1 : firstValue < secondValue ? -1 : 0) * multiplier;
  });
}

function addSortControl(table, rows) {
  const section = table.closest('.stats-section');
  const header = section.querySelector('.stats-section-header');
  const select = document.createElement('select');
  select.className = 'stats-sort';
  select.setAttribute('aria-label', `Sort ${section.querySelector('h2').textContent} statistics`);
  const headers = [...table.querySelectorAll('thead th')].map(headerCell => headerCell.textContent.trim());
  const options = [
    ['number:asc', 'Roster number: low to high'],
    ['number:desc', 'Roster number: high to low'],
    ['name:asc', 'Last name: A to Z'],
    ['name:desc', 'Last name: Z to A'],
    ['position:asc', 'Position: A to Z'],
    ['position:desc', 'Position: Z to A'],
    ...headers.slice(3).flatMap((label, index) => [[`stat:${index + 3}:desc`, `${label}: highest to lowest`], [`stat:${index + 3}:asc`, `${label}: lowest to highest`]])
  ];
  select.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  header.appendChild(select);
  select.addEventListener('change', () => renderRows(table, sortRows(loadedRows.get(table), select.value)));
  loadedRows.set(table, rows);
}

async function loadTable(table, path, fallback) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    const rows = parseCsv(await response.text()).slice(1).filter(row => row.length > 1 && row[1]);
    if (!rows.length) throw new Error(`No rows in ${path}`);
    loadedRows.set(table, rows);
    renderRows(table, sortRows(rows, 'number:asc'));
    addSortControl(table, rows);
  } catch (error) {
    const rows = fallbackRows(fallback);
    loadedRows.set(table, rows);
    renderRows(table, sortRows(rows, 'number:asc'));
    addSortControl(table, rows);
    console.info(`${path} is not available; showing the local fallback roster.`);
  }
}

loadTable(tables[0], 'stats/skaters.csv', fallbackSkaters);
loadTable(tables[1], 'stats/goalies.csv', fallbackGoalies);
