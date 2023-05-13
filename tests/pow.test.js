import { multiply } from "./pow";

describe("hooks", function () {
  beforeAll(() => {
    console.log("Wykonać na początku testów");
  });

  afterAll(() => {
    console.log("Wykonać po testach");
  });

  beforeEach(() => {
    console.log("Wykonać na początku każdego testu");
  });

  afterEach(() => {
    console.log("Wykonać na końcu każdego testu");
  });

  test("1 to power 2 to equal 1", () => {
    console.log("1 to power 2 to equal 1");
    expect(pow(1, 2)).toBe(1);
  });

  test("3 to power 2 to equal 9", () => {
    console.log("3 to power 2 to equal 9");
    expect(pow(3, 2)).toBe(9);
  });
});
