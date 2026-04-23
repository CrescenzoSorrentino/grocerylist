<script setup>
import { NotepadText, Trash2 } from "lucide-vue-next";

// PROPS — dati che questo componente riceve dall'esterno (dal genitore).
// "item" è un oggetto con questa forma: { name, done, category, note, index }.
// "editingNoteIndex" arriva da index.vue (passando per CategoryGroup): se vale
// lo stesso indice di questo item, il campo nota viene mostrato.
// Le props non si modificano qui dentro: si leggono e basta.
defineProps({
  item: Object,
  editingNoteIndex: Number,
});

// EMIT — eventi che questo componente lancia verso il genitore.
// "update-note" passa due argomenti: l'indice dell'item e il testo scritto.
const emit = defineEmits(["toggle", "note", "update-note", "remove"]);
</script>

<template>
  <!-- La classe CSS "done" viene aggiunta solo se item.done è true.
       Il : davanti a "class" significa che il valore è dinamico (calcolato da JS). -->
  <li :class="{ done: item.done }">

    <!-- Checkbox: la spunta rispecchia item.done.
         Al click lancia l'evento "toggle" passando l'indice,
         così il genitore sa quale elemento deve aggiornare. -->
    <input type="checkbox" :checked="item.done" @change="emit('toggle', item.index)" />

    <!-- Nome dell'elemento, con le doppie graffe per mostrare il valore della variabile. -->
    <span>{{ item.name }}</span>

    <div class="item-actions">
      <button class="btn-note" @click="emit('note', item.index)">
        <NotepadText :size="15" />
      </button>

      <!-- Pulsante cestino: al click lancia "remove" con l'indice dell'elemento. -->
      <button class="btn-remove" @click="emit('remove', item.index)">
        <Trash2 :size="15" />
      </button>
    </div>

  </li>

  <!-- Campo nota: visibile solo quando editingNoteIndex corrisponde a questo item. -->
  <li v-if="editingNoteIndex === item.index" class="note-row">
    <input
      class="note-input"
      type="text"
      placeholder="Add a note..."
      :value="item.note"
      @input="emit('update-note', item.index, $event.target.value)"
    />
  </li>
</template>

<style scoped>
li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 12px 20px;
  transition: background 0.15s;

  @media (hover: hover) {
    &:hover {
      background: var(--color-hover);
    }
  }
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: var(--color-primary);
  touch-action: manipulation;
}

li span {
  flex: 1;
  font-size: 0.95rem;
}

li.done span {
  text-decoration: line-through;
  color: var(--color-muted);
}

.item-actions {
  display: flex;
  align-items: center;
}

.btn-note,
.btn-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  border-radius: 12px;
  transition: color 0.2s;
  touch-action: manipulation;
}

.btn-remove {
  @media (hover: hover) {
    &:hover {
      color: var(--color-danger);
    }
  }
}

.note-row {
  min-height: unset;
  padding: 0 20px 12px;

  /* disabilita l'hover ereditato dalla regola li generale */
  &:hover {
    background: none;
  }
}

.note-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--color-border);
  outline: none;
  font-size: 0.875rem;
  font-family: inherit;
  background: transparent;
  color: var(--color-muted);
  padding: 4px 0;
}
</style>
