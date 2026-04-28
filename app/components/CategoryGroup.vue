<script setup>
// CategoryGroup visualizza una categoria con i suoi item.
// Riceve il nome della categoria e l'array degli item come props.
// Il colore del bordo sinistro viene letto da store.categoryColors
// e passato al CSS tramite v-bind() — nessun prop aggiuntivo necessario.
const store = useGroceryStore();

const props = defineProps({
  category: String,
  items: Array,
});

// Colore della categoria, con fallback grigio neutro se non trovato.
const color = computed(() => store.categoryColors[props.category ?? ""] ?? "#94a3b8");
</script>

<template>
  <div class="group">
    <!-- Titolo del gruppo libero sopra il bordo colorato -->
    <p class="category-label">{{ category }}</p>
    <ul>
      <!-- :key usa item.id — stabile anche se l'array viene riordinato o filtrato -->
      <GroceryItem v-for="item in items" :key="item.id" :item="item" />
    </ul>
  </div>
</template>

<style scoped>
.group {
  margin: 0 20px 16px;
  break-inside: avoid; /* impedisce che il gruppo venga spezzato tra due colonne */
}

.category-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  padding: 20px 0 8px 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 2px solid v-bind(color); /* bordo colorato solo sugli item, non sul titolo */
}
</style>
