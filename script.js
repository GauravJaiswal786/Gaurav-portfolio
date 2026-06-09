const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const copyEmailButton = document.querySelector('.copy-email');
const toast = document.getElementById('toastMessage');
const projectCards = document.querySelectorAll('.project-item');
const heroPhotoWrapper = document.querySelector('.hero-photo-wrapper');
const heroPhoto = document.querySelector('.hero-photo');
const pageContainer = document.querySelector('.page');

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toast.dataset.timeout);
  toast.dataset.timeout = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
};

const updateThemeButton = (theme) => {
  if (!themeToggle) return;
  themeToggle.textContent = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
};

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  localStorage.setItem('portfolioTheme', theme);
  updateThemeButton(theme);
};

const getInitialTheme = () => {
  const saved = localStorage.getItem('portfolioTheme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

if (themeToggle) {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  themeToggle.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    showToast(`${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)} theme enabled`);
  });
}

if (copyEmailButton) {
  copyEmailButton.addEventListener('click', async () => {
    const email = copyEmailButton.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied to clipboard');
    } catch (error) {
      showToast('Copy failed, please select manually');
    }
  });
}

const resumeButton = document.querySelector('.resume-button');
if (resumeButton) {
  resumeButton.addEventListener('click', () => {
    resumeButton.classList.add('clicked');
    showToast('Opening resume...');
    window.setTimeout(() => resumeButton.classList.remove('clicked'), 160);
  });
}

const renderCurrentYear = () => {
  const year = document.getElementById('currentYear');
  if (year) {
    year.textContent = new Date().getFullYear();
  }
};

const enableCardMotion = () => {
  projectCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = (x / rect.width - 0.5) * 16;
      const py = (y / rect.height - 0.5) * 16;
      card.style.transform = `perspective(700px) rotateX(${py}deg) rotateY(${px}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
    // make project cards interactive: open image modal on click
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      openProjectImages(card);
    });
  });
};

const enableHeroPhotoInteraction = () => {
  if (!heroPhotoWrapper || !heroPhoto) return;

  const updatePhotoMotion = (event) => {
    const rect = heroPhotoWrapper.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = (x / rect.width - 0.5) * 18;
    const py = (y / rect.height - 0.5) * -18;
    heroPhoto.style.transform = `translateZ(16px) rotateX(${py}deg) rotateY(${px}deg) scale(1.03)`;
  };

  heroPhotoWrapper.addEventListener('mousemove', updatePhotoMotion);
  heroPhotoWrapper.addEventListener('mouseenter', () => heroPhotoWrapper.classList.add('interactive'));
  heroPhotoWrapper.addEventListener('mouseleave', () => {
    heroPhotoWrapper.classList.remove('interactive');
    heroPhoto.style.transform = '';
  });
};

const enableAccentMotion = () => {
  if (!pageContainer) return;

  const updateAccent = (event) => {
    const rect = pageContainer.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    const hue = Math.round(220 + x * 40 - y * 10);
    const saturation = Math.round(68 + y * 10);
    const mutedLight = Math.round(80 - y * 10);

    root.style.setProperty('--accent', `hsl(${hue}, ${saturation}%, 58%)`);
    root.style.setProperty('--accent-soft', `hsla(${hue}, ${saturation}%, 58%, 0.18)`);
    root.style.setProperty('--accent-muted', `hsla(${hue}, ${saturation}%, 70%, 0.16)`);
    root.style.setProperty('--text-muted', `hsla(${hue}, ${Math.min(saturation + 10, 90)}%, ${mutedLight}%, 0.85)`);
    root.style.setProperty('--border', `hsla(${hue}, ${Math.min(saturation + 20, 90)}%, 80%, 0.18)`);
    root.style.setProperty('--bg-top-1', `hsla(${hue}, ${saturation}%, 18%, 0.24)`);
    root.style.setProperty('--bg-top-2', `hsla(${hue}, ${Math.max(55, saturation - 10)}%, 42%, 0.16)`);
  };

  pageContainer.addEventListener('mousemove', updateAccent);
  pageContainer.addEventListener('mouseleave', () => {
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-soft');
    root.style.removeProperty('--accent-muted');
    root.style.removeProperty('--text-muted');
    root.style.removeProperty('--border');
    root.style.removeProperty('--bg-top-1');
    root.style.removeProperty('--bg-top-2');
  });
};

// Image modal for project photos
const createImageModal = () => {
  let modal = document.getElementById('projectImageModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'projectImageModal';
  modal.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);z-index:9999;opacity:0;transition:opacity .18s;pointer-events:none;';

  const content = document.createElement('div');
  content.style.cssText = 'max-width:90%;max-height:90%;position:relative;';

  const img = document.createElement('img');
  img.style.cssText = 'display:block;max-width:100%;max-height:100%;margin:0 auto;border-radius:6px;';
  img.alt = '';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'position:absolute;top:-10px;right:-10px;background:#fff;border-radius:50%;width:34px;height:34px;border:none;cursor:pointer;font-size:20px;';

  content.appendChild(img);
  content.appendChild(closeBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);

  // interactions
  const hide = () => {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  };
  const show = () => {
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) hide();
  });
  closeBtn.addEventListener('click', hide);

  // keyboard support
  window.addEventListener('keydown', (e) => {
    if (modal.style.pointerEvents !== 'auto') return;
    if (e.key === 'Escape') hide();
  });

  return { modal, img, show, hide };
};

const openProjectImages = (card) => {
  // gather image sources: data-images (comma) or first img inside card
  const data = card.dataset.images;
  let images = [];
  if (data) images = data.split(',').map(s => s.trim()).filter(Boolean);
  if (images.length === 0) {
    const imgEl = card.querySelector('img');
    if (imgEl && imgEl.src) images = [imgEl.src];
  }
  if (images.length === 0) return; // nothing to show

  const modalObj = createImageModal();
  const { modal, img, show } = modalObj;
  let index = 0;
  const setImage = (i) => {
    index = (i + images.length) % images.length;
    img.src = images[index];
  };

  setImage(0);
  show();

  // allow arrow navigation
  const onKey = (e) => {
    if (e.key === 'ArrowRight') setImage(index + 1);
    if (e.key === 'ArrowLeft') setImage(index - 1);
  };
  window.addEventListener('keydown', onKey);

  // cleanup when modal closed
  const observer = new MutationObserver(() => {
    if (modal.style.pointerEvents !== 'auto') {
      window.removeEventListener('keydown', onKey);
      observer.disconnect();
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
};

const setupScrollReveal = () => {
  const revealTargets = document.querySelectorAll('.card, .project-item, .skill-pill, .contact-row, .feature-list li');
  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observerInstance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -80px 0px',
    }
  );

  revealTargets.forEach((target, index) => {
    target.classList.add('reveal');
    if (index % 3 === 1) target.classList.add('delay-1');
    if (index % 3 === 2) target.classList.add('delay-2');
    observer.observe(target);
  });
};

const initialize = () => {
  renderCurrentYear();
  enableCardMotion();
  enableHeroPhotoInteraction();
  enableAccentMotion();
  setupScrollReveal();
};

window.addEventListener('DOMContentLoaded', initialize);
