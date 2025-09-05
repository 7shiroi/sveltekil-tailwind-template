<script lang="ts">
  import { Eye, EyeClosed } from "phosphor-svelte";

  interface Props {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    type?: "text" | "email" | "password";
    required?: boolean;
    disabled?: boolean;
    error?: string;
    icon?: any; // Use any for Svelte 5 component compatibility
    showPasswordToggle?: boolean;
    onInput?: (value: string) => void;
  }

  let {
    id,
    label,
    value = $bindable(),
    placeholder = "",
    type = "text",
    required = false,
    disabled = false,
    error = "",
    icon,
    showPasswordToggle = false,
    onInput,
  }: Props = $props();

  let showPassword = $state(false);
  let inputType = $derived(type === "password" && showPassword ? "text" : type);

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    value = target.value;
    if (onInput) {
      onInput(target.value);
    }
  };

  const togglePassword = () => {
    showPassword = !showPassword;
  };
</script>

<div>
  <label
    for={id}
    class="block text-sm font-medium text-slate-300 mb-2"
    class:required
  >
    {label}
    {#if required}
      <span class="text-red-400 ml-1">*</span>
    {/if}
  </label>

  <div class="relative">
    {#if icon}
      {@const IconComponent = icon}
      <div
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <IconComponent class="h-5 w-5 text-slate-400" />
      </div>
    {/if}

    <input
      {id}
      type={inputType}
      {value}
      oninput={handleInput}
      class="block w-full {icon ? 'pl-10' : 'pl-3'} {showPasswordToggle
        ? 'pr-10'
        : 'pr-3'} py-3 border border-slate-600 rounded-lg bg-slate-800 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
      class:border-red-500={error}
      {placeholder}
      {required}
      {disabled}
    />

    {#if showPasswordToggle && type === "password"}
      <button
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        onclick={togglePassword}
        {disabled}
      >
        {#if showPassword}
          <EyeClosed class="h-5 w-5 text-slate-400 hover:text-slate-300" />
        {:else}
          <Eye class="h-5 w-5 text-slate-400 hover:text-slate-300" />
        {/if}
      </button>
    {/if}
  </div>

  {#if error}
    <p class="mt-1 text-sm text-red-400">{error}</p>
  {/if}
</div>
