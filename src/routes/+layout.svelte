<script>
  let { children } = $props();
  import "../app.css";
  import { onMount } from "svelte";
  import { initializeAuth } from "$lib/stores/auth";

  // Initialize auth system on app start
  onMount(() => {
    initializeAuth();
  });
</script>

<div class="min-h-screen bg-slate-900 text-slate-50">
  {@render children()}
</div>
