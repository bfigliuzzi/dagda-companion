import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/atkinson-hyperlegible-next/500.css";
import "@fontsource/atkinson-hyperlegible-next/700.css";
import "@fontsource/atkinson-hyperlegible-next/800.css";
import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { deAuHasard, deDeLaGraine } from "./lib/des";

// Graine de dés : seulement dans l'app construite pour les tests de bout en
// bout (`vite build --mode test`). Ailleurs, ce bloc disparaît de la construction.
const de =
  import.meta.env.MODE === "test"
    ? (deDeLaGraine(new URLSearchParams(location.search).get("graine")) ??
      deAuHasard)
    : deAuHasard;

export default mount(App, {
  target: document.getElementById("app")!,
  props: { de },
});
