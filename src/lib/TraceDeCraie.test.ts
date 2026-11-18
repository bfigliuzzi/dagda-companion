import { render, screen } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TraceDeCraie from "./TraceDeCraie.svelte";

const trace = () => screen.queryByText("31", { selector: "s" });

describe("trace de craie", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("n'affiche rien tant que la valeur ne change pas", () => {
    render(TraceDeCraie, { valeur: 31 });
    expect(document.querySelector("s")).toBeNull();
  });

  it("barre l'ancienne valeur quand la valeur change, et la dit aux lecteurs d'écran", async () => {
    const { rerender } = render(TraceDeCraie, { valeur: 31 });
    await rerender({ valeur: 28 });
    expect(trace()).toBeInTheDocument();
    expect(trace()).toHaveTextContent("avant : 31");
  });

  it("s'efface au bout de 1,2 s, une seule fois", async () => {
    const { rerender } = render(TraceDeCraie, { valeur: 31 });
    await rerender({ valeur: 28 });

    vi.advanceTimersByTime(1199);
    expect(trace()).toBeInTheDocument();
    vi.advanceTimersByTime(1);
    await vi.waitFor(() => expect(trace()).not.toBeInTheDocument());

    vi.advanceTimersByTime(5000);
    expect(document.querySelector("s")).toBeNull();
  });

  it("ne trace rien quand la valeur reste la même", async () => {
    const { rerender } = render(TraceDeCraie, { valeur: 31 });
    await rerender({ valeur: 31 });
    expect(document.querySelector("s")).toBeNull();
  });

  it("garde la valeur d'avant une série de changements rapprochés, et repart pour 1,2 s", async () => {
    const { rerender } = render(TraceDeCraie, { valeur: 31 });
    await rerender({ valeur: 30 });
    vi.advanceTimersByTime(800);
    await rerender({ valeur: 28 });

    expect(trace()).toBeInTheDocument();
    expect(screen.queryByText("30", { selector: "s" })).not.toBeInTheDocument();
    vi.advanceTimersByTime(1199);
    expect(trace()).toBeInTheDocument();
    vi.advanceTimersByTime(1);
    await vi.waitFor(() => expect(trace()).not.toBeInTheDocument());
  });
});
