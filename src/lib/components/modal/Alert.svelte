<script lang="ts">
  import { AlertType } from "$lib/utils/enums";
  import { fly, fade } from "svelte/transition";
  import CheckCircleIcon from "phosphor-svelte/lib/CheckCircle";
  import WarningIcon from "phosphor-svelte/lib/Warning";
  import XCircleIcon from "phosphor-svelte/lib/XCircle";
  import InfoIcon from "phosphor-svelte/lib/Info";
  import XIcon from "phosphor-svelte/lib/X";

  interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    onClose: () => void;
  }

  let { isOpen = false, title, message, type, onClose }: Props = $props();

  const typeConfig = {
    [AlertType.Success]: {
      icon: CheckCircleIcon,
      iconColor: "text-green-400",
      bgColor: "bg-green-900/20",
      borderColor: "border-green-500/50",
      titleColor: "text-green-300",
    },
    [AlertType.Error]: {
      icon: XCircleIcon,
      iconColor: "text-red-400",
      bgColor: "bg-red-900/20",
      borderColor: "border-red-500/50",
      titleColor: "text-red-300",
    },
    [AlertType.Warning]: {
      icon: WarningIcon,
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-500/50",
      titleColor: "text-yellow-300",
    },
    [AlertType.Info]: {
      icon: InfoIcon,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-900/20",
      borderColor: "border-blue-500/50",
      titleColor: "text-blue-300",
    },
  };

  const config = typeConfig[type];

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
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
    aria-labelledby="alert-title"
    aria-describedby="alert-message"
  >
    <div
      class="relative w-full max-w-md p-6 bg-gray-800 border {config.borderColor} rounded-xl shadow-2xl {config.bgColor}"
      transition:fly={{ y: 20, duration: 300 }}
    >
      <!-- Close button -->
      <button
        class="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors duration-200"
        onclick={onClose}
        aria-label="Close alert"
      >
        <XIcon size={20} />
      </button>

      <!-- Content -->
      <div class="flex items-start space-x-4">
        <!-- Icon -->
        <div class="flex-shrink-0">
          {#snippet iconSnippet()}
            {@const IconComponent = config.icon}
            <IconComponent size={24} class={config.iconColor} />
          {/snippet}
          {@render iconSnippet()}
        </div>

        <!-- Text content -->
        <div class="flex-1 min-w-0">
          <h3
            id="alert-title"
            class="text-lg font-semibold {config.titleColor} mb-2"
          >
            {title}
          </h3>
          <p id="alert-message" class="text-gray-300 text-sm leading-relaxed">
            {message}
          </p>

          <!-- Action button -->
          <div class="mt-6 flex justify-end">
            <button
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              onclick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
