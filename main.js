/*
 * Kit Personnel — https://github.com/Bwwwah/obsidian-kit-personnel
 *  1. Couleurs des dossiers : chaque page prend la couleur de son dossier dans l'explorateur.
 *  2. Pages de dossier auto : un nouveau dossier reçoit sa page (folder note) stylée ;
 *     commande « Créer les pages de dossier manquantes » pour les dossiers importés.
 *  3. Tâches pliables : les groupes du plugin Tasks se replient au clic.
 * Le style (styles.css) est chargé automatiquement par Obsidian avec le module.
 */
const { Plugin, MarkdownView, TFolder, Notice, normalizePath, debounce } = require('obsidian');

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

    // --- Pages de dossier : commande + clic droit sur un dossier
    this.addCommand({
      id: 'creer-pages-manquantes',
      name: 'Créer les pages de dossier manquantes',
      callback: () => this.createMissingPages(),
    });
    this.registerEvent(this.app.workspace.on('file-menu', (menu, file) => {
      if (!this.needsPage(file)) return;
      menu.addItem(item => item
        .setTitle('Créer la page de ce dossier')
        .setIcon('file-plus')
        .onClick(async () => {
          if (await this.createPage(file)) new Notice(`Page créée : ${file.name}`);
        }));
    }));

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

  pagePath(folder) {
    return normalizePath(`${folder.path}/${folder.name}.md`);
  }

  needsPage(folder) {
    if (!(folder instanceof TFolder) || folder.isRoot() || this.shouldSkip(folder)) return false;
    const existing = this.app.vault.getAbstractFileByPath(this.pagePath(folder));
    return !existing || existing.stat.size === 0;
  }

  // Crée (ou remplit si vide) la page d'un dossier. Renvoie true si elle a été écrite.
  async createPage(folder) {
    if (!this.needsPage(folder)) return false;
    const notePath = this.pagePath(folder);
    const existing = this.app.vault.getAbstractFileByPath(notePath);
    try {
      if (!existing) await this.app.vault.create(notePath, pageBody());
      else await this.app.vault.modify(existing, pageBody());
      return true;
    } catch (e) { return false; /* course possible avec un autre module : sans gravité */ }
  }

  // Nouveau dossier : petit délai pour laisser Obsidian finir de le poser.
  async ensurePage(folder) {
    if (this.shouldSkip(folder)) return;
    await new Promise(r => setTimeout(r, 250));
    const live = this.app.vault.getAbstractFileByPath(folder.path);
    if (live instanceof TFolder) await this.createPage(live);
  }

  // Tous les dossiers existants sans page (après un import, par exemple).
  async createMissingPages() {
    const folders = this.app.vault.getAllLoadedFiles()
      .filter(f => f instanceof TFolder && this.needsPage(f))
      .sort((a, b) => a.path.localeCompare(b.path));
    const created = [];
    for (const f of folders) if (await this.createPage(f)) created.push(f.path);
    if (created.length === 0) new Notice('Kit Personnel : tous les dossiers ont déjà leur page.');
    else new Notice(`Kit Personnel : ${created.length} page(s) de dossier créée(s).`);
    return created;
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
