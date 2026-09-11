const repository = 'kyledbeene/vticehockey';
const directory = 'game-notes';
const filename = new URLSearchParams(window.location.search).get('note');
const title = filename ? filename.replace(/\.pdf$/i, '').replace(/^\d{4}-\d{2}-\d{2}-?/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()) : 'Game Notes';
const dateMatch = filename && filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
const date = dateMatch ? new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T12:00:00`).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : '';

document.title = `${title} | Virginia Tech Hockey Game Notes`;
document.querySelector('#note-title').innerHTML = `${title.toUpperCase()} <em>NOTES.</em>`;

async function loadNote() {
  try {
    if (!filename) throw new Error('Missing note filename');
    const response = await fetch(`https://api.github.com/repos/${repository}/contents/${directory}`);
    if (!response.ok) throw new Error('Game notes unavailable');
    const files = await response.json();
    const note = files.find(file => file.name === filename && file.name.toLowerCase().endsWith('.pdf'));
    if (!note) throw new Error('Game note not found');
    const frame = document.createElement('iframe');
    frame.className = 'note-frame';
    frame.title = `${title} game notes`;
    frame.src = note.download_url;
    document.querySelector('#note-container').replaceWith(frame);
    document.querySelector('.eyebrow').lastChild.textContent = ` ${date} / GAME NOTES`;
  } catch (error) {
    document.querySelector('#note-container').textContent = 'This game note could not be loaded.';
  }
}
loadNote();
