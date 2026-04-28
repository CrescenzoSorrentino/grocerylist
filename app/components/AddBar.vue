<script setup>
// AddBar è la barra fissa in basso per aggiungere nuovi item.
// Legge le categorie dallo store e chiama store.addItem() direttamente —
// nessuna prop in ingresso, nessun evento in uscita.
const store = useGroceryStore();

// Stato locale: visibile solo in questo componente.
const newItem = ref("");
const selectedCategory = ref("Other");

function addItem() {
  const text = newItem.value.trim();
  if (!text) return;
  store.addItem(text, selectedCategory.value);
  newItem.value = ""; // svuota l'input dopo l'aggiunta
}
</script>

<template>
  <div class="add-bar">
    <select v-model="selectedCategory">
      <option v-for="cat in store.categories" :key="cat" :value="cat">{{ cat }}</option>
    </select>

    <input
      v-model="newItem"
      placeholder="Add an item..."
      @keyup.enter="addItem"
    />

    <button @click="addItem">Add</button>
  </div>
</template>

<style scoped>
.add-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-h);
  background: var(--bg);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 40;
  max-width: 640px;
  margin: 0 auto;

  @media (min-width: 768px) {
    max-width: 960px;
    padding: 0 24px;
  }

  @media (min-width: 1200px) {
    max-width: 1280px;
  }
}

select {
  flex-shrink: 0;
  border: 1px solid var(--border);
  outline: none;
  font-size: 0.8rem;
  font-family: inherit;
  background: var(--bg-subtle);
  color: var(--muted);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  height: 36px;
}

input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.95rem;
  font-family: inherit;
  background: transparent;
  color: var(--text);
  height: 36px;

  &::placeholder { color: var(--muted); }
}

button {
  flex-shrink: 0;
  height: 36px;
  padding: 0 20px;
  background: var(--text);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  touch-action: manipulation;

  @media (hover: hover) {
    &:hover { background: var(--primary-hover); }
  }
}
</style>
