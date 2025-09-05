<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import WarningIcon from "phosphor-svelte/lib/Warning";
  import XIcon from "phosphor-svelte/lib/X";

  interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "warning" | "danger";
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    isOpen = false,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning",
    onConfirm,
    onCancel,
  }: Props = $props();

  const variantConfig = {
    warning: {
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-500/50",
      titleColor: "text-yellow-300",
      confirmButtonClass:
        "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    },
    danger: {
      iconColor: "text-red-400",
      bgColor: "bg-red-900/20",
      borderColor: "border-red-500/50",
      titleColor: "text-red-300",
      confirmButtonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
  };

  const config = variantConfig[variant];

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onCancel();
    } else if (event.key === "Enter") {
      onConfirm();
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    transition:fade={{ duration: 200 }}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-labelledby="confirm-title"
    aria-describedby="confirm-message"
  >
    <div
      class="relative w-full max-w-md p-6 bg-gray-800 border {config.borderColor} rounded-xl shadow-2xl {config.bgColor}"
      transition:fly={{ y: 20, duration: 300 }}
    >
      <!-- Close button -->
      <button
        class="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors duration-200"
        onclick={onCancel}
        aria-label="Close dialog"
      >
        <XIcon size={20} />
      </button>

      <!-- Content -->
      <div class="flex items-start space-x-4">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <WarningIcon size={24} class={config.iconColor} />
        </div>

        <!-- Text content -->
        <div class="flex-1 min-w-0">
          <h3
            id="confirm-title"
            class="text-lg font-semibold {config.titleColor} mb-2"
          >
            {title}
          </h3>
          <p id="confirm-message" class="text-gray-300 text-sm leading-relaxed">
            {message}
          </p>

          <!-- Action buttons -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              onclick={onCancel}
            >
              {cancelText}
            </button>
            <button
              class="px-4 py-2 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 {config.confirmButtonClass}"
              onclick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
