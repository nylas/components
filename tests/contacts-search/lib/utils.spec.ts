import { isValidEmail } from "../../../components/contacts-search/lib/utils";

describe("Validates emil", () => {
  it("Invalid email returns false", () => {
    expect(isValidEmail("test")).toBe(false);
    expect(isValidEmail("test@")).toBe(false);
    expect(isValidEmail("test@ test.com")).toBe(false);
    expect(isValidEmail("test@test")).toBe(false);
  });
  it("Valid email returns true", () => {
    expect(isValidEmail("test@test.com")).toBe(true);
    expect(isValidEmail("test.test@test.com")).toBe(true);
    expect(isValidEmail("test.test+test@test.com")).toBe(true);
  });
});
