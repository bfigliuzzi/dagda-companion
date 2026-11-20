import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import type { Case } from "./cases";
import { unNouveauPlan, type Plan } from "./plans";
import { lireAventure } from "./stockage";
import { enregistrerAventure } from "./test/uneAventure";

/**
 * Le repère « vous êtes ici », vu comme le lecteur : le dernier chapitre lu se
 * change dans l'en-tête de la feuille, le plan s'ouvre depuis la section « Plans ».
 */

const uneCase = (
  colonne: number,
  ligne: number,
  chapitre: number | null,
  ordre = 1,
  note = "",
): Case => ({ colonne, ligne, chapitre, note, ordre });

const unPlan = (nom: string, cases: Case[], id = 1): Plan => ({
  ...unNouveauPlan(nom, []),
  id,
  cases,
});

afterEach(cleanup);

const section = () => within(screen.getByRole("region", { name: "Plans" }));
const grille = () => screen.getByRole("img", { name: /Grille du plan/ });
const disque = () => grille().querySelector("circle[data-repere]");
/** La case (colonne, ligne) où le disque est posé, déduite de son centre en px. */
const caseDuDisque = () => {
  const d = disque();
  if (!d) return null;
  return [
    Math.floor(Number(d.getAttribute("cx")) / 44),
    Math.floor(Number(d.getAttribute("cy")) / 44),
  ];
};
async function changerLeChapitre(
  lecteur: ReturnType<typeof userEvent.setup>,
  chapitre: number,
) {
  await lecteur.click(
    screen.getByRole("button", { name: /Dernier chapitre lu, modifier/ }),
  );
  const champ = screen.getByLabelText("Dernier chapitre lu");
  await lecteur.clear(champ);
  await lecteur.type(champ, `${chapitre}{Enter}`);
}

async function ouvrirLePlan(
  lecteur: ReturnType<typeof userEvent.setup>,
  nom = "Souterrains",
) {
  await lecteur.click(
    section().getByRole("button", { name: new RegExp(`^${nom}`) }),
  );
}

async function revenirALaFeuille(lecteur: ReturnType<typeof userEvent.setup>) {
  await lecteur.click(
    screen.getByRole("button", { name: "Retour à la feuille" }),
  );
}

async function ouvrirLaCase(
  lecteur: ReturnType<typeof userEvent.setup>,
  nom: string | RegExp,
) {
  await lecteur.click(screen.getByRole("radio", { name: "Cases" }));
  const bouton = screen.getByRole("button", { name: nom });
  await fireEvent.click(bouton, { detail: 0 });
}

describe("le repère se place tout seul", () => {
  it("sur la case dont le numéro est le dernier chapitre lu, en disque plein", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(1, 1, 47), uneCase(3, 2, 203)])],
    });
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    expect(caseDuDisque()).toEqual([3, 2]);
    expect(disque()).not.toHaveAttribute("data-etat", "pale");
  });

  it("changer le dernier chapitre lu le déplace", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(1, 1, 47), uneCase(3, 2, 203)])],
    });
    render(App);
    const lecteur = userEvent.setup();
    await changerLeChapitre(lecteur, 47);
    await ouvrirLePlan(lecteur);
    expect(caseDuDisque()).toEqual([1, 1]);
  });

  it("deux cases au même numéro : le repère va sur la dernière numérotée", async () => {
    enregistrerAventure({
      chapitre: 47,
      plans: [
        unPlan("Souterrains", [uneCase(1, 1, 47, 2), uneCase(5, 4, 47, 3)]),
      ],
    });
    render(App);
    await ouvrirLePlan(userEvent.setup());
    expect(caseDuDisque()).toEqual([5, 4]);
  });

  it("écrire le chapitre lu dans une case y amène le repère", async () => {
    enregistrerAventure({
      chapitre: 205,
      plans: [unPlan("Souterrains", [uneCase(1, 1, 47)])],
    });
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    expect(disque()).toBeNull();
    await ouvrirLaCase(lecteur, /^Case 4-4/);
    await lecteur.type(
      screen.getByRole("spinbutton", { name: "Chapitre" }),
      "205",
    );
    await lecteur.keyboard("{Escape}");
    expect(caseDuDisque()).toEqual([3, 3]);
  });

  it("sans case pour ce chapitre et sans repère déjà placé : pas de disque", async () => {
    enregistrerAventure({
      chapitre: 205,
      plans: [unPlan("Souterrains", [uneCase(1, 1, 47)])],
    });
    render(App);
    await ouvrirLePlan(userEvent.setup());
    expect(disque()).toBeNull();
  });
});

