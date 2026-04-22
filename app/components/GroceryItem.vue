<script setup>
import { Trash2 } from "lucide-vue-next";

// PROPS — dati che questo componente riceve dall'esterno (dal genitore).
// "item" è un oggetto con questa forma: { name, done, category, index }
// Le props non si modificano qui dentro: si leggono e basta.
defineProps({
  item: Object,
});

// EMIT — il modo in cui questo componente comunica col genitore.
// Non può modificare i dati direttamente, quindi lancia un evento verso l'alto
// e dice "ehi, l'utente ha fatto qualcosa, pensaci tu".
// Dichiariamo i due eventi possibili: "toggle" e "remove".
const emit = defineEmits(["toggle", "remove"]);
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

    <!-- Pulsante cestino: al click lancia "remove" con l'indice dell'elemento. -->
    <button class="btn-remove" @click="emit('remove', item.index)">
      <Trash2 :size="15" />
    </button>

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

  @media (hover: hover) {
    &:hover {
      color: var(--color-danger);
    }
  }
}
</style>
