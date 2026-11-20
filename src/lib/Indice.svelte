<script lang="ts">
  /**
   * Indice non bloquant (DESIGN.md, « Hints ») : un trait de 2 px au-dessus,
   * une icône de 20 px puis un texte de 14 px en craie grise. L'icône dit le
   * ton : `info` en jaune, `alerte` en rouge. Les chiffres utiles se mettent
   * en `<b>` : ils passent en craie. Il dit quoi faire, il n'empêche rien.
   */
  import type { Snippet } from "svelte";
  import Icone from "./Icone.svelte";

  interface Props {
    icone: "info" | "alerte";
    /** `note` quand un lecteur d'écran doit l'annoncer comme une remarque. */
    role?: "note";
    /** Marge autour de l'indice (écriture raccourcie de `margin`), 14 px au-dessus par défaut. */
    marge?: string;
    /** Indice posé juste sous une liste : la ligne de la liste fait déjà le trait. */
    sousListe?: boolean;
    children: Snippet;
  }

  let {
    icone,
    role,
    marge = "14px 0 0",
    sousListe = false,
    children,
  }: Props = $props();
</script>

<div
  class="indice"
  class:alerte={icone === "alerte"}
  class:sous-liste={sousListe}
  {role}
  style:margin={marge}
>
  <Icone nom={icone} />
  <span>{@render children()}</span>
</div>

<style>
  .indice {
    display: flex;
    gap: 10px;
    padding: 10px 0 0;
    border-top: 2px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }
  .indice.sous-liste {
    border-top: 0;
    padding-top: var(--esp-xs);
  }
  .indice :global(svg) {
    flex: none;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    color: var(--jaune);
  }
  .indice.alerte :global(svg) {
    color: var(--rouge);
  }
  .indice :global(b) {
    color: var(--craie);
  }
</style>