describe("« Je suis ici »", () => {
  it("place le repère sur la case choisie, qui le dit à la fin de son nom", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203)])],
    });
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    await ouvrirLaCase(lecteur, /^Case 6-6/);
    await lecteur.click(screen.getByRole("button", { name: "Je suis ici" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(caseDuDisque()).toEqual([5, 5]);
    expect(
      screen.getByRole("button", { name: "Case 6-6, vous êtes ici" }),
    ).toBeInTheDocument();
  });

  it("le repère y reste jusqu'au prochain changement de chapitre", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203), uneCase(1, 1, 47)])],
    });
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    await ouvrirLaCase(lecteur, /^Case 6-6/);
    await lecteur.click(screen.getByRole("button", { name: "Je suis ici" }));
    // On modifie le plan sans changer de chapitre : le repère ne bouge pas.
    await ouvrirLaCase(lecteur, /^Case 2-2/);
    await lecteur.type(screen.getByLabelText("Note"), "clé");
    await lecteur.keyboard("{Escape}");
    expect(caseDuDisque()).toEqual([5, 5]);
    await revenirALaFeuille(lecteur);
    await changerLeChapitre(lecteur, 47);
    await ouvrirLePlan(lecteur);
    expect(caseDuDisque()).toEqual([1, 1]);
  });

  it("une pose à la main ne revient pas avec le chapitre d'avant : le 203 reprend sa case", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203)])],
    });
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    await ouvrirLaCase(lecteur, /^Case 6-6/);
    await lecteur.click(screen.getByRole("button", { name: "Je suis ici" }));
    await revenirALaFeuille(lecteur);
    await changerLeChapitre(lecteur, 300);
    await changerLeChapitre(lecteur, 203);
    await ouvrirLePlan(lecteur);
    expect(caseDuDisque()).toEqual([3, 2]);
  });
});

