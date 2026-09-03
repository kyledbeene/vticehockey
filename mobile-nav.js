const navigation = document.querySelector('.nav');
if (navigation) {
  const mobileStyles = document.createElement('style');
  mobileStyles.textContent = '@media (max-width:760px){.team-menu .team-dropdown{display:none}.team-menu.open .team-dropdown{display:block}}';
  document.head.appendChild(mobileStyles);
  let menuToggle = document.querySelector('.menu-toggle');
  if (!menuToggle) {
    menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.type = 'button';
    menuToggle.setAttribute('aria-label', 'Open menu');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = '<span></span><span></span>';
    navigation.parentElement.insertBefore(menuToggle, navigation);
  }
  menuToggle.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }));
  const teamMenu = navigation.querySelector('.team-menu');
  const teamButton = teamMenu?.querySelector(':scope > button');
  if (teamMenu && teamButton) {
    teamButton.setAttribute('aria-expanded', 'false');
    teamButton.addEventListener('click', event => {
      event.stopPropagation();
      const open = teamMenu.classList.toggle('open');
      teamButton.setAttribute('aria-expanded', String(open));
    });
  }
}
