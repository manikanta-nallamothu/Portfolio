/* ============================================================
   MOBILE NAV TOGGLE
============================================================ */
(function(){
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if(!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open');
    links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ============================================================
   PROJECTS ACCORDION
   (uses each panel's real scrollHeight so it always fits the
   content — including the image gallery — instead of a fixed
   max-height.)
============================================================ */
(function(){
  const projects = document.querySelectorAll('.project');
  if(!projects.length) return;

  function openProject(project){
    const body = project.querySelector('.project-body');
    project.setAttribute('data-open', 'true');
    project.querySelector('.project-head').setAttribute('aria-expanded', 'true');
    body.style.maxHeight = body.scrollHeight + 'px';
  }

  function closeProject(project){
    const body = project.querySelector('.project-body');
    project.setAttribute('data-open', 'false');
    project.querySelector('.project-head').setAttribute('aria-expanded', 'false');
    body.style.maxHeight = '0px';
  }

  projects.forEach(project => {
    const head = project.querySelector('.project-head');
    head.addEventListener('click', () => {
      const isOpen = project.getAttribute('data-open') === 'true';

      // close all
      projects.forEach(closeProject);

      // open the clicked one, unless it was already open (toggle closed)
      if(!isOpen){
        openProject(project);
      }
    });

    // start open if marked so in the HTML (aria-expanded="true")
    if(head.getAttribute('aria-expanded') === 'true'){
      openProject(project);
    }
  });

  // keep open panels correctly sized if the window is resized
  // (mobile stacks the description/gallery into one column, which
  // changes the panel's height)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      projects.forEach(project => {
        if(project.getAttribute('data-open') === 'true'){
          const body = project.querySelector('.project-body');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    }, 150);
  });
})();

/* ============================================================
   PROJECT IMAGE GALLERIES
   Each .project-gallery cycles through its .gallery-slide images
   with prev/next arrows, dot indicators, and a slow auto-rotate
   (paused on hover). Add or remove <img class="gallery-slide">
   tags in the HTML — this script adapts automatically.
============================================================ */
(function(){
  const galleries = document.querySelectorAll('.project-gallery');
  if(!galleries.length) return;

  const AUTO_ROTATE_MS = 4500;

  galleries.forEach(gallery => {
    const slides = Array.from(gallery.querySelectorAll('.gallery-slide'));
    const prevBtn = gallery.querySelector('.gallery-prev');
    const nextBtn = gallery.querySelector('.gallery-next');
    const dotsWrap = gallery.querySelector('.gallery-dots');
    if(!slides.length) return;

    gallery.setAttribute('data-count', slides.length);

    let index = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
    if(index === -1) index = 0;

    // build dot indicators
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', 'Show image ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    function render(){
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

      // if this gallery is inside an open accordion panel, keep the
      // panel height in sync (image ratios can differ slightly)
      const project = gallery.closest('.project');
      if(project && project.getAttribute('data-open') === 'true'){
        const body = project.querySelector('.project-body');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    }

    function goTo(i){
      index = (i + slides.length) % slides.length;
      render();
    }

    if(prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if(nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

    render();

    if(slides.length > 1){
      let timer = setInterval(() => goTo(index + 1), AUTO_ROTATE_MS);
      gallery.addEventListener('mouseenter', () => clearInterval(timer));
      gallery.addEventListener('mouseleave', () => {
        timer = setInterval(() => goTo(index + 1), AUTO_ROTATE_MS);
      });
    }
  });
})();

/* ============================================================
   CERTIFICATE LIGHTBOX — MOBILE ONLY
   Tapping a certificate image opens it full-size. This is
   intentionally gated to mobile widths (<=760px) so desktop
   browsing behavior is unchanged (clicking a certificate on
   desktop still does nothing, same as before).
============================================================ */
(function(){
  const lightbox = document.getElementById('cert-lightbox');
  const lightboxImg = document.getElementById('cert-lightbox-img');
  const closeBtn = document.getElementById('cert-lightbox-close');
  const certImages = document.querySelectorAll('.cert-image');
  if(!lightbox || !lightboxImg || !certImages.length) return;

  const isMobile = () => window.matchMedia('(max-width:760px)').matches;

  function openLightbox(img){
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }

  certImages.forEach(img => {
    img.addEventListener('click', () => {
      if(isMobile()) openLightbox(img);
    });
  });

  if(closeBtn) closeBtn.addEventListener('click', closeLightbox);

  // tapping the dark backdrop (not the image itself) also closes it
  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeLightbox();
  });
})();

