import { describe, expect, it } from "vitest";
import { fuzzyRank, similarity, suggestQuery, trigrams } from "./fuzzy";

describe("trigrams & similarity", () => {
  it("pads words like pg_trgm", () => {
    expect([...trigrams("чай")]).toEqual(["  ч", " ча", "чай", "ай "]);
  });
  it("is 1 for identical strings and high for a one-letter typo", () => {
    expect(similarity("чашка", "чашка")).toBe(1);
    // pg_trgm gives the same 3 shared trigrams of 9 for a one-letter typo in a five-letter word.
    expect(similarity("чяшка", "чашка")).toBeCloseTo(1 / 3, 2);
    expect(similarity("чяшка", "плед")).toBe(0);
  });
});

describe("fuzzyRank", () => {
  const items = [
    { id: "a", title: "Чашка «Ранок»", haystack: "чашка ранок кава глазур" },
    { id: "b", title: "Плед вовняний", haystack: "плед вовна тепло" },
    { id: "c", title: "Чайник глиняний", haystack: "чайник глина" },
  ];
  it("puts substring matches first and tolerates typos", () => {
    expect(fuzzyRank("чашка", items).map((r) => r.id)).toEqual(["a"]);
    expect(fuzzyRank("чяшка", items)[0]?.id).toBe("a");
    expect(fuzzyRank("плет", items)[0]?.id).toBe("b");
  });
  it("returns everything for an empty query", () => {
    expect(fuzzyRank("", items)).toHaveLength(3);
  });
});

describe("suggestQuery", () => {
  const titles = ["Чашка «Ранок» молочно-біла", "Плед вовняний «Карпати»", "Сережки срібні «Роса»"];
  it("corrects a misspelled word", () => {
    expect(suggestQuery("чяшка", titles)).toBe("чашка");
    expect(suggestQuery("плед вовняний", titles)).toBeNull();
  });
  it("leaves short or unrelated queries alone", () => {
    expect(suggestQuery("пл", titles)).toBeNull();
    expect(suggestQuery("xyzxyz", titles)).toBeNull();
  });
});
