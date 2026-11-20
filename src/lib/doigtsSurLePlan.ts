/**
 * Les doigts sur la grille d'un plan : ce que veut dire chaque événement de
 * pointeur. Ce module ne connaît ni l'écran ni les murs : il reçoit les
 * doigts qui se posent, glissent, se lèvent ou sont repris par le navigateur,
 * en px de l'écran, et rend une intention que GrilleDuPlan applique (tracer,
 * défiler, ouvrir une case, abandonner le trait).
 *
 * Un doigt seul trace, en mode Murs (`actif`). Deux doigts font défiler le
 * plan, dans les deux modes ; si le second se pose pendant un trait, le trait
 * est abandonné sans rien changer (il n'est appliqué qu'au lever du doigt), et
 * les doigts font défiler jusqu'à ce qu'ils soient tous levés.
 *
 * En mode Cases, un appui est un doigt seul qui se pose et se lève sans avoir
 * bougé de plus de 10 px : le `click` du bouton touché ouvre alors la case.
 * Dès que le doigt glisse, ou qu'un second doigt se pose, `aGlisse` passe à
 * vrai et le `click` qui suit n'ouvre rien. C'est le `click`, et non la levée
 * du doigt, qui ouvre : le panneau et son voile n'existent qu'après, sinon le
 * `click` du même appui tomberait sur le voile et le fermerait aussitôt. Le
 * clavier et les lecteurs d'écran cliquent sans doigt (`detail` à 0) : ils
 * ouvrent toujours.
 *
 * La capture du pointeur fait suivre un doigt même hors du cadre. En mode
 * Cases, un doigt seul n'est pas capturé : la capture ferait recevoir le
 * `click` au cadre au lieu du bouton touché. Il l'est dès qu'un second doigt
 * se pose.
 */

/** Au-delà de ce déplacement, en px, un doigt n'appuie plus : il glisse. */
const SEUIL_D_UN_APPUI = 10;

/** Ce que le module lit d'un événement de pointeur (un `PointerEvent` convient). */
export interface Pointeur {
  pointerId: number;
  clientX: number;
  clientY: number;
  pointerType: string;
  button: number;
}

export type Intention =
  | { quoi: "rien" }
  /** Le doigt seul se pose en mode Murs : un trait commence sous lui. */
  | { quoi: "commencer le trait" }
  /** Le doigt du trait glisse. */
  | { quoi: "prolonger le trait" }
  /** Le doigt du trait se lève : le trait s'applique au plan. */
  | { quoi: "finir le trait" }
  /** Un second doigt, ou le navigateur reprend la main : le trait n'a pas eu lieu. */
  | { quoi: "abandonner le trait" }
  /** Les deux doigts ont glissé de `glisse` px : le plan les suit. */
  | { quoi: "defiler"; glisse: { x: number; y: number } }
  /** Le `click` d'un bouton du mode Cases est un appui : la case s'ouvre. */
  | { quoi: "ouvrir la case" };

const RIEN: Intention = { quoi: "rien" };

export interface DoigtsSurLePlan {
  /** Un doigt se pose ; `capturer` dit quels pointeurs le cadre doit capturer. */
  poser(
    pointeur: Pointeur,
    actif: boolean,
  ): { intention: Intention; capturer: number[] };
  glisser(pointeur: Pointeur): Intention;
  lever(pointeur: Pointeur): Intention;
  /** `pointercancel` : le navigateur reprend la main (appel, geste système). */
  abandonner(pointeur: Pointeur): Intention;
  /** Le `click` d'un bouton de case ; `detail` vaut 0 sans doigt (clavier, lecteur d'écran). */
  cliquer(detail: number): Intention;
}

export function doigtsSurLePlan(): DoigtsSurLePlan {
  /** Les doigts posés, et leur dernière position à l'écran. */
  const doigts = new Map<number, { x: number; y: number }>();
  /** Le doigt qui trace, s'il y en a un. */
  let doigtDuTrait: number | null = null;
  /** Où le doigt s'est posé en mode Cases, pour savoir s'il appuie ou glisse. */
  let departDuDoigt = { x: 0, y: 0 };
  /** Le doigt a glissé (ou un second s'est posé) : le `click` qui suit n'ouvre rien. */
  let aGlisse = false;
  /** Deux doigts se sont posés : jusqu'au dernier levé, ils font défiler. */
  let defilement = false;

  /** Le milieu des deux premiers doigts posés. */
  function milieu() {
    const [a, b] = doigts.values();
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function oublier(id: number) {
    doigts.delete(id);
    if (doigts.size === 0) defilement = false;
  }

  return {
    poser(pointeur, actif) {
      if (pointeur.pointerType === "mouse" && pointeur.button !== 0) {
        return { intention: RIEN, capturer: [] };
      }
      const id = pointeur.pointerId;
      doigts.set(id, { x: pointeur.clientX, y: pointeur.clientY });
      const capturer = actif || doigts.size >= 2 ? [...doigts.keys()] : [];
      if (doigts.size >= 2) {
        const etaitLeTrait = doigtDuTrait !== null;
        defilement = true;
        doigtDuTrait = null;
        aGlisse = true;
        return {
          intention: etaitLeTrait ? { quoi: "abandonner le trait" } : RIEN,
          capturer,
        };
      }
      if (actif && !defilement) {
        doigtDuTrait = id;
        return { intention: { quoi: "commencer le trait" }, capturer };
      }
      if (!actif && !defilement) {
        departDuDoigt = { x: pointeur.clientX, y: pointeur.clientY };
        aGlisse = false;
      }
      return { intention: RIEN, capturer };
    },

    glisser(pointeur) {
      const id = pointeur.pointerId;
      if (!doigts.has(id)) return RIEN;
      const ici = { x: pointeur.clientX, y: pointeur.clientY };
      if (
        !aGlisse &&
        Math.hypot(ici.x - departDuDoigt.x, ici.y - departDuDoigt.y) >
          SEUIL_D_UN_APPUI
      ) {
        aGlisse = true;
      }
      if (id === doigtDuTrait) {
        doigts.set(id, ici);
        return { quoi: "prolonger le trait" };
      }
      if (!defilement || doigts.size < 2) {
        doigts.set(id, ici);
        return RIEN;
      }
      const avant = milieu();
      doigts.set(id, ici);
      const apres = milieu();
      return {
        quoi: "defiler",
        glisse: { x: apres.x - avant.x, y: apres.y - avant.y },
      };
    },

    lever(pointeur) {
      const id = pointeur.pointerId;
      const etaitLeTrait = id === doigtDuTrait;
      if (etaitLeTrait) doigtDuTrait = null;
      oublier(id);
      return etaitLeTrait ? { quoi: "finir le trait" } : RIEN;
    },

    abandonner(pointeur) {
      const id = pointeur.pointerId;
      const etaitLeTrait = id === doigtDuTrait;
      if (etaitLeTrait) doigtDuTrait = null;
      aGlisse = true;
      oublier(id);
      return etaitLeTrait ? { quoi: "abandonner le trait" } : RIEN;
    },

    cliquer(detail) {
      return detail === 0 || !aGlisse ? { quoi: "ouvrir la case" } : RIEN;
    },
  };
}
