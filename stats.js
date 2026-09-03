const fallbackSkaters = [
  [2, 'Bryan Rice', 'D'], [3, 'Ethan Garlock', 'F'], [6, "Justin D'Antona", 'F'], [7, 'Jackson Lages', 'D'], [8, 'Cooper Reger', 'F'], [9, 'Sean Mohr', 'D'], [10, 'Zack Stewart', 'F'], [11, 'Michael McCabe', 'F'], [13, 'Murphy MacLeod', 'D'], [14, 'Barrett Lunder', 'F'], [15, 'Tyler Gordon', 'F'], [16, 'Jacob Wachtel', 'F'], [18, 'Casey Reagan', 'D'], [19, 'Hunter Day', 'D'], [20, 'Tyler Skarka', 'D'], [21, 'Gavin Nau', 'F'], [22, 'Max Sullivan', 'D'], [24, 'West Vaillant', 'F'], [25, 'William Linardakis', 'D'], [26, 'Chase Olszewski', 'F'], [27, 'Dhruv Thakare', 'D'], [40, 'Jackson DeVivo', 'F'], [41, 'Kam Khazai', 'F'], [42, 'Ewan Andrew', 'F']
];
const fallbackGoalies = [[30, 'Declan Heffernan', 'G'], [31, 'Wyatt Cleveland', 'G'], [32, 'Aidan Khazai', 'G'], [33, 'Tucker Forrest', 'G']];
const tables = document.querySelectorAll('.stats-table');

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

async function loadTable(table, path, fallback) {
  try {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    const rows = parseCsv(await response.text()).slice(1).filter(row => row.length > 1 && row[1]);
    if (!rows.length) throw new Error(`No rows in ${path}`);
    renderRows(table, rows);
  } catch (error) {
    renderRows(table, fallbackRows(fallback));
    console.info(`${path} is not available; showing the local fallback roster.`);
  }
}

loadTable(tables[0], 'stats/skaters.csv', fallbackSkaters);
loadTable(tables[1], 'stats/goalies.csv', fallbackGoalies);
