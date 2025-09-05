<script lang="ts">
  import { fade } from "svelte/transition";
  import LoadingSpinner from "../LoadingSpinner.svelte";

  interface Props {
    isOpen: boolean;
    onClose?: () => void;
    children?: any;
  }

  let { isOpen = false, onClose, children }: Props = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && onClose) {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-live="polite"
    aria-busy="true"
    aria-label="Loading"
  >
    <div
      class="relative p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700"
    >
      <!-- Loading content -->
      <div class="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" variant="default" />

        <!-- Custom content if provided -->
        {#if children}
          <div class="text-center text-gray-300">
            {@render children()}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
