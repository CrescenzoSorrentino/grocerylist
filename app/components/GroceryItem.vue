<script setup>
// GroceryItem visualizza un singolo elemento della lista.
// Cliccando sulla riga si apre il pannello note/azioni (toggleNote).
// Il checkbox è indipendente — stoppa la propagazione per non aprire il pannello.
// Non usa emit: interagisce direttamente con lo store.
const store = useGroceryStore();

const props = defineProps({
  item: Object, // { id, name, done, category, note }
});

// Tinta hover derivata dal colore della categoria con ~7% di opacità (hex "12").
// v-bind() nel CSS la applica dinamicamente senza prop aggiuntivi.
const hoverColor = computed(() =>
  (store.categoryColors[props.item?.category ?? ""] ?? "#94a3b8") + "12"
);
</script>

<template>
  <!-- @click apre il pannello note; il checkbox usa @click.stop per non propagare -->
  <li :class="{ done: item.done }" @click="store.toggleNote(item.id)">
    <input
      type="checkbox"
      :checked="item.done"
      @change.stop="store.toggleItem(item.id)"
      @click.stop
    />
    <div class="item-body">
      <span class="name">{{ item.name }}</span>
      <!-- Anteprima nota: visibile quando esiste una nota e il pannello è chiuso -->
      <span v-if="item.note" class="note-preview">{{ item.note }}</span>
    </div>
  </li>
</template>

<style scoped>
li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background 0.15s;

  @media (hover: hover) {
    &:hover { background: v-bind(hoverColor); }
  }
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: var(--text);
  touch-action: manipulation;
}

.item-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0; /* necessario per text-overflow sul figlio */
}

.name {
  font-size: 0.95rem;
  line-height: 1.4;
}

li.done .name {
  text-decoration: line-through;
  color: var(--muted);
}

.note-preview {
  font-size: 0.78rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
