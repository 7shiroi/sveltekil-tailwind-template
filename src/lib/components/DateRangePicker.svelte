<script lang="ts">
  import CalendarIcon from "phosphor-svelte/lib/Calendar";
  import CaretDownIcon from "phosphor-svelte/lib/CaretDown";
  import XIcon from "phosphor-svelte/lib/X";

  interface Props {
    startDate?: string;
    endDate?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    id?: string;
    label?: string;
    onchange?: (startDate: string, endDate: string) => void;
  }

  // Set default to today if no dates provided
  function getDefaultDateRange(): [string, string] {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );
    return [start.toISOString(), end.toISOString()];
  }

  let {
    startDate = getDefaultDateRange()[0],
    endDate = getDefaultDateRange()[1],
    placeholder = "Select date range",
    disabled = false,
    error = "",
    id = "",
    label = "",
    onchange,
  }: Props = $props();

  let isOpen = $state(false);
  let tempStartDate = $state("");
  let tempEndDate = $state("");
  let mode = $state<"start" | "end">("start");

  // Initialize temp dates when component loads
  $effect(() => {
    tempStartDate = startDate;
    tempEndDate = endDate;
  });

  function formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }

  function formatDateForInput(dateStr: string): string {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  }

  function handleStartDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    tempStartDate = target.value ? new Date(target.value).toISOString() : "";

    // Auto-switch to end date if start date is selected
    if (tempStartDate && !tempEndDate) {
      mode = "end";
    }
  }

  function handleEndDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    tempEndDate = target.value ? new Date(target.value).toISOString() : "";
  }

  function applyDateRange() {
    // Validate date range
    if (tempStartDate && tempEndDate) {
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);

      if (start > end) {
        // Swap dates if start is after end
        const temp = tempStartDate;
        tempStartDate = tempEndDate;
        tempEndDate = temp;
      }
    }

    onchange?.(tempStartDate, tempEndDate);
    isOpen = false;
  }

  function clearDateRange() {
    tempStartDate = "";
    tempEndDate = "";
    onchange?.("", "");
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      isOpen = false;
      // Reset temp dates to original values
      tempStartDate = startDate;
      tempEndDate = endDate;
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      isOpen = false;
      // Reset temp dates to original values
      tempStartDate = startDate;
      tempEndDate = endDate;
    }
  }

  // Quick preset ranges
  const presets = [
    {
      label: "Today",
      getRange: (): [string, string] => {
        const today = new Date();
        const start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const end = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        return [start.toISOString(), end.toISOString()];
      },
    },
    {
      label: "Yesterday",
      getRange: (): [string, string] => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const start = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          0,
          0,
          0,
          0
        );
        const end = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          23,
          59,
          59,
          999
        );
        return [start.toISOString(), end.toISOString()];
      },
    },
    {
      label: "Last 7 days",
      getRange: (): [string, string] => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return [start.toISOString(), end.toISOString()];
      },
    },
    {
      label: "Last 30 days",
      getRange: (): [string, string] => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return [start.toISOString(), end.toISOString()];
      },
    },
    {
      label: "This month",
      getRange: (): [string, string] => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        return [start.toISOString(), end.toISOString()];
      },
    },
    {
      label: "Last month",
      getRange: (): [string, string] => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        return [start.toISOString(), end.toISOString()];
      },
    },
  ];

  function setPreset(getRange: () => [string, string]) {
    const [start, end] = getRange();
    tempStartDate = start;
    tempEndDate = end;
  }

  let displayValue = $derived(
    (() => {
      if (!startDate && !endDate) return placeholder;
      if (startDate && endDate) {
        return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
      }
      if (startDate) {
        return `From ${formatDateForDisplay(startDate)}`;
      }
      if (endDate) {
        return `Until ${formatDateForDisplay(endDate)}`;
      }
      return placeholder;
    })()
  );
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="relative">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
  {/if}

  <!-- Date Range Input Display -->
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
    <div class="flex items-center gap-1">
      {#if (startDate || endDate) && !disabled}
        <div
          class="p-1 hover:bg-gray-600 rounded transition-colors cursor-pointer"
          onclick={(e) => {
            e.stopPropagation();
            clearDateRange();
          }}
          role="button"
          tabindex="0"
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              clearDateRange();
            }
          }}
        >
          <XIcon size={14} class="text-gray-400" />
        </div>
      {/if}
      <CaretDownIcon
        size={16}
        class="text-gray-400 transition-transform duration-200 {isOpen
          ? 'rotate-180'
          : ''}"
      />
    </div>
  </button>

  {#if error}
    <p class="mt-1 text-sm text-red-400">{error}</p>
  {/if}

  <!-- Date Range Picker Modal -->
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
        class="relative w-full max-w-lg p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <!-- Header -->
        <div class="text-center mb-6">
          <h3 class="text-lg font-semibold text-white">Select Date Range</h3>
          <p class="text-sm text-gray-400">Choose start and end dates</p>
        </div>

        <!-- Mode Tabs -->
        <div class="flex mb-4 bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors {mode ===
            'start'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'}"
            onclick={() => (mode = "start")}
          >
            Start Date
          </button>
          <button
            type="button"
            class="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors {mode ===
            'end'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:text-white'}"
            onclick={() => (mode = "end")}
          >
            End Date
          </button>
        </div>

        <!-- Date Inputs -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              for="start-date-input"
              class="block text-sm font-medium text-gray-300 mb-2"
            >
              Start Date
            </label>
            <input
              id="start-date-input"
              type="date"
              value={formatDateForInput(tempStartDate)}
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onchange={handleStartDateChange}
            />
          </div>
          <div>
            <label
              for="end-date-input"
              class="block text-sm font-medium text-gray-300 mb-2"
            >
              End Date
            </label>
            <input
              id="end-date-input"
              type="date"
              value={formatDateForInput(tempEndDate)}
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onchange={handleEndDateChange}
            />
          </div>
        </div>

        <!-- Current Selection Display -->
        {#if tempStartDate || tempEndDate}
          <div class="text-center mb-6 p-3 bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-300 mb-1">Selected Range:</p>
            <p class="text-white font-medium">
              {tempStartDate && tempEndDate
                ? `${formatDateForDisplay(tempStartDate)} - ${formatDateForDisplay(tempEndDate)}`
                : tempStartDate
                  ? `From ${formatDateForDisplay(tempStartDate)}`
                  : tempEndDate
                    ? `Until ${formatDateForDisplay(tempEndDate)}`
                    : "No dates selected"}
            </p>
          </div>
        {/if}

        <!-- Quick Presets -->
        <div class="mb-6">
          <p class="text-sm font-medium text-gray-300 mb-3">Quick ranges:</p>
          <div class="grid grid-cols-2 gap-2">
            {#each presets as preset}
              <button
                type="button"
                class="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                onclick={() => setPreset(preset.getRange)}
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
              tempStartDate = startDate;
              tempEndDate = endDate;
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            onclick={clearDateRange}
          >
            Clear
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onclick={applyDateRange}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
