const scoreCards = [...document.querySelectorAll('.score-card')];
const completedCards = scoreCards.filter((card) => {
  const scores = [...card.querySelectorAll('.score-team b')].map((score) => score.textContent.trim().toUpperCase());
  return scores.length === 2 && scores.every((score) => score && score !== 'TBD');
});

scoreCards.forEach((card) => {
  if (!completedCards.includes(card)) card.remove();
});

if (completedCards.length === 0) {
  const emptyState = document.createElement('div');
  emptyState.className = 'scores-empty';
  emptyState.textContent = 'Completed game results will appear here.';
  document.querySelector('.score-grid').append(emptyState);
}
