/**
 * Garde l'écran allumé pendant la lecture (Screen Wake Lock API).
 *
 * Le navigateur relâche le verrou quand l'app passe en arrière-plan : on le
 * redemande à chaque retour au premier plan. Sans l'API, ou en cas de refus
 * (batterie faible, réglage du navigateur), l'app continue normalement.
 *
 * Renvoie la fonction qui arrête la surveillance.
 */
export function garderEcranAllume(): () => void {
  function demander() {
    if (document.visibilityState !== "visible") return;
    navigator.wakeLock?.request("screen").catch(() => {});
  }

  demander();
  document.addEventListener("visibilitychange", demander);
  return () => document.removeEventListener("visibilitychange", demander);
}
