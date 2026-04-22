<script setup>
// PROPS — l'array delle categorie disponibili arriva da index.vue.
// Le teniamo lì invece che qui perché sono un dato "globale" dell'app,
// non specifico di questo componente.
const props = defineProps({
  categories: Array,
});

// EMIT — quando l'utente aggiunge un elemento, questo componente non tocca
// l'array "items" direttamente (non lo conosce nemmeno).
// Lancia l'evento "add" verso index.vue con i dati del nuovo elemento.
const emit = defineEmits(["add"]);

// Stato locale: questi dati esistono solo dentro questo componente.
// newItem tiene il testo che l'utente sta scrivendo nell'input.
const newItem = ref("");
// selectedCategory tiene la categoria scelta nel select, "Other" come default.
const selectedCategory = ref("Other");

function addItem() {
  const testo = newItem.value.trim(); // .trim() rimuove spazi iniziali e finali
  if (!testo) return; // blocca se l'input è vuoto

  // Lancia l'evento "add" verso index.vue passando un oggetto con nome e categoria.
  emit("add", { name: testo, category: selectedCategory.value });

  newItem.value = ""; // svuota l'input dopo l'aggiunta
}
</script>

<template>
  <div class="add-bar">

    <!-- v-model collega l'input alla variabile "newItem" in modo bidirezionale:
         se l'utente scrive, newItem si aggiorna; se newItem cambia da codice, l'input si aggiorna.
         @keyup.enter permette di aggiungere l'elemento premendo Invio. -->
    <input
      v-model="newItem"
      placeholder="Add an item..."
      @keyup.enter="addItem"
    />

    <!-- v-model fa lo stesso con "selectedCategory".
         v-for genera un'opzione per ogni categoria nell'array ricevuto via props. -->
    <select v-model="selectedCategory">
      <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
    </select>

    <button @click="addItem">Add</button>

  </div>
</template>

<style scoped>
.add-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
}

.add-bar input {
  flex: 1 1 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  font-family: inherit;
  background: transparent;
  color: var(--color-text);
  min-height: 44px;
  touch-action: manipulation;
}

.add-bar select {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.85rem;
  font-family: inherit;
  background: var(--color-bg);
  color: var(--color-muted);
  border-radius: 12px;
  padding: 8px 12px;
  min-height: 44px;
  cursor: pointer;
  touch-action: manipulation;
}

.add-bar button {
  min-height: 44px;
  padding: 8px 24px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  touch-action: manipulation;

  @media (hover: hover) {
    &:hover {
      background: var(--color-primary-hover);
    }
  }
}

@media (min-width: 540px) {
  .add-bar {
    flex-wrap: nowrap;
    padding: 8px 8px 8px 20px;
  }

  .add-bar input {
    flex: 1 1 auto;
  }

  .add-bar select {
    flex: 0 0 auto;
  }
}
</style>
