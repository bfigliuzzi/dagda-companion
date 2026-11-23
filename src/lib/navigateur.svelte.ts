/**
 * Ce que le navigateur dit de l'installation : l'appareil deviné d'après son
 * identifiant (installation.ts, code pur), si l'app tourne déjà installée, et
 * l'invitation à installer que proposent Chrome et Edge
 * (`beforeinstallprompt`).
 *
 * Emploi : créer l'objet avant de monter l'app (main.ts). Chrome envoie
 * `beforeinstallprompt` une seule fois, peu après le chargement ; sans
 * écouteur à ce moment-là, l'invitation est perdue.
 */
import { devinerLAppareil, type Appareil } from "./installation";

/** L'événement `beforeinstallprompt`, absent des types du DOM (Chromium seul). */
export interface InviteDInstallation extends Event {
  prompt(): Promise<unknown>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export class InstallationDuNavigateur {
  /** L'appareil deviné, ou `null` s'il n'est pas dans le tableau. */
  readonly appareil: Appareil | null;
  /** L'app tourne installée, ou vient de l'être : ni tutoriel, ni lien. */
  installee = $state(false);
  /** L'invitation du navigateur, gardée pour le bouton « Installer ». */
  invite = $state<InviteDInstallation | null>(null);

  constructor(fenetre: Window) {
    const { navigator } = fenetre;
    this.appareil = devinerLAppareil(
      navigator.userAgent,
      navigator.maxTouchPoints ?? 0,
    );
    this.installee = tourneInstallee(fenetre);

    fenetre.addEventListener("beforeinstallprompt", (evenement) => {
      // Le navigateur n'affiche pas sa propre bannière : le bouton de l'app la remplace.
      evenement.preventDefault();
      this.invite = evenement as InviteDInstallation;
    });
    fenetre.addEventListener("appinstalled", () => {
      this.installee = true;
      this.invite = null;
    });
  }

  /** Le bouton « Installer » : ouvre la fenêtre d'installation du navigateur. */
  async installer() {
    const invite = this.invite;
    if (invite === null) return;
    await invite.prompt();
    const { outcome } = await invite.userChoice;
    // Une invitation ne sert qu'une fois ; le navigateur en renverra une s'il le veut.
    this.invite = null;
    if (outcome === "accepted") this.installee = true;
  }
}

/** Ouverte depuis son icône : mode `standalone` (ou `navigator.standalone` sur iPhone). */
function tourneInstallee(fenetre: Window): boolean {
  const ios = (fenetre.navigator as Navigator & { standalone?: boolean })
    .standalone;
  return (
    ios === true ||
    (typeof fenetre.matchMedia === "function" &&
      fenetre.matchMedia("(display-mode: standalone)").matches)
  );
}
