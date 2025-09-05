<script lang="ts" generics="T">
  import { clickOutside } from "$lib/utils/clickOutside";
  import { slide } from "svelte/transition";

  // Icons
  import ChevronDownIcon from "phosphor-svelte/lib/CaretDown";
  import ChevronUpIcon from "phosphor-svelte/lib/CaretUp";
  import MagnifyingGlassIcon from "phosphor-svelte/lib/MagnifyingGlass";
  import CheckIcon from "phosphor-svelte/lib/Check";
  import LoadingSpinner from "./LoadingSpinner.svelte";

  export interface SelectOption<T> {
    value: T;
    label: string;
    disabled?: boolean;
  }

  interface Props<T> {
    value?: T;
    options?: SelectOption<T>[];
    asyncOptions?: () => Promise<SelectOption<T>[]>;
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    required?: boolean;
    disabled?: boolean;
    searchable?: boolean;
    loading?: boolean;
    noOptionsText?: string;
    onchange?: (value: T) => void;
    compareValues?: (a: T, b: T) => boolean;
  }

  let {
    value = $bindable(),
    options = [],
    asyncOptions,
    label = "",
    placeholder = "Select an option...",
    searchPlaceholder = "Search options...",
    required = false,
    disabled = false,
    searchable = true,
    loading = false,
    noOptionsText = "No options found",
    onchange,
    compareValues = (a: T, b: T) => a === b,
  }: Props<T> = $props();

  // Component state
  let isOpen = $state(false);
  let searchTerm = $state("");
  let inputRef = $state<HTMLInputElement>();
  let focusedIndex = $state(-1);
  let isLoadingOptions = $state(false);
  let loadedOptions = $state<SelectOption<T>[]>([]);
  let hasLoadedAsync = $state(false);

  // Computed values
  let allOptions = $derived(() => {
    if (asyncOptions && hasLoadedAsync) {
      return loadedOptions;
    }
    return options;
  });

  let selectedOption = $derived(() =>
    value !== undefined
      ? allOptions().find((option) => compareValues(option.value, value!))
      : undefined
  );

  let filteredOptions = $derived(() => {
    if (!searchable || !searchTerm) return allOptions();
    return allOptions().filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  async function loadAsyncOptions() {
    if (!asyncOptions || hasLoadedAsync) return;

    isLoadingOptions = true;
    try {
      loadedOptions = await asyncOptions();
      hasLoadedAsync = true;
    } catch (error) {
      console.error("Failed to load options:", error);
      loadedOptions = [];
    } finally {
      isLoadingOptions = false;
    }
  }

  async function openDropdown() {
    if (disabled) return;

    // Load async options if needed
    if (asyncOptions && !hasLoadedAsync) {
      await loadAsyncOptions();
    }

    isOpen = true;
    searchTerm = "";
    focusedIndex = -1;
    // Focus the search input after the dropdown opens
    if (searchable) {
      setTimeout(() => inputRef?.focus(), 0);
    }
  }

  function closeDropdown() {
    isOpen = false;
    searchTerm = "";
    focusedIndex = -1;
  }

  function selectOption(option: SelectOption<T>) {
    if (option.disabled) return;
    value = option.value;
    onchange?.(option.value);
    closeDropdown();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;

    if (event.key === "Escape") {
      closeDropdown();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (
        isOpen &&
        focusedIndex >= 0 &&
        focusedIndex < filteredOptions().length
      ) {
        selectOption(filteredOptions()[focusedIndex]);
      } else if (filteredOptions().length === 1) {
        selectOption(filteredOptions()[0]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openDropdown();
      } else {
        focusedIndex = Math.min(focusedIndex + 1, filteredOptions().length - 1);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (isOpen) {
        focusedIndex = Math.max(focusedIndex - 1, -1);
      }
    }
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (disabled) return;

    if (event.key === "Escape") {
      closeDropdown();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions().length) {
        selectOption(filteredOptions()[focusedIndex]);
      } else if (filteredOptions().length === 1) {
        selectOption(filteredOptions()[0]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, filteredOptions().length - 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, -1);
    }
  }

  // Reset focused index when search term changes and auto-focus single result
  $effect(() => {
    if (searchTerm) {
      if (filteredOptions().length === 1) {
        focusedIndex = 0;
      } else {
        focusedIndex = -1;
      }
    }
  });

  // Load async options on mount if needed
  $effect(() => {
    if (asyncOptions && !hasLoadedAsync && !isLoadingOptions) {
      loadAsyncOptions();
    }
  });
</script>

<div class="space-y-2">
  {#if label}
    <label
      for="select-trigger"
      class="block text-sm font-medium text-slate-300"
    >
      {label}
      {#if required}
        <span class="text-red-400">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative" use:clickOutside={closeDropdown}>
    <!-- Trigger Button -->
    <button
      id="select-trigger"
      type="button"
      onclick={openDropdown}
      onkeydown={handleKeydown}
      {disabled}
      class="w-full px-4 py-3 pr-10 rounded-xl border border-slate-600 bg-slate-700/50 backdrop-blur-sm text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 text-left {disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:border-slate-500 cursor-pointer'}"
    >
      <span class={selectedOption() ? "text-white" : "text-slate-400"}>
        {selectedOption() ? selectedOption()!.label : placeholder}
      </span>
    </button>

    <!-- Dropdown Arrow -->
    <div
      class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
    >
      {#if loading || isLoadingOptions}
        <LoadingSpinner size="sm" />
      {:else if isOpen}
        <ChevronUpIcon size={20} class="text-slate-400" />
      {:else}
        <ChevronDownIcon size={20} class="text-slate-400" />
      {/if}
    </div>

    <!-- Dropdown Menu -->
    {#if isOpen}
      <div
        transition:slide={{ duration: 200 }}
        class="absolute z-50 w-full mt-1 rounded-xl border border-slate-600 bg-slate-700/95 backdrop-blur-sm shadow-xl overflow-hidden"
      >
        <!-- Search Input -->
        {#if searchable}
          <div class="p-3 border-b border-slate-600/50">
            <div class="relative">
              <input
                bind:this={inputRef}
                bind:value={searchTerm}
                onkeydown={handleSearchKeydown}
                type="text"
                placeholder={searchPlaceholder}
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              />
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              >
                <MagnifyingGlassIcon size={16} class="text-slate-400" />
              </div>
            </div>
          </div>
        {/if}

        <!-- Options List -->
        <div class="max-h-60 overflow-y-auto">
          {#if isLoadingOptions}
            <div class="px-4 py-8 text-center">
              <LoadingSpinner size="sm" />
              <p class="text-slate-400 text-sm mt-2">Loading options...</p>
            </div>
          {:else if filteredOptions().length > 0}
            {#each filteredOptions() as option, index}
              <button
                type="button"
                onclick={() => selectOption(option)}
                onmouseenter={() => (focusedIndex = index)}
                disabled={option.disabled}
                class="w-full px-4 py-3 text-left transition-colors flex items-center justify-between group {option.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : ''} {focusedIndex === index
                  ? 'bg-slate-600/50'
                  : 'hover:bg-slate-600/50'} focus:bg-slate-600/50 focus:outline-none"
              >
                <span
                  class="text-white group-hover:text-blue-400 transition-colors {focusedIndex ===
                  index
                    ? 'text-blue-400'
                    : ''} {option.disabled ? 'text-slate-500' : ''}"
                >
                  {option.label}
                </span>
                {#if value !== undefined && compareValues(value, option.value)}
                  <CheckIcon size={16} class="text-blue-400" />
                {/if}
              </button>
            {/each}
          {:else}
            <div class="px-4 py-3 text-slate-400 text-center">
              {noOptionsText}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
