<script setup>
// PROPS — dati ricevuti dal genitore (index.vue).
// "category" è una stringa con il nome del gruppo, es. "Dairy".
// "items" è l'array degli elementi che appartengono a quella categoria.
defineProps({
  category: String,
  items: Array,
});

// EMIT — questo componente è nel mezzo della catena:
// riceve gli eventi da GroceryItem (figlio) e li rilancia verso index.vue (genitore).
// È come un "passaparola": non fa nulla da solo, trasferisce il messaggio su.
const emit = defineEmits(["toggle", "remove"]);
</script>

<template>
  <div>
    <!-- Titolo della categoria, es. "DAIRY", "FRUIT"... -->
    <p class="category-label">{{ category }}</p>

    <ul>
      <!-- v-for crea un GroceryItem per ogni elemento dell'array "items".
           :key serve a Vue per tenere traccia di ogni elemento in modo univoco.
           :item passa l'oggetto elemento al componente figlio (prop). -->
      <GroceryItem
        v-for="item in items"
        :key="item.index"
        :item="item"
        @toggle="emit('toggle', $event)"
        @remove="emit('remove', $event)"
      />
      <!-- @toggle e @remove ascoltano gli eventi che arrivano da GroceryItem.
           $event è il valore che GroceryItem ha passato (l'indice dell'elemento).
           Li rilancia subito verso index.vue senza modificarli. -->
    </ul>
  </div>
</template>

<style scoped>
.category-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-muted);
  padding: 10px 20px 6px;
  border-top: 1px solid var(--color-border);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
