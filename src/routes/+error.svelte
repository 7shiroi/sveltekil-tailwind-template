<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { House, ArrowLeft, Warning, Bug } from "phosphor-svelte";

  $: error = page.error;
  $: status = page.status;

  // Get appropriate error message based on status code
  $: errorMessage = getErrorMessage(status);
  $: errorDescription = getErrorDescription(status);

  function getErrorMessage(status: number) {
    switch (status) {
      case 404:
        return "Page Not Found";
      case 403:
        return "Access Forbidden";
      case 500:
        return "Internal Server Error";
      case 503:
        return "Service Unavailable";
      default:
        return "Something Went Wrong";
    }
  }

  function getErrorDescription(status: number) {
    switch (status) {
      case 404:
        return "The page you're looking for doesn't exist or has been moved.";
      case 403:
        return "You don't have permission to access this resource.";
      case 500:
        return "We're experiencing technical difficulties. Please try again later.";
      case 503:
        return "The service is temporarily unavailable. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again or contact support if the problem persists.";
    }
  }

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      goto("/");
    }
  }

  function goHome() {
    goto("/");
  }
</script>

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="max-w-md w-full text-center">
    <!-- Error Icon -->
    <div class="flex justify-center mb-8">
      {#if status === 404}
        <div class="p-4 rounded-full bg-slate-800 border border-slate-700">
          <Warning size={48} weight="duotone" class="text-amber-400" />
        </div>
      {:else if status >= 500}
        <div class="p-4 rounded-full bg-slate-800 border border-slate-700">
          <Bug size={48} weight="duotone" class="text-red-400" />
        </div>
      {:else}
        <div class="p-4 rounded-full bg-slate-800 border border-slate-700">
          <Warning size={48} weight="duotone" class="text-orange-400" />
        </div>
      {/if}
    </div>

    <!-- Error Code -->
    <div class="mb-4">
      <h1 class="text-6xl font-bold text-slate-200 mb-2">{status}</h1>
      <h2 class="text-2xl font-semibold text-slate-300">{errorMessage}</h2>
    </div>

    <!-- Error Description -->
    <p class="text-slate-400 mb-8 leading-relaxed">
      {errorDescription}
    </p>

    <!-- Error Details (for development) -->
    {#if error?.message && status >= 500}
      <details class="mb-8 text-left">
        <summary
          class="text-slate-500 text-sm cursor-pointer hover:text-slate-400 transition-colors"
        >
          Technical Details
        </summary>
        <div class="mt-2 p-3 bg-slate-800 rounded-md border border-slate-700">
          <code class="text-red-400 text-xs break-words">
            {error.message}
          </code>
        </div>
      </details>
    {/if}

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onclick={goBack}
        class="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors duration-200 font-medium"
      >
        <ArrowLeft size={20} />
        Go Back
      </button>

      <button
        onclick={goHome}
        class="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
      >
        <House size={20} />
        Go Home
      </button>
    </div>

    <!-- Help Text -->
    <p class="text-slate-500 text-sm mt-8">
      If this problem persists, please contact support.
    </p>
  </div>
</div>
