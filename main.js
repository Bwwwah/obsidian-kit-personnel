/*
 * Kit Personnel — https://github.com/Bwwwah/obsidian-kit-personnel
 *  1. Couleurs des dossiers : chaque page prend la couleur de son dossier dans l'explorateur.
 *  2. Pages de dossier auto : un nouveau dossier reçoit sa page (folder note) stylée.
 *  3. Tâches pliables : les groupes du plugin Tasks se replient au clic.
 * Le style (styles.css) est chargé automatiquement par Obsidian avec le module.
 */
const { Plugin, MarkdownView, TFolder, normalizePath, debounce } = require('obsidian');

// ---------------------------------------------------------------- Couleurs
function colorOfTopFolder(top) {
  for (const t of document.querySelectorAll('.nav-files-container .nav-folder-title')) {
    if (t.dataset.path !== top) continue;
    const v = getComputedStyle(t.closest('.nav-folder')).getPropertyValue('--rainbow-folder-color').trim();
    return v || null;
  }
  return null;
}
function colorOfPath(path) {
  if (!path || !path.includes('/')) return null;
  return colorOfTopFolder(path.split('/')[0]);
}

// ------------------------------------------------------- Pages de dossier
const IGNORE = ['Pièces jointes', 'Modèles', 'Templates', 'Attachments', '.trash'];

function randomId() {
  return Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
}
function pageBody() {
  return [
    '---', 'obsidianUIMode: preview', 'cssclasses: [dossier]', 'tags: [dossier]', '---',
    '> ', '',
    '```folder-overview',
    'id: ' + randomId(), 'folderPath: ""', 'title: "{{folderName}}"', 'showTitle: false',
    'depth: 3', 'includeTypes:', '  - folder', '  - markdown', 'style: explorer',
    'disableFileTag: true', 'sortBy: name', 'sortByAsc: true', 'showEmptyFolders: false',
    'onlyIncludeSubfolders: false', 'storeFolderCondition: true', 'showFolderNotes: false',
    'disableCollapseIcon: false', 'alwaysCollapse: false', 'autoSync: true',
    'allowDragAndDrop: true', 'hideLinkList: true', 'hideFolderOverview: false',
    'useActualLinks: false', 'fmtpIntegration: false', 'titleSize: 1',
    'isInCallout: false', 'useWikilinks: true',
    '```', ''
  ].join('\n');
}

module.exports = class KitPersonnel extends Plugin {
  onload() {
    // --- Couleurs
    this.repaint = debounce(() => this.paintAll(), 150, true);
    this.registerEvent(this.app.workspace.on('file-open', () => this.repaint()));
    this.registerEvent(this.app.workspace.on('layout-change', () => this.repaint()));
    this.registerEvent(this.app.workspace.on('css-change', () => this.repaint()));
    this.registerMarkdownPostProcessor((el, ctx) => {
      const lis = el.querySelectorAll('.callout[data-callout="cards"] li');
      if (!lis.length) return;
      const paint = () => lis.forEach(li => this.paintTile(li, ctx.sourcePath));
      paint(); setTimeout(paint, 300);
    });

    // --- Tâches pliables (délégation : marche quel que soit le moment du rendu)
    this.registerDomEvent(document, 'click', (evt) => {
      const h = evt.target.closest && evt.target.closest('.tasks-group-heading');
      if (!h || evt.target.closest('a')) return;
      evt.preventDefault();
      h.classList.toggle('perso-collapsed');
    }, { capture: true });

    // --- Événements du coffre : seulement APRÈS le chargement initial,
    //     sinon « create » se déclenche pour chaque fichier existant au démarrage.
    this.app.workspace.onLayoutReady(() => {
      this.repaint();
      const later = () => setTimeout(() => this.paintAll(), 400);
      this.registerEvent(this.app.vault.on('create', (f) => {
        later();
        if (f instanceof TFolder) this.ensurePage(f);
      }));
      this.registerEvent(this.app.vault.on('rename', later));
      this.registerEvent(this.app.vault.on('delete', later));
    });
  }

  // ------------------------------------------------------------ Couleurs
  paintTile(li, sourcePath) {
    const a = li.querySelector('a.internal-link');
    if (!a) return;
    const f = this.app.metadataCache.getFirstLinkpathDest(a.dataset.href || a.getAttr('href') || '', sourcePath || '');
    const c = f && colorOfPath(f.path);
    if (c) li.style.setProperty('--card-color', `rgb(${c})`);
  }

  paintAll() {
    this.app.workspace.iterateAllLeaves(leaf => {
      if (!(leaf.view instanceof MarkdownView)) return;
      const el = leaf.view.containerEl;
      const path = leaf.view.file ? leaf.view.file.path : '';
      const c = colorOfPath(path);
      if (c) {
        el.style.setProperty('--dossier-rgb', c);
        el.style.setProperty('--dossier-color', `rgb(${c})`);
      } else {
        el.style.removeProperty('--dossier-rgb');
        el.style.removeProperty('--dossier-color');
      }
      el.querySelectorAll('.callout[data-callout="cards"] li').forEach(li => this.paintTile(li, path));
    });
  }

  // ---------------------------------------------------- Pages de dossier
  shouldSkip(folder) {
    if (!folder || !folder.path) return true;
    const parts = folder.path.split('/');
    if (parts.some(p => p.startsWith('.'))) return true;
    return IGNORE.includes(folder.name) || IGNORE.includes(parts[0]);
  }

  async ensurePage(folder) {
    if (this.shouldSkip(folder)) return;
    await new Promise(r => setTimeout(r, 250));
    const live = this.app.vault.getAbstractFileByPath(folder.path);
    if (!(live instanceof TFolder)) return;
    const notePath = normalizePath(`${folder.path}/${folder.name}.md`);
    const existing = this.app.vault.getAbstractFileByPath(notePath);
    try {
      if (!existing) await this.app.vault.create(notePath, pageBody());
      else if (existing.stat.size === 0) await this.app.vault.modify(existing, pageBody());
    } catch (e) { /* course possible avec un autre module : sans gravité */ }
  }

  onunload() {
    this.app.workspace.iterateAllLeaves(leaf => {
      const el = leaf.view && leaf.view.containerEl;
      if (!el) return;
      el.style.removeProperty('--dossier-rgb');
      el.style.removeProperty('--dossier-color');
    });
    document.querySelectorAll('.tasks-group-heading.perso-collapsed')
      .forEach(h => h.classList.remove('perso-collapsed'));
  }
};
