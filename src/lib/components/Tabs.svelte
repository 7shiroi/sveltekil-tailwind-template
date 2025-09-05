<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  interface Tab {
    id: string;
    label: string;
    icon?: any;
  }

  interface Props {
    tabs: Tab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    children: Snippet<[{ tabId: string }]>;
    enableKeyboardShortcuts?: boolean;
  }

  let {
    tabs,
    activeTab = tabs[0]?.id,
    onTabChange,
    children,
    enableKeyboardShortcuts = true,
  }: Props = $props();
  let currentTab = $state(activeTab);

  function handleTabClick(tabId: string) {
    currentTab = tabId;
    onTabChange?.(tabId);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!enableKeyboardShortcuts) return;

    // Tab navigation with numbers (Ctrl+1-N)
    if (event.ctrlKey && /^[1-9]$/.test(event.key)) {
      event.preventDefault();
      const tabIndex = parseInt(event.key) - 1;
      if (tabs[tabIndex]) {
        currentTab = tabs[tabIndex].id;
        onTabChange?.(tabs[tabIndex].id);
      }
    }
    // Tab navigation with arrow keys (Ctrl+ArrowLeft/ArrowRight)
    else if (
      event.ctrlKey &&
      (event.key === "ArrowLeft" || event.key === "ArrowRight")
    ) {
      event.preventDefault();
      const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
      let newIndex;

      if (event.key === "ArrowLeft") {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      } else {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      }

      currentTab = tabs[newIndex].id;
      onTabChange?.(tabs[newIndex].id);
    }
  }

  onMount(() => {
    currentTab = activeTab;

    if (enableKeyboardShortcuts) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  });
</script>

<div class="w-full">
  <!-- Tab Navigation -->
  <div class="border-b border-slate-700/50">
    <nav class="flex overflow-x-auto scrollbar-hide pb-px">
      {#each tabs as tab}
        <button
          onclick={() => handleTabClick(tab.id)}
          class="group inline-flex items-center gap-2 py-4 px-4 md:px-6 lg:px-8 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-all duration-200 focus:outline-none min-w-0 {currentTab ===
          tab.id
            ? 'border-cyan-500 text-cyan-400'
            : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'}"
        >
          {#if tab.icon}
            {@const IconComponent = tab.icon}
            <IconComponent size={18} class="flex-shrink-0" />
          {/if}
          <span class="truncate">{tab.label}</span>
        </button>
      {/each}
    </nav>
  </div>

  <!-- Tab Content -->
  <div class="mt-6">
    <div class="tab-content" role="tabpanel">
      {@render children({ tabId: currentTab })}
    </div>
  </div>
</div>

<style>
  .tab-content {
    animation: fadeIn 0.2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Hide scrollbar for WebKit browsers */
  .scrollbar-hide {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none; /* WebKit */
  }

  /* Smooth scrolling for touch devices */
  @media (hover: none) and (pointer: coarse) {
    .scrollbar-hide {
      scroll-behavior: smooth;
    }
  }
</style>
