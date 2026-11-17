// LESSON 5: JavaScript finds elements (querySelector) and reacts to events (addEventListener).
var canHover = window.matchMedia('(hover: hover)').matches;       // true on computers, false on phones
var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var glyphs = ['✦', '✧', '♥', '✿'];
var hues = ['#520925', '#b199fb', '#6d3509', '#c4f6ec'];
function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

// 1. Confetti: a burst of little shapes from the middle of any element
function burstAt(el) {
  if (calm) return;
  var box = el.getBoundingClientRect();
  for (var i = 0; i < 18; i++) {
    var c = document.createElement('span');
    c.className = 'confetti';
    c.textContent = pick(glyphs);
    c.style.color = pick(hues);
    c.style.left = (box.left + box.width / 2) + 'px';
    c.style.top = (box.top + box.height / 2) + 'px';
    c.style.setProperty('--dx', (Math.random() * 300 - 150) + 'px');
    c.style.setProperty('--dy', (Math.random() * -240 - 20) + 'px');
    c.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
    document.body.appendChild(c);
    c.addEventListener('animationend', function (e) { e.target.remove(); });
  }
}

// 2. The big title: split "Naai" into letters so each one can bounce
var title = document.querySelector('.masthead');
if (title) {
  var word = title.textContent;
  var letterColors = ['#D0BBA0', '#D0BBA0', '#D0BBA0', '#D0BBA0'];
  title.setAttribute('aria-label', word);
  title.textContent = '';
  word.split('').forEach(function (ch, i) {
    var s = document.createElement('span');
    s.className = 'ltr';
    s.textContent = ch;
    s.setAttribute('aria-hidden', 'true');
    s.style.color = letterColors[i % letterColors.length];
    s.style.setProperty('--i', i);
    s.addEventListener('mouseenter', function () { s.classList.remove('hop'); void s.offsetWidth; s.classList.add('hop'); });
    title.appendChild(s);
  });
}

// 3. Hero stickers drift when the mouse moves (the CSS "translate" property, so floating still works)
var hero = document.querySelector('.hero');
if (hero && canHover && !calm) {
  var stickers = hero.querySelectorAll('.sticker');
  hero.addEventListener('mousemove', function (e) {
    var x = e.clientX / window.innerWidth - .5, y = e.clientY / window.innerHeight - .5;
    stickers.forEach(function (s) { var d = parseFloat(s.dataset.depth); s.style.translate = (x * d) + 'px ' + (y * d) + 'px'; });
  });
}

// 4. Sparkle trail behind the cursor
if (canHover && !calm) {
  var lastSpark = 0;
  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - lastSpark < 70) return;
    lastSpark = now;
    var s = document.createElement('span');
    s.className = 'spark';
    s.textContent = pick(glyphs);
    s.style.color = pick(hues);
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    document.body.appendChild(s);
    s.addEventListener('animationend', function () { s.remove(); });
  });
}

// 5. Frames: spotlight follows the mouse, and "tilt" frames lean toward it
document.querySelectorAll('.frame').forEach(function (frame) {
  frame.addEventListener('mousemove', function (e) {
    var box = frame.getBoundingClientRect();
    frame.style.setProperty('--mx', (e.clientX - box.left) + 'px');
    frame.style.setProperty('--my', (e.clientY - box.top) + 'px');
    if (canHover && !calm && frame.classList.contains('tilt')) {
      var x = (e.clientX - box.left) / box.width - .5, y = (e.clientY - box.top) / box.height - .5;
      frame.style.transform = 'perspective(800px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg)';
    }
  });
  frame.addEventListener('mouseleave', function () { frame.style.transform = ''; });
});

// 6. Things "hang" onto the wall when you scroll to them
var reveal = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) { entry.target.classList.add('in'); reveal.unobserve(entry.target); }
  });
}, { threshold: .15 });
document.querySelectorAll('.hang').forEach(function (el) { reveal.observe(el); });

// 7. Menu: highlight the room you are in, and close the phone menu after a tap
var links = document.querySelectorAll('.museum-nav .nav-link');
var menu = document.getElementById('menu');
var watcher = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id); });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('header[id], section[id]').forEach(function (r) { watcher.observe(r); });
links.forEach(function (l) {
  l.addEventListener('click', function () { if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide(); });
});

// 8. About window: click, tap, Enter or Space opens it (hover is handled in CSS)
var win = document.querySelector('.win');
if (win) {
  var toggleWindow = function () {
    var isOpen = win.classList.toggle('open');
    win.setAttribute('aria-expanded', isOpen);
    if (isOpen) burstAt(win);
  };
  win.addEventListener('click', toggleWindow);
  win.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleWindow(); } });
}

// 9. Skills: hang a curtain on every skill frame, labelled with its title
document.querySelectorAll('.specimen').forEach(function (card) {
  var drape = document.createElement('div');
  var label = document.createElement('span');
  label.textContent = card.querySelector('h3').textContent;
  drape.className = 'drape';
  drape.setAttribute('aria-hidden', 'true');
  drape.appendChild(label);
  card.prepend(drape);
  card.tabIndex = 0;
  card.addEventListener('click', function () { if (!canHover) card.classList.toggle('lifted'); });
});

// 10. Philosophy: a button that shows the next thought
var thoughts = [
  'Taste is mostly knowing what to leave out.',
  'Be soft in manner and strong in standards.',
  'Make it plain, then make it dazzling.',
  'Curiosity is the best accessory.',
  'Learn the old rules, then rearrange the furniture.'
];
var quote = document.getElementById('quote'), nextBtn = document.getElementById('next-quote'), qi = 0;
if (quote && nextBtn) {
  nextBtn.addEventListener('click', function () {
    qi = (qi + 1) % thoughts.length;
    quote.textContent = thoughts[qi];
    quote.classList.remove('swap'); void quote.offsetWidth; quote.classList.add('swap');
    burstAt(nextBtn);
  });
}

// 11. Contact: confetti when you press "Send the letter"
var sendBtn = document.querySelector('.btn-letter');
if (sendBtn) sendBtn.addEventListener('click', function () { burstAt(sendBtn); });

// 12. Footer year
document.getElementById('year').textContent = new Date().getFullYear();
