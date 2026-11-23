/**
 * Pour les tests : ouvre l'app sans aventure enregistrée, puis « Nouvel
 * apprenti » par « Commencer » sur l'Accueil, comme le lecteur.
 */
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import App from "../../App.svelte";
import type { De } from "../des";

export async function ouvrirNouvelApprenti(de: De) {
  const rendu = render(App, { de });
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Commencer" }));
  return rendu;
}
