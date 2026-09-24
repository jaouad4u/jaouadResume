(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  try {
    root.dataset.theme = localStorage.getItem('resume_theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch { root.dataset.theme = 'light'; }
  $('theme').onclick = () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('resume_theme', root.dataset.theme); } catch {}
  };
  let sequence = 0, task = null, pdf = null, pageNumber = 1, busy = false;
  let pdfLibrary;
  // Pinned PDF.js module and matching worker; loaded only when a PDF is opened.
  async function getPdfLibrary() {
    if (!pdfLibrary) {
      pdfLibrary = import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs')
        .then(lib => {
          lib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
          return lib;
        }).catch(error => { pdfLibrary = null; throw error; });
    }
    return pdfLibrary;
  }
  function cleanup() {
    sequence++;
    const previousTask = task;
    task = null; pdf = null; busy = false;
    if (previousTask) previousTask.destroy().catch(() => {});
    $('viewport').replaceChildren();
    $('paging').hidden = true;
    $('status').textContent = '';
  }
  $('close').onclick = () => $('viewer').close();
  $('viewer').addEventListener('close', cleanup);
  // Discourage casual saving only. This is not access control or DRM.
  $('viewport').addEventListener('contextmenu', event => event.preventDefault());
  $('viewport').addEventListener('dragstart', event => event.preventDefault());
  function controls() {
    $('prev').disabled = busy || pageNumber <= 1;
    $('next').disabled = busy || !pdf || pageNumber >= pdf.numPages;
    $('page-info').textContent = pdf ? `Page ${pageNumber} of ${pdf.numPages}` : '';
  }
  async function renderPage(token) {
    busy = true; controls();
    $('status').textContent = 'Loading page…';
    $('viewport').replaceChildren();
    try {
      const page = await pdf.getPage(pageNumber);
      if (token !== sequence) return;
      const unit = page.getViewport({ scale: 1 });
      const width = Math.min(1000, Math.max(240, $('viewport').clientWidth - 32));
      const viewport = page.getViewport({ scale: width / unit.width * Math.min(devicePixelRatio || 1, 2) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
      canvas.style.width = `${width}px`;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${$('viewer-title').textContent}, page ${pageNumber}`);
      await page.render({canvasContext: canvas.getContext('2d'), viewport}).promise;
      if (token !== sequence) return;
      $('viewport').replaceChildren(canvas);
      $('status').textContent = '';
    } catch (error) {
      if (token === sequence) $('status').textContent = 'This page could not be displayed. Close and reopen the document to retry.';
    } finally {
      if (token === sequence) { busy = false; controls(); }
    }
  }
  async function openDocument(item, url, extension) {
    cleanup(); const token = sequence;
    $('viewer-title').textContent = item.title;
    $('status').textContent = 'Loading document…';
    $('viewer').showModal();
    $('close').focus();
    try {
      if (extension === 'pdf') {
        const lib = await getPdfLibrary();
        if (token !== sequence) return;
        task = lib.getDocument({ url: url.href, isEvalSupported: false });
        const document = await task.promise;
        if (token !== sequence) return;
        pdf = document; pageNumber = 1;
        $('paging').hidden = false;
        await renderPage(token);
      } else {
        const img = new Image();
        img.alt = item.title; img.draggable = false;
        img.onload = () => {
          if (token !== sequence) return;
          $('viewport').replaceChildren(img); $('status').textContent = '';
        };
        img.onerror = () => {
          if (token === sequence) $('status').textContent = 'This image could not be loaded. Please check its published file path.';
        };
        img.src = url.href;
      }
    } catch (error) {
      if (token === sequence) $('status').textContent = 'This PDF could not be opened. Check the published file path and your connection. Password-protected PDFs are not supported.';
    }
  }
  $('prev').onclick = () => { if (!busy && pdf && pageNumber > 1) { pageNumber--; renderPage(sequence); } };
  $('next').onclick = () => { if (!busy && pdf && pageNumber < pdf.numPages) { pageNumber++; renderPage(sequence); } };
  const entries = Array.isArray(window.CERTIFICATES) ? window.CERTIFICATES : [];
  let count = 0;
  for (const item of entries) {
    if (!item || typeof item.title !== 'string' || typeof item.file !== 'string') continue;
    let url;
    try { url = new URL(item.file, document.baseURI); } catch { continue; }
    const extension = url.pathname.split('.').pop().toLowerCase();
    if (!['http:', 'https:'].includes(url.protocol) || !['pdf','jpg','jpeg','png'].includes(extension)) continue;
    const card = document.createElement('article'); card.className = 'card';
    const type = document.createElement('span'); type.className = 'tag';
    type.textContent = `${item.category || 'Certificate'} · ${extension.toUpperCase()}`;
    const title = document.createElement('h2'); title.textContent = item.title;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'view';
    button.textContent = 'View document'; button.setAttribute('aria-label', `View ${item.title}`);
    button.onclick = () => openDocument(item, url, extension);
    card.append(type, title, button); $('grid').append(card); count++;
  }
  if (!count) {
    const empty = document.createElement('p'); empty.className = 'empty';
    empty.textContent = 'Certificates and diplomas will appear here when they are added.';
    $('grid').append(empty);
  }
})();
