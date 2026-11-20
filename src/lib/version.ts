/** Numéro de version de l'app (« 0.2.0 »), ou « dev » hors du build de la CI. */
export const version: string = import.meta.env.VITE_VERSION ?? "dev";
