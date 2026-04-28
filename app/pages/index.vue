<script setup>
import { Share2, Check, Undo2, Trash2, MoreHorizontal } from "lucide-vue-next";

const store = useGroceryStore();
const menuOpen = ref(false);

onMounted(() => store.checkImportFromUrl());

// Evita di chiamare store.items.find() 3 volte nel template
const editingItem = computed(() =>
  store.items.find(i => i.id === store.editingNoteId) ?? null
);

function closeMenu() { menuOpen.value = false; }

function menuUndo()      { store.undo();      closeMenu(); }
function menuClearDone() { store.clearDone(); closeMenu(); }
async function menuShare() { await store.shareList(); closeMenu(); }
</script>

<template>

  <!-- ── Header fisso ── -->
  <header class="app-header">
    <div class="header-inner">
      <h1>Grocery List</h1>
      <div class="header-actions">
        <!-- Desktop: azioni dirette -->
        <div class="desktop-actions">
          <button v-if="store.canUndo" class="action-btn" title="Undo" @click="menuUndo">
            <Undo2 :size="17" />
          </button>
          <button v-if="store.hasDone" class="action-btn" title="Clear completed" @click="menuClearDone">
            <Trash2 :size="17" />
          </button>
          <button v-if="store.items.length > 0" class="action-btn" title="Share" @click="menuShare">
            <Check v-if="store.copied" :size="17" />
            <Share2 v-else :size="17" />
          </button>
        </div>
        <!-- Mobile: tre puntini -->
        <button class="menu-btn" @click="menuOpen = true">
          <MoreHorizontal :size="20" />
        </button>
      </div>
    </div>
  </header>

  <!-- ── Contenuto scrollabile ── -->
  <main class="content">

    <!-- Banner import -->
    <div v-if="store.pendingImport" class="import-banner">
      <p>Received a list with {{ store.pendingImport.length }} items.</p>
      <div class="import-actions">
        <button class="btn-primary" @click="store.importList()">Import</button>
        <button class="btn-ghost" @click="store.dismissImport()">Dismiss</button>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="store.items.length > 0" class="groups">
      <CategoryGroup
        v-for="(groupItems, category) in store.grouped"
        :key="category"
        :category="category"
        :items="groupItems"
      />
    </div>

    <!-- Stato vuoto -->
    <div v-else class="empty">
      <p>Your list is empty.</p>
      <p class="empty-hint">Add something below to get started.</p>
    </div>

  </main>

  <!-- ── Input fisso in basso ── -->
  <AddBar />

  <!-- ── Toast ── -->
  <Transition name="toast">
    <div v-if="store.copied" class="toast">Link copied!</div>
  </Transition>

  <!-- ── Backdrop menu ── -->
  <Transition name="fade">
    <div v-if="menuOpen" class="backdrop" @click="closeMenu" />
  </Transition>

  <!-- ── Backdrop nota ── -->
  <Transition name="fade">
    <div v-if="store.editingNoteId !== null" class="backdrop" @click="store.toggleNote(store.editingNoteId)" />
  </Transition>

  <!-- ── Pannello item ── -->
  <Transition name="slide-up">
    <div v-if="store.editingNoteId !== null" class="note-sheet">
      <div class="menu-handle" />
      <p class="note-sheet-title">{{ editingItem?.name }}</p>
      <textarea
        class="note-textarea"
        placeholder="Add a note..."
        :value="editingItem?.note"
        autofocus
        @input="store.updateNote(store.editingNoteId, $event.target.value)"
        @keyup.escape="store.toggleNote(store.editingNoteId)"
      />
      <div class="note-actions">
        <button class="note-delete" @click="store.deleteAndClose()">
          Delete item
        </button>
        <div class="note-actions-right">
          <button
            v-if="editingItem?.note"
            class="note-clear"
            @click="store.updateNote(store.editingNoteId, '')"
          >
            Clear note
          </button>
          <button class="note-done" @click="store.toggleNote(store.editingNoteId)">Done</button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ── Menu a tendina dal basso ── -->
  <Transition name="slide-up">
    <div v-if="menuOpen" class="menu-sheet">
      <div class="menu-handle" />

      <button v-if="store.canUndo" class="menu-item" @click="menuUndo">
        <Undo2 :size="18" />
        <span>Undo last action</span>
      </button>

      <button v-if="store.hasDone" class="menu-item menu-item--danger" @click="menuClearDone">
        <Trash2 :size="18" />
        <span>Clear completed</span>
      </button>

      <button v-if="store.items.length > 0" class="menu-item" @click="menuShare">
        <Check v-if="store.copied" :size="18" />
        <Share2 v-else :size="18" />
        <span>{{ store.copied ? 'Link copied!' : 'Share list' }}</span>
      </button>

      <button class="menu-item menu-item--cancel" @click="closeMenu">
        Cancel
      </button>
    </div>
  </Transition>

