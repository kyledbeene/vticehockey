function initializeMobileNavigation() {
  const navigation = document.querySelector('.nav');
  if (!navigation || navigation.dataset.mobileNavigationReady) return;
  navigation.dataset.mobileNavigationReady = 'true';
  const moreMenu = navigation.querySelector('.more-menu');
  if (moreMenu) {
    const moreLinks = moreMenu.querySelectorAll('.team-dropdown > a');
    moreLinks.forEach(link => navigation.insertBefore(link, moreMenu));
    moreMenu.remove();
  }
  const mediaLabels = new Set(['News', 'Game Notes', 'Photos']);
  const mediaLinks = [...navigation.children].filter(child => child.matches('a') && mediaLabels.has(child.textContent.trim()));
  if (mediaLinks.length === mediaLabels.size) {
    const mediaMenu = document.createElement('div');
    mediaMenu.className = 'team-menu media-menu';
    const mediaButton = document.createElement('button');
    mediaButton.type = 'button';
    mediaButton.innerHTML = 'Media <span>⌄</span>';
    mediaButton.setAttribute('aria-haspopup', 'true');
    const mediaDropdown = document.createElement('div');
    mediaDropdown.className = 'team-dropdown';
    mediaLinks.forEach(link => mediaDropdown.appendChild(link));
    mediaMenu.append(mediaButton, mediaDropdown);
    const statsLink = [...navigation.children].find(child => child.matches('a') && child.textContent.trim() === 'Stats');
    const teamMenu = [...navigation.children].find(child => child.matches('.team-menu:not(.media-menu)'));
    if (statsLink) statsLink.before(mediaMenu);
    else if (teamMenu) teamMenu.after(mediaMenu);
    else navigation.prepend(mediaMenu);
  }
  document.querySelectorAll('.top-line-inner span, .mark-label small').forEach(label => {
    if (label.textContent.trim().startsWith('EST.')) label.textContent = 'EST. 1985';
  });
  const mobileStyles = document.createElement('style');
  mobileStyles.textContent = ':root{--orange:#DE6131}.footer-inner{align-items:center}.footer-inner b{display:inline-block;line-height:1}.footer-brand{align-items:center;display:inline-flex;gap:10px}.footer-brand img{background:#fff;display:block;height:42px;object-fit:contain;padding:3px;width:36px}.footer-brand span{color:inherit}.social-links{align-items:center;display:flex;gap:8px}.social-link{align-items:center;border:1px solid var(--line);color:var(--muted);display:inline-flex;height:38px;justify-content:center;transition:border-color .2s,color .2s;width:38px}.social-link:hover,.social-link:focus-visible{border-color:var(--orange);color:var(--orange)}.social-link svg{fill:currentColor;height:18px;width:18px}.social-link .social-icon-instagram{fill:none;stroke:currentColor;stroke-width:2}.social-link .social-icon-dot{fill:currentColor;stroke:none}@media (max-width:760px){.team-menu .team-dropdown{display:none}.team-menu.open .team-dropdown{display:block}.footer-brand img{height:34px;width:30px}.footer-inner{flex-wrap:wrap;row-gap:14px}.social-links{flex-basis:100%;justify-content:center;order:3}}';
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
  const footer = document.querySelector('.footer-inner');
  if (footer && !footer.querySelector('.social-links')) {
    const socialLinks = document.createElement('nav');
    socialLinks.className = 'social-links';
    socialLinks.setAttribute('aria-label', 'D2 social media accounts');
    socialLinks.innerHTML = '<a class="social-link" href="https://www.instagram.com/vticehockey/" target="_blank" rel="noopener noreferrer" aria-label="D2 Instagram @vticehockey" title="D2 Instagram @vticehockey"><svg class="social-icon-instagram" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="social-icon-dot" cx="17.5" cy="6.8" r=".8"/></svg></a><a class="social-link" href="https://www.facebook.com/VTicehockey/" target="_blank" rel="noopener noreferrer" aria-label="D2 Facebook @VTicehockey" title="D2 Facebook @VTicehockey"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.6 1.6-1.6h1.7V3.5c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6v2.6h-3v3.1h3v7z"/></svg></a><a class="social-link" href="https://x.com/VTicehockey" target="_blank" rel="noopener noreferrer" aria-label="D2 X @VTicehockey" title="D2 X @VTicehockey"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2h3.1l-6.8 7.8L23.2 22h-6.3L12 15.6 6.4 22H3.2l7.3-8.4L2.8 2h6.4l4.4 5.8zM17.8 20h1.7L8.2 3.9H6.4z"/></svg></a>';
    footer.insertBefore(socialLinks, footer.lastElementChild);
  }
}

window.initializeMobileNavigation = initializeMobileNavigation;
initializeMobileNavigation();
