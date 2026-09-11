function initializeMobileNavigation() {
  const navigation = document.querySelector('.nav');
  if (!navigation || navigation.dataset.mobileNavigationReady) return;
  navigation.dataset.mobileNavigationReady = 'true';
  document.querySelectorAll('.top-line-inner span, .mark-label small').forEach(label => {
    if (label.textContent.trim().startsWith('EST.')) label.textContent = 'EST. 1985';
  });
  const mobileStyles = document.createElement('style');
  mobileStyles.textContent = ':root{--orange:#DE6131}.footer-inner{align-items:center}.footer-inner b{display:inline-block;line-height:1}.footer-brand{align-items:center;display:inline-flex;gap:10px}.footer-brand img{background:#fff;display:block;height:42px;object-fit:contain;padding:3px;width:36px}.footer-brand span{color:inherit}@media (max-width:760px){.team-menu .team-dropdown{display:none}.team-menu.open .team-dropdown{display:block}.footer-brand img{height:34px;width:30px}}';
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
  navigation.querySelectorAll('.team-menu').forEach(teamMenu => {
    const teamButton = teamMenu.querySelector('button');
    if (!teamButton) return;
    teamButton.setAttribute('aria-expanded', 'false');
    teamButton.addEventListener('click', event => {
      event.stopPropagation();
      const open = teamMenu.classList.toggle('open');
      teamButton.setAttribute('aria-expanded', String(open));
    });
  });
  const footerLabel = document.querySelector('.footer-inner > span:first-child');
  if (footerLabel && !footerLabel.classList.contains('footer-brand')) {
    footerLabel.className = 'footer-brand';
    footerLabel.innerHTML = '<img src="' + (location.pathname.includes('/photos/') ? '../../clubsports.png' : 'clubsports.png') + '" alt="Virginia Tech Sport Clubs"><span>VIRGINIA TECH CLUB HOCKEY</span>';
  }
}

window.initializeMobileNavigation = initializeMobileNavigation;
initializeMobileNavigation();