describe("le chapitre n'est pas sur le plan", () => {
  const avecLeRepereSur203 = () =>
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203)])],
    });

  it("le repère reste où il était, en craie pâle, avec l'indice", async () => {
    avecLeRepereSur203();
    render(App);
    const lecteur = userEvent.setup();
    await changerLeChapitre(lecteur, 205);
    await ouvrirLePlan(lecteur);
    expect(caseDuDisque()).toEqual([3, 2]);
    expect(disque()).toHaveAttribute("data-etat", "pale");
    expect(
      screen.getByText(
        (_, el) => el?.textContent === "§ 205 n'est pas sur ce plan.",
      ),
    ).toBeInTheDocument();
  });

  it("le disque pâle est annoncé par le nom de la case et par la grille", async () => {
    avecLeRepereSur203();
    render(App);
    const lecteur = userEvent.setup();
    await changerLeChapitre(lecteur, 205);
    await ouvrirLePlan(lecteur);
    expect(grille()).toHaveAccessibleName(/repère pâle en case 4-3/);
    await lecteur.click(screen.getByRole("radio", { name: "Cases" }));
    expect(
      screen.getByRole("button", {
        name: "Case 4-3, chapitre 203, vous étiez ici (repère pâle)",
      }),
    ).toBeInTheDocument();
  });

  it("quand le chapitre est sur le plan, la grille dit où l'on est et il n'y a pas d'indice", async () => {
    avecLeRepereSur203();
    render(App);
    await ouvrirLePlan(userEvent.setup());
    expect(grille()).toHaveAccessibleName(/vous êtes ici en case 4-3/);
    expect(screen.queryByText(/n'est pas sur ce plan/)).not.toBeInTheDocument();
  });

  it("l'indice ne s'affiche pas sur un plan où aucune case n'est numérotée et qui n'a jamais eu de repère", async () => {
    enregistrerAventure({ chapitre: 205, plans: [unPlan("Souterrains", [])] });
    render(App);
    await ouvrirLePlan(userEvent.setup());
    expect(screen.queryByText(/n'est pas sur ce plan/)).not.toBeInTheDocument();
  });

  it("l'indice s'affiche sans repère dès qu'une case est numérotée ailleurs", async () => {
    enregistrerAventure({
      chapitre: 205,
      plans: [unPlan("Souterrains", [uneCase(1, 1, 47)])],
    });
    render(App);
    await ouvrirLePlan(userEvent.setup());
    expect(disque()).toBeNull();
    expect(screen.getByText(/n'est pas sur ce plan/)).toBeInTheDocument();
  });

  it("vider la case du repère le laisse en place, en craie pâle, avec l'indice", async () => {
    avecLeRepereSur203();
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    await ouvrirLaCase(lecteur, /^Case 4-3/);
    await lecteur.click(screen.getByRole("button", { name: "Vider la case" }));
    expect(caseDuDisque()).toEqual([3, 2]);
    expect(disque()).toHaveAttribute("data-etat", "pale");
    expect(grille()).toHaveAccessibleName(/repère pâle en case 4-3/);
    expect(
      screen.getByRole("button", {
        name: "Case 4-3, vous étiez ici (repère pâle)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, el) => el?.textContent === "§ 203 n'est pas sur ce plan.",
      ),
    ).toBeInTheDocument();
  });

  it("remplacer le numéro de la case du repère par un autre le rend pâle", async () => {
    avecLeRepereSur203();
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    await ouvrirLaCase(lecteur, /^Case 4-3/);
    const champ = screen.getByRole("spinbutton", { name: "Chapitre" });
    await lecteur.clear(champ);
    await lecteur.type(champ, "204");
    await lecteur.keyboard("{Escape}");
    expect(caseDuDisque()).toEqual([3, 2]);
    expect(disque()).toHaveAttribute("data-etat", "pale");
    expect(screen.getByText(/n'est pas sur ce plan/)).toBeInTheDocument();
    await revenirALaFeuille(lecteur);
    expect(
      section().getByRole("button", { name: /^Souterrains/ }),
    ).toHaveTextContent("Souterrains 1 case notée");
  });

  it("posé à la main pour ce chapitre, il reste plein quand on vide sa case", async () => {
    avecLeRepereSur203();
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    await ouvrirLaCase(lecteur, /^Case 4-3/);
    await lecteur.click(screen.getByRole("button", { name: "Je suis ici" }));
    await ouvrirLaCase(lecteur, /^Case 4-3/);
    await lecteur.click(screen.getByRole("button", { name: "Vider la case" }));
    expect(caseDuDisque()).toEqual([3, 2]);
    expect(disque()).toHaveAttribute("data-etat", "repere");
    expect(screen.queryByText(/n'est pas sur ce plan/)).not.toBeInTheDocument();
  });

  it("quand le chapitre revient sur une case, le repère redevient plein", async () => {
    avecLeRepereSur203();
    render(App);
    const lecteur = userEvent.setup();
    await changerLeChapitre(lecteur, 205);
    await changerLeChapitre(lecteur, 203);
    await ouvrirLePlan(lecteur);
    expect(disque()).not.toHaveAttribute("data-etat", "pale");
  });
});

describe("chaque plan a son repère", () => {
  it("deux plans, deux repères indépendants", async () => {
    enregistrerAventure({
      chapitre: 47,
      plans: [
        unPlan("Souterrains", [uneCase(1, 1, 47)], 1),
        unPlan("Tour du mage", [uneCase(6, 6, 47), uneCase(2, 3, 12)], 2),
      ],
    });
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur, "Souterrains");
    await ouvrirLaCase(lecteur, /^Case 4-4/);
    await lecteur.click(screen.getByRole("button", { name: "Je suis ici" }));
    expect(caseDuDisque()).toEqual([3, 3]);
    await revenirALaFeuille(lecteur);
    await ouvrirLePlan(lecteur, "Tour du mage");
    expect(caseDuDisque()).toEqual([6, 6]);
    await revenirALaFeuille(lecteur);
    await changerLeChapitre(lecteur, 12);
    await ouvrirLePlan(lecteur, "Tour du mage");
    expect(caseDuDisque()).toEqual([2, 3]);
    await revenirALaFeuille(lecteur);
    // Le § 12 n'est pas sur « Souterrains » : son repère reste là où je l'avais posé.
    await ouvrirLePlan(lecteur, "Souterrains");
    expect(caseDuDisque()).toEqual([3, 3]);
    expect(disque()).toHaveAttribute("data-etat", "pale");
  });
});

describe("la ligne du plan sur la feuille", () => {
  const ligne = (nom: string) =>
    section().getByRole("button", { name: new RegExp(`^${nom}`) });

  it("« ici § 203 » quand le repère est sur une case numérotée", () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203), uneCase(1, 1, 47)])],
    });
    render(App);
    expect(ligne("Souterrains")).toHaveTextContent("Souterrains ici § 203");
  });

  it("le nombre de cases notées quand le repère n'est pas sur une case numérotée", () => {
    enregistrerAventure({
      chapitre: 205,
      plans: [
        unPlan("Souterrains", [
          uneCase(1, 1, 47),
          uneCase(2, 2, null, 0, "clé"),
          uneCase(3, 3, 12),
        ]),
        unPlan("Tour", [uneCase(1, 1, null, 0, "porte")], 2),
        unPlan("Cave", [], 3),
      ],
    });
    render(App);
    expect(ligne("Souterrains")).toHaveTextContent(
      "Souterrains 3 cases notées",
    );
    expect(ligne("Tour")).toHaveTextContent("Tour 1 case notée");
    expect(ligne("Cave")).toHaveTextContent(/^Cave$/);
  });

  it("repère pâle sur une case numérotée : la ligne montre le nombre de cases notées, pas « ici »", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203)])],
    });
    render(App);
    const lecteur = userEvent.setup();
    await changerLeChapitre(lecteur, 205);
    expect(ligne("Souterrains")).toHaveTextContent("Souterrains 1 case notée");
    expect(ligne("Souterrains")).not.toHaveTextContent("ici");
  });

  it("repère posé à la main sur une case sans numéro : le nombre de cases notées", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203)])],
    });
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    await ouvrirLaCase(lecteur, /^Case 6-6/);
    await lecteur.click(screen.getByRole("button", { name: "Je suis ici" }));
    await revenirALaFeuille(lecteur);
    expect(ligne("Souterrains")).toHaveTextContent("1 case notée");
  });
});

describe("retrouver son repère", () => {
  it("la position posée à la main est enregistrée et retrouvée après avoir fermé puis rouvert l'app", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203)])],
    });
    const premiere = render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    await ouvrirLaCase(lecteur, /^Case 6-6/);
    await lecteur.click(screen.getByRole("button", { name: "Je suis ici" }));
    expect(lireAventure(localStorage)!.plans[0].repere).toEqual({
      colonne: 5,
      ligne: 5,
      chapitre: 203,
      manuel: true,
    });
    premiere.unmount();
    render(App);
    await ouvrirLePlan(userEvent.setup());
    expect(caseDuDisque()).toEqual([5, 5]);
  });

  it("la dernière position connue d'un chapitre absent est enregistrée et retrouvée", async () => {
    enregistrerAventure({
      chapitre: 203,
      plans: [unPlan("Souterrains", [uneCase(3, 2, 203)])],
    });
    const premiere = render(App);
    await changerLeChapitre(userEvent.setup(), 205);
    premiere.unmount();
    render(App);
    const lecteur = userEvent.setup();
    await ouvrirLePlan(lecteur);
    expect(caseDuDisque()).toEqual([3, 2]);
    expect(disque()).toHaveAttribute("data-etat", "pale");
  });
});