</template>

<style scoped>
/* ── Header ── */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-h);
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  z-index: 50;
}

.header-inner {
  max-width: 640px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  @media (min-width: 768px) {
    max-width: 960px;
    padding: 0 24px;
  }

  @media (min-width: 1200px) {
    max-width: 1280px;
  }
}

h1 {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.desktop-actions {
  display: none;
  align-items: center;
  gap: 4px;

  @media (min-width: 768px) {
    display: flex;
  }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  transition: color 0.15s, background 0.15s;

  @media (hover: hover) {
    &:hover {
      color: var(--text);
      background: var(--bg-subtle);
    }
  }
}

.menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  transition: background 0.15s;

  @media (min-width: 768px) {
    display: none;
  }

  @media (hover: hover) {
    &:hover { background: var(--bg-subtle); }
  }
}

/* ── Contenuto ── */
.content {
  padding-top: calc(var(--header-h) + 8px);
  padding-bottom: calc(var(--bottom-h) + 16px);
  min-height: 100vh;
  max-width: 640px;
  margin: 0 auto;

  @media (min-width: 768px) {
    max-width: 960px;
    padding-left: 24px;
    padding-right: 24px;
  }

  @media (min-width: 1200px) {
    max-width: 1280px;
  }
}

/* ── Griglia categorie ── */
.groups {
  @media (min-width: 768px) {
    column-count: 2;
    column-gap: 40px;
  }

  @media (min-width: 1200px) {
    column-count: 3;
  }
}

/* ── Import banner ── */
.import-banner {
  margin: 16px 20px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  p { font-size: 0.9rem; }
}

.import-actions { display: flex; gap: 8px; }

.btn-primary {
  padding: 8px 20px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
}

.btn-ghost {
  padding: 8px 20px;
  background: none;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  cursor: pointer;
}

/* ── Stato vuoto ── */
.empty {
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty p { font-size: 1rem; font-weight: 500; }
.empty-hint { font-size: 0.875rem; color: var(--muted); font-weight: 400; }

/* ── Backdrop ── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 90;
}

/* ── Menu sheet ── */
.menu-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg);
  border-radius: 20px 20px 0 0;
  border-top: 1px solid var(--border);
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom));
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 640px;
  margin: 0 auto;

  @media (min-width: 768px) {
    bottom: auto;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    border-radius: 16px;
    border: 1px solid var(--border);
    padding: 12px 16px 20px;
    width: 360px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
}

.menu-handle {
  width: 36px;
  height: 4px;
  background: var(--border);
  border-radius: 999px;
  margin: 0 auto 16px;

  @media (min-width: 768px) {
    display: none;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px;
  background: none;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  @media (hover: hover) {
    &:hover { background: var(--bg-subtle); }
  }
}

.menu-item--danger { color: var(--danger); }

.menu-item--cancel {
  justify-content: center;
  margin-top: 4px;
  color: var(--muted);
  font-weight: 400;
}

/* ── Pannello nota ── */
.note-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg);
  border-radius: 20px 20px 0 0;
  border-top: 1px solid var(--border);
  padding: 12px 20px calc(32px + env(safe-area-inset-bottom));
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
  margin: 0 auto;

  @media (min-width: 768px) {
    bottom: auto;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    border-radius: 16px;
    border: 1px solid var(--border);
    padding: 20px 24px 24px;
    width: 480px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
}

.note-sheet-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.note-textarea {
  width: 100%;
  min-height: 100px;
  max-height: 240px;
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  font-family: inherit;
  background: var(--bg-subtle);
  color: var(--text);
  padding: 12px 14px;
  resize: none;
  line-height: 1.6;

  &::placeholder { color: var(--muted); }
}

.note-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.note-clear {
  height: 36px;
  padding: 0 16px;
  background: none;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  cursor: pointer;
}

.note-delete {
  height: 36px;
  padding: 0 20px;
  background: none;
  color: var(--danger);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
}

.note-done {
  height: 36px;
  padding: 0 24px;
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: calc(var(--bottom-h) + 16px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: var(--bg);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 999px;
  z-index: 200;
  white-space: nowrap;
  pointer-events: none;
}

.toast-enter-active { transition: opacity 0.2s, transform 0.2s; }
.toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from  { opacity: 0; transform: translateX(-50%) translateY(8px); }
.toast-leave-to    { opacity: 0; transform: translateX(-50%) translateY(8px); }

/* ── Transizioni ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
}
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }

@media (min-width: 768px) {
  .slide-up-enter-active, .slide-up-leave-active {
    transition: opacity 0.2s, transform 0.2s;
  }
  .slide-up-enter-from, .slide-up-leave-to {
    transform: translate(-50%, -48%);
    opacity: 0;
  }
}
</style>
