import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { CLE_STOCKAGE } from "./stockage";
import { enregistrerAventure } from "./test/uneAventure";

const zone = () => screen.getByRole("textbox", { name: "Notes" });
const notesEnregistrees = () =>
  JSON.parse(localStorage.getItem(CLE_STOCKAGE)!).aventure.notes;

describe("notes libres", () => {
  beforeEach(() => enregistrerAventure());

  it("montre une section « Notes » avec une zone de texte vide", () => {
    render(App);
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    expect(zone()).toHaveValue("");
  });

  it("enregistre le texte à chaque frappe, sans bouton à appuyer", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(zone());
    await lecteur.keyboard("Porte en hiv");
    expect(notesEnregistrees()).toBe("Porte en hiv");
    await lecteur.keyboard("er");
    expect(notesEnregistrees()).toBe("Porte en hiver");
    expect(
      screen.queryByRole("button", { name: /enregistrer|valider/i }),
    ).not.toBeInTheDocument();
  });

  it("garde les sauts de ligne", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(zone());
    await lecteur.keyboard("Marais : piège au 74{Enter}Mot de passe : lune");
    expect(notesEnregistrees()).toBe(
      "Marais : piège au 74\nMot de passe : lune",
    );
  });

  it("retrouve le texte après avoir fermé puis rouvert l'app", async () => {
    const premiere = render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(zone());
    await lecteur.keyboard("Le gardien ment");
    premiere.unmount();

    render(App);
    expect(zone()).toHaveValue("Le gardien ment");
  });

  it("affiche les notes déjà enregistrées", () => {
    enregistrerAventure({ notes: "Ne pas reprendre le chemin du marais" });
    render(App);
    expect(zone()).toHaveValue("Ne pas reprendre le chemin du marais");
  });
});
