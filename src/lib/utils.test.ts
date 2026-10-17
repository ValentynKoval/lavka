import { describe, expect, it } from "vitest";
import { formatPrice, plural, slugify, truncate } from "./utils";

describe("formatPrice", () => {
  it("formats kopiykas as whole hryvnias with the ₴ sign", () => {
    expect(formatPrice(54000).replace(/ /g, " ")).toBe("540 ₴");
    expect(formatPrice(125000).replace(/ /g, " ")).toBe("1 250 ₴");
    expect(formatPrice(0).replace(/ /g, " ")).toBe("0 ₴");
  });
});

describe("slugify", () => {
  it("transliterates Ukrainian and strips punctuation", () => {
    expect(slugify("Чашка «Ранок» молочно-біла")).toBe("chashka-ranok-molochno-bila");
    expect(slugify("Їжак & Ґава")).toBe("izhak-gava");
    expect(slugify("  --Hello, World!--  ")).toBe("hello-world");
  });
});

describe("plural", () => {
  const forms: [string, string, string] = ["виріб", "вироби", "виробів"];
  it("picks the right Ukrainian plural form", () => {
    expect(plural(1, forms)).toBe("виріб");
    expect(plural(2, forms)).toBe("вироби");
    expect(plural(4, forms)).toBe("вироби");
    expect(plural(5, forms)).toBe("виробів");
    expect(plural(11, forms)).toBe("виробів");
    expect(plural(12, forms)).toBe("виробів");
    expect(plural(21, forms)).toBe("виріб");
    expect(plural(22, forms)).toBe("вироби");
    expect(plural(0, forms)).toBe("виробів");
  });
});

describe("truncate", () => {
  it("shortens long text with an ellipsis", () => {
    expect(truncate("короткий", 20)).toBe("короткий");
    expect(truncate("дуже довгий текст для перевірки", 10)).toBe("дуже довг…");
  });
});
