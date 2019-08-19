
describe("jest-puppeteer", () => {
  beforeAll(async () => {
    await page.goto('https://google.com');
  });
  it("test title", async () => {
    await expect(page.title()).resolves.toMatch("Google");
  })

  it("test url", async () => {
    await expect(page.url()).toMatch("google.com");
  })
})
