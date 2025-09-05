<script lang="ts">
  interface Props {
    title?: string;
    subtitle?: string;
    children: any;
    actions?: any;
    padding?: "none" | "sm" | "md" | "lg";
    variant?: "default" | "outline" | "solid";
    hover?: boolean;
  }

  let {
    title,
    subtitle,
    children,
    actions,
    padding = "md",
    variant = "default",
    hover = false,
  }: Props = $props();

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "bg-slate-800 border border-slate-700",
    outline: "border-2 border-slate-600 bg-transparent",
    solid: "bg-slate-700 border border-slate-600",
  };

  const baseClasses = "rounded-lg shadow-lg";
  const hoverClasses = hover
    ? "transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl"
    : "";
</script>

<div class="{baseClasses} {variantClasses[variant]} {hoverClasses}">
  {#if title || actions}
    <div
      class="flex items-center justify-between border-b border-slate-700 px-6 py-4"
    >
      <div>
        {#if title}
          <h3 class="text-lg font-semibold text-slate-50">{title}</h3>
        {/if}
        {#if subtitle}
          <p class="mt-1 text-sm text-slate-400">{subtitle}</p>
        {/if}
      </div>
      {#if actions}
        <div class="flex items-center space-x-2">
          {@render actions()}
        </div>
      {/if}
    </div>
  {/if}

  <div class={paddingClasses[padding]}>
    {@render children()}
  </div>
</div>
