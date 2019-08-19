import {
  initPage,
  closePage,
  sleep,
} from "../utils";

describe("utils function test", () => {
  it("initPage test", async () => {
    const page = await initPage();
    expect(page.url()).toBe("about:blank");
  })

  it("sleep test", async () => {
    const beginDate = Date.now();
    await sleep(200);
    const endDate = Date.now();

    expect(endDate - beginDate > 199).toBeTruthy();
  })
})
