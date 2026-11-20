import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import type { Arme } from "./aventure";
import { CLE_STOCKAGE } from "./stockage";
import { enregistrerAventure } from "./test/uneAventure";

const epeeCourte: Arme = { nom: "Épée courte", bonus: 1 };
const baton: Arme = { nom: "Bâton de l'Académie", bonus: 0 };
const dague: Arme = { nom: "Dague d'os", bonus: 1 };

const section = () => screen.getByRole("region", { name: "Armes" });
const dansSection = () => within(section());
const bouton = (nom: string | RegExp) =>
  dansSection().getByRole("button", { name: nom });
const lignes = () => dansSection().queryAllByRole("listitem");
/**
 * Le compteur à droite du titre, lu sans la trace de craie : quand le bonus
 * change, l'ancien reste barré devant le nouveau, puis s'efface en 1,2 s.
 */
function compteur() {
  const meta = dansSection().getByText(/\/ 2/).cloneNode(true) as HTMLElement;
  meta.querySelectorAll("s").forEach((trace) => trace.remove());
  return meta.textContent!.replace(/\s+/g, " ").trim();
}
const armesEnregistrees = () =>
  JSON.parse(localStorage.getItem(CLE_STOCKAGE)!).aventure.armes;

/** Le lecteur ajoute une arme par le formulaire de la section. */
async function ajouter(
  lecteur: ReturnType<typeof userEvent.setup>,
  nom: string,
  bonus?: string,
) {
  await lecteur.click(bouton("Ajouter une arme"));
  await lecteur.type(dansSection().getByLabelText("Nom de l'arme"), nom);
  if (bonus !== undefined) {
    const champ = dansSection().getByLabelText("Bonus de dommage");
    await lecteur.clear(champ);
    await lecteur.type(champ, bonus);
  }
  await lecteur.click(bouton("Ajouter l'arme"));
}

describe("section Armes", () => {
  beforeEach(() => enregistrerAventure());

  it("s'ouvre vide, avec « 0 / 2 », un bonus de +0 et le bouton d'ajout", () => {
    render(App);
    expect(
      within(section()).getByRole("heading", { name: "Armes" }),
    ).toBeInTheDocument();
    expect(compteur()).toBe("0 / 2 · +0 aux dégâts");
    expect(lignes()).toHaveLength(0);
    expect(bouton("Ajouter une arme")).toBeInTheDocument();
  });

  it("vient avant les Notes, après le bloc vital", () => {
    render(App);
    const notes = screen.getByRole("heading", { name: "Notes" });
    expect(
      section().compareDocumentPosition(notes) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("ajoute une arme avec son nom et son bonus, nom à gauche, bonus à droite", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await ajouter(lecteur, "Épée courte", "1");

    expect(lignes()).toHaveLength(1);
    expect(lignes()[0]).toHaveTextContent(/^Épée courte\s*\+1$/);
    expect(compteur()).toBe("1 / 2 · +1 aux dégâts");
    // Le formulaire s'est refermé.
    expect(
      dansSection().queryByLabelText("Nom de l'arme"),
    ).not.toBeInTheDocument();
  });

  it("enregistre l'arme tout de suite, et la retrouve après rechargement", async () => {
    const { unmount } = render(App);
    const lecteur = userEvent.setup();
    await ajouter(lecteur, "Épée courte", "1");
    expect(armesEnregistrees()).toEqual([epeeCourte]);

    unmount();
    render(App);
    expect(lignes()[0]).toHaveTextContent(/^Épée courte\s*\+1$/);
  });

  it("propose un bonus de +0 au départ et le règle avec « + » et « − »", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Ajouter une arme"));
    await lecteur.type(dansSection().getByLabelText("Nom de l'arme"), "Bâton");
    expect(dansSection().getByLabelText("Bonus de dommage")).toHaveValue(0);
    await lecteur.click(bouton("Augmenter Bonus de dommage"));
    await lecteur.click(bouton("Augmenter Bonus de dommage"));
    await lecteur.click(bouton("Diminuer Bonus de dommage"));
    await lecteur.click(bouton("Ajouter l'arme"));
    expect(armesEnregistrees()).toEqual([{ nom: "Bâton", bonus: 1 }]);
  });

  it("garde le bouton d'ajout éteint tant que l'arme n'a pas de nom, et dit pourquoi", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Ajouter une arme"));
    expect(bouton("Nommez d'abord l'arme")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await lecteur.click(bouton("Nommez d'abord l'arme"));
    expect(lignes()).toHaveLength(0);

    await lecteur.type(dansSection().getByLabelText("Nom de l'arme"), "  ");
    expect(bouton("Nommez d'abord l'arme")).toBeInTheDocument();
  });

  it("annule l'ajout sans rien enregistrer", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Ajouter une arme"));
    await lecteur.type(dansSection().getByLabelText("Nom de l'arme"), "Épée");
    await lecteur.click(bouton("Annuler"));
    expect(lignes()).toHaveLength(0);
    expect(armesEnregistrees()).toEqual([]);
  });

  it("reçoit une arme au bonus négatif, écrit avec son signe", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await ajouter(lecteur, "Masse rouillée", "-2");
    expect(lignes()[0]).toHaveTextContent(/^Masse rouillée\s*−2$/);
    expect(compteur()).toBe("1 / 2 · −2 aux dégâts");
  });

  it("additionne les bonus : épée courte +1 et bâton +0 font +1 aux dégâts", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await ajouter(lecteur, "Épée courte", "1");
    await ajouter(lecteur, "Bâton de l'Académie");
    expect(compteur()).toBe("2 / 2 · +1 aux dégâts");
    expect(armesEnregistrees()).toEqual([epeeCourte, baton]);
  });
});

