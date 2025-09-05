<script lang="ts">
  import LoadingSpinner from "./LoadingSpinner.svelte";

  interface Props {
    children: any;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    onclick?: () => void;
    type?: "button" | "submit" | "reset";
    href?: string;
  }

  let {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    onclick,
    type = "button",
    href,
  }: Props = $props();

  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-400",
    secondary:
      "bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500 disabled:bg-slate-400",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-400",
    ghost:
      "text-slate-300 hover:text-white hover:bg-slate-700 focus:ring-slate-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const isDisabled = disabled || loading;
</script>

{#if href}
  <a
    {href}
    class="{baseClasses} {variantClasses[variant]} {sizeClasses[
      size
    ]} {isDisabled ? 'opacity-50 cursor-not-allowed' : ''}"
    class:pointer-events-none={isDisabled}
  >
    {#if loading}
      <LoadingSpinner size="sm" variant="minimal" />
      <span class="ml-2">Loading...</span>
    {:else}
      {@render children()}
    {/if}
  </a>
{:else}
  <button
    {type}
    {onclick}
    disabled={isDisabled}
    class="{baseClasses} {variantClasses[variant]} {sizeClasses[
      size
    ]} disabled:cursor-not-allowed"
  >
    {#if loading}
      <LoadingSpinner size="sm" variant="minimal" />
      <span class="ml-2">Loading...</span>
    {:else}
      {@render children()}
    {/if}
  </button>
{/if}
