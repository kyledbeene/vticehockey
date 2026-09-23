// Add a new entry at the top when a new season starts, and add matching stats/skaters-YYYY-YY.csv and stats/goalies-YYYY-YY.csv files.
const statsSeasons = [
  { id: '2026-27', label: '2026-27', skaters: 'stats/skaters-2026-27.csv', goalies: 'stats/goalies-2026-27.csv' }
];

const fallbackSkaters = [
  [2, 'Caelan Rea', 'D'], [3, 'Alexander Yellin', 'F'], [4, 'Brody Nyitrai', 'D'], [5, 'Tyler Simo', 'D'], [6, 'Sam Hosier', 'F'], [7, 'Taizo Cesari', 'F'], [8, 'Colin Coakley', 'F'], [9, 'Nicholas Frantz', 'D'], [10, 'Mason Skarka', 'D'], [11, 'Austin Hryn', 'F'], [12, 'Joel Vizard', 'D'], [13, 'Victor Doucet', 'F'], [14, 'Grayson Winkler', 'F'], [16, 'Thijs Bakker', 'F'], [17, 'Lester Benitez', 'D'], [18, 'Colm Mulhall', 'F'], [19, 'Jackson Benward', 'F'], [20, 'Logan Pearle', 'F'], [21, 'Dean Hryn', 'F'], [22, 'Ryan Degnan', 'F'], [23, 'Christopher Kube', 'D'], [24, 'Brandon Anderson', 'F'], [25, 'Joseph Piccolo', 'D'], [26, 'Alex Mallios', 'D'], [27, 'Tyler Ng', 'D'], [28, 'Adam Turski', 'F']
];
const fallbackGoalies = [[30, 'Dante Dilegge', 'G'], [31, 'Liam Conry', 'G'], [32, 'Matt Kohlhepp', 'G']];
const tables = document.querySelectorAll('.stats-table');
const loadedRows = new Map();

// Smooths in fetched rows that arrive after the page-navigation transition has already settled.
function withViewTransition(update) {
  if (document.startViewTransition) document.startViewTransition(update);
  else update();
}

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

function addHeaderSorting(table, rows) {
  const headers = [...table.querySelectorAll('thead th')];
  const isGoalieTable = table.closest('.stats-section').querySelector('h2').textContent.trim().toLowerCase() === 'goalies';
  headers.forEach((header, columnIndex) => {
    if (isGoalieTable && columnIndex === 2) {
      header.classList.add('stats-static');
      header.setAttribute('aria-label', 'Position');
      return;
    }
    header.classList.add('stats-sortable');
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-label', `Sort by ${header.textContent.trim()}`);
    header.dataset.sortDirection = columnIndex === 0 ? 'asc' : '';
    const sort = direction => {
      headers.forEach(cell => { cell.removeAttribute('aria-sort'); cell.dataset.sortDirection = ''; });
      header.dataset.sortDirection = direction;
      header.setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
      renderRows(table, sortRows(loadedRows.get(table), columnIndex === 0 ? `number:${direction}` : columnIndex === 1 ? `name:${direction}` : columnIndex === 2 ? `position:${direction}` : `stat:${columnIndex}:${direction}`));
    };
    header.addEventListener('click', () => sort(header.dataset.sortDirection === 'asc' ? 'desc' : 'asc'));
    header.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); header.click(); }
    });
  });
  headers[0].setAttribute('aria-sort', 'ascending');
  loadedRows.set(table, rows);
}

async function loadTable(table, path, fallback) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    const rows = parseCsv(await response.text()).slice(1).filter(row => row.length > 1 && row[1]);
    if (!rows.length) throw new Error(`No rows in ${path}`);
    loadedRows.set(table, rows);
    withViewTransition(() => { renderRows(table, sortRows(rows, 'number:asc')); addHeaderSorting(table, rows); });
  } catch (error) {
    const rows = fallbackRows(fallback);
    loadedRows.set(table, rows);
    withViewTransition(() => { renderRows(table, sortRows(rows, 'number:asc')); addHeaderSorting(table, rows); });
    console.info(`${path} is not available; showing the local fallback roster.`);
  }
}

function loadSeason(season) {
  document.querySelectorAll('[data-season-text]').forEach(el => { el.textContent = season.label; });
  loadTable(tables[0], season.skaters, fallbackSkaters);
  loadTable(tables[1], season.goalies, fallbackGoalies);
}

function initSeasonSelect() {
  const select = document.querySelector('#stats-season-select');
  if (!select) return;
  select.innerHTML = statsSeasons.map(season => `<option value="${season.id}">${season.label}</option>`).join('');
  select.addEventListener('change', () => {
    const season = statsSeasons.find(item => item.id === select.value) || statsSeasons[0];
    loadSeason(season);
  });
}

initSeasonSelect();
loadSeason(statsSeasons[0]);