describe("modifier et retirer une arme", () => {
  beforeEach(() => enregistrerAventure({ armes: [epeeCourte, baton] }));

  it("corrige le bonus d'un appui, enregistré à la frappe, et met le total à jour", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Bonus de Épée courte, modifier : 1"));
    const champ = dansSection().getByLabelText("Bonus de Épée courte");
    await lecteur.clear(champ);
    await lecteur.type(champ, "3");
    expect(armesEnregistrees()[0]).toEqual({ nom: "Épée courte", bonus: 3 });
    await lecteur.keyboard("{Enter}");
    expect(lignes()[0]).toHaveTextContent(/^Épée courte\s*\+3$/);
    expect(compteur()).toBe("2 / 2 · +3 aux dégâts");
  });

  it("corrige le nom d'un appui, enregistré à la frappe", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Épée courte"));
    const champ = dansSection().getByLabelText("Nom de Épée courte");
    await lecteur.clear(champ);
    await lecteur.type(champ, "Épée longue{Enter}");
    expect(armesEnregistrees()[0]).toEqual({ nom: "Épée longue", bonus: 1 });
    expect(bouton("Épée longue")).toBeInTheDocument();
  });

  it("garde l'ancien nom tant que le champ est vide", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Épée courte"));
    await lecteur.clear(dansSection().getByLabelText("Nom de Épée courte"));
    expect(armesEnregistrees()[0].nom).toBe("Épée courte");
    await lecteur.keyboard("{Escape}");
    expect(bouton("Épée courte")).toBeInTheDocument();
  });

  it("retire une arme d'un appui sur sa croix, enregistré aussitôt", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Retirer Épée courte"));
    expect(lignes()).toHaveLength(1);
    expect(lignes()[0]).toHaveTextContent("Bâton de l'Académie");
    expect(compteur()).toBe("1 / 2 · +0 aux dégâts");
    expect(armesEnregistrees()).toEqual([baton]);
  });
});

describe("plus de 2 armes", () => {
  beforeEach(() => enregistrerAventure({ armes: [epeeCourte, baton] }));

  it("à 2 armes, le compteur n'est pas rouge et aucun indice ne paraît", () => {
    render(App);
    expect(dansSection().getByText(/^2 \/ 2/)).not.toHaveAttribute(
      "data-etat",
      "depasse",
    );
    expect(dansSection().queryByRole("note")).not.toBeInTheDocument();
  });

  it("à 3 armes, le compteur passe en rouge, l'indice paraît et rien n'est bloqué", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await ajouter(lecteur, "Dague d'os", "1");

    expect(lignes()).toHaveLength(3);
    expect(armesEnregistrees()).toEqual([epeeCourte, baton, dague]);
    expect(dansSection().getByText(/^3 \/ 2/)).toHaveAttribute(
      "data-etat",
      "depasse",
    );
    expect(compteur()).toBe("3 / 2 · +2 aux dégâts");
    expect(dansSection().getByRole("note")).toHaveTextContent(
      "Les règles permettent 2 armes. Gardez-la si le livre l'autorise, sinon retirez-en une.",
    );
    // On peut en ajouter une quatrième.
    expect(bouton("Ajouter une arme")).toBeInTheDocument();
  });

  it("retirer l'arme en trop fait disparaître le rouge et l'indice", async () => {
    enregistrerAventure({ armes: [epeeCourte, baton, dague] });
    render(App);
    const lecteur = userEvent.setup();
    expect(dansSection().getByRole("note")).toBeInTheDocument();
    await lecteur.click(bouton("Retirer Dague d'os"));
    expect(dansSection().queryByRole("note")).not.toBeInTheDocument();
    expect(dansSection().getByText(/^2 \/ 2/)).not.toHaveAttribute(
      "data-etat",
      "depasse",
    );
  });
});

describe("les armes et la besace", () => {
  it("ne prennent aucune place : la besace reste à 0 / 24", () => {
    enregistrerAventure({ armes: [epeeCourte, baton, dague] });
    render(App);
    expect(dansSection().queryByText(/\/ 24/)).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Besace" })).getByText(
        "0 / 24",
      ),
    ).toBeInTheDocument();
  });
});
