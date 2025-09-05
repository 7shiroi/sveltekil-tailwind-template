<script lang="ts">
  import CalendarIcon from "phosphor-svelte/lib/Calendar";
  import CaretDownIcon from "phosphor-svelte/lib/CaretDown";
  import CaretLeftIcon from "phosphor-svelte/lib/CaretLeft";
  import CaretRightIcon from "phosphor-svelte/lib/CaretRight";
  import { STARTING_YEAR } from "$lib/utils/constants";

  interface Props {
    month?: number; // 1-12
    year?: number;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    id?: string;
    label?: string;
    onchange?: (month: number, year: number) => void;
  }

  let {
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
    placeholder = "Select month and year",
    disabled = false,
    error = "",
    id = "",
    label = "",
    onchange,
  }: Props = $props();

  let isOpen = $state(false);
  let tempMonth = $state(month);
  let tempYear = $state(year);

  // Update temp values when props change
  $effect(() => {
    tempMonth = month;
    tempYear = year;
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function formatDisplayValue(m: number, y: number): string {
    if (!m || !y) return placeholder;
    return `${months[m - 1]} ${y}`;
  }

  function handleMonthChange(newMonth: number) {
    tempMonth = newMonth;
  }

  function handleYearChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newYear = parseInt(target.value);
    const currentYear = new Date().getFullYear();
    if (!isNaN(newYear) && newYear >= STARTING_YEAR && newYear <= currentYear) {
      tempYear = newYear;
    }
  }

  function adjustYear(delta: number) {
    const newYear = tempYear + delta;
    const currentYear = new Date().getFullYear();
    if (newYear >= STARTING_YEAR && newYear <= currentYear) {
      tempYear = newYear;
    }
  }

  function applySelection() {
    onchange?.(tempMonth, tempYear);
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      isOpen = false;
      tempMonth = month;
      tempYear = year;
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      isOpen = false;
      tempMonth = month;
      tempYear = year;
    }
  }

  // Quick preset options
  const presets = [
    {
      label: "This Month",
      getMonthYear: (): [number, number] => {
        const now = new Date();
        return [now.getMonth() + 1, now.getFullYear()];
      },
    },
    {
      label: "Last Month",
      getMonthYear: (): [number, number] => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        return [lastMonth.getMonth() + 1, lastMonth.getFullYear()];
      },
    },
    {
      label: "3 Months Ago",
      getMonthYear: (): [number, number] => {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3);
        return [threeMonthsAgo.getMonth() + 1, threeMonthsAgo.getFullYear()];
      },
    },
    {
      label: "6 Months Ago",
      getMonthYear: (): [number, number] => {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6);
        return [sixMonthsAgo.getMonth() + 1, sixMonthsAgo.getFullYear()];
      },
    },
    {
      label: "One Year Ago",
      getMonthYear: (): [number, number] => {
        const now = new Date();
        return [now.getMonth() + 1, now.getFullYear() - 1];
      },
    },
  ];

  function setPreset(getMonthYear: () => [number, number]) {
    const [m, y] = getMonthYear();
    tempMonth = m;
    tempYear = y;
  }

  // Generate years for dropdown (STARTING_YEAR to current year, descending)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - STARTING_YEAR + 1 },
    (_, i) => currentYear - i
  );

  let displayValue = $derived(formatDisplayValue(month, year));
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="relative">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
  {/if}

  <!-- Month/Year Input Display -->
  <button
    type="button"
    {id}
    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-left flex items-center justify-between"
    class:border-red-500={error}
    class:focus:ring-red-500={error}
    class:opacity-50={disabled}
    onclick={() => !disabled && (isOpen = !isOpen)}
    {disabled}
  >
    <div class="flex items-center gap-2">
      <CalendarIcon size={16} class="text-gray-400" />
      <span class="text-sm">
        {displayValue}
      </span>
    </div>
    <CaretDownIcon
      size={16}
      class="text-gray-400 transition-transform duration-200 {isOpen
        ? 'rotate-180'
        : ''}"
    />
  </button>

  {#if error}
    <p class="mt-1 text-sm text-red-400">{error}</p>
  {/if}

  <!-- Month/Year Picker Modal -->
  {#if isOpen}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onclick={handleBackdropClick}
      onkeydown={handleKeydown}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
    >
      <div
        class="relative w-full max-w-md p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <!-- Header -->
        <div class="text-center mb-6">
          <h3 class="text-lg font-semibold text-white">Select Month & Year</h3>
          <p class="text-sm text-gray-400">Choose a specific month and year</p>
        </div>

        <!-- Year Controls -->
        <div class="flex items-center justify-between mb-6">
          <button
            type="button"
            class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            onclick={() => adjustYear(-1)}
          >
            <CaretLeftIcon size={20} class="text-gray-400" />
          </button>

          <div class="flex items-center gap-2">
            <span class="text-white font-medium">Year:</span>
            <input
              type="number"
              min={STARTING_YEAR}
              max={currentYear}
              value={tempYear}
              class="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              onchange={handleYearChange}
            />
          </div>

          <button
            type="button"
            class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            onclick={() => adjustYear(1)}
          >
            <CaretRightIcon size={20} class="text-gray-400" />
          </button>
        </div>

        <!-- Month Grid -->
        <div class="mb-6">
          <p class="text-sm font-medium text-gray-300 mb-3">Select Month:</p>
          <div class="grid grid-cols-3 gap-2">
            {#each months as monthName, index}
              <button
                type="button"
                class="px-3 py-2 text-sm rounded-lg transition-colors {tempMonth ===
                index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'}"
                onclick={() => handleMonthChange(index + 1)}
              >
                {monthName.substring(0, 3)}
              </button>
            {/each}
          </div>
        </div>

        <!-- Current Selection Display -->
        <div class="text-center mb-6 p-3 bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-300 mb-1">Selected:</p>
          <p class="text-white font-medium text-lg">
            {formatDisplayValue(tempMonth, tempYear)}
          </p>
        </div>

        <!-- Quick Presets -->
        <div class="mb-6">
          <p class="text-sm font-medium text-gray-300 mb-3">Quick options:</p>
          <div class="grid grid-cols-1 gap-2">
            {#each presets as preset}
              <button
                type="button"
                class="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white text-left"
                onclick={() => setPreset(preset.getMonthYear)}
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            onclick={() => {
              isOpen = false;
              tempMonth = month;
              tempYear = year;
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onclick={applySelection}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
