import {
  initPage,
  range,
  sleep,
  roughlyNum,
  setRetrieveEpisodes,
} from "../utils";

describe("utils function test", () => {
  it("initPage test", async () => {
    const page = await initPage();
    expect(page.url()).toBe("about:blank");
  })

  it("sleep test", async () => {
    const beginDate = Date.now();
    await sleep(100);
    const endDate = Date.now();

    expect(endDate - beginDate > 99).toBeTruthy();
  })

  it("range test", () => {
    const result = range(7, 13);
    expect(result).toEqual([7, 8, 9, 10, 11, 12, 13]);
  })

  it("roughlyNum test", () => {
    const result = roughlyNum(1000);
    expect(result > 1000 && result < 2001).toBeTruthy();
  })

  it("setRetrieveEpisodes test", () => {
    const args = {
      ncode: "n7682fj",
      beginEp: 1,
      endEp: 11,
      isForce: false,
      isAll: false,
    };
    const maxEpisode = 7;
    setRetrieveEpisodes(args, maxEpisode);

    expect(args.endEp).toBe(maxEpisode)

    args.beginEp = 8;
    args.endEp = 11;
    setRetrieveEpisodes(args, maxEpisode);
    expect(args.beginEp + args.endEp).toBe(maxEpisode + maxEpisode);

    args.isAll = true;
    args.beginEp = 3;
    args.endEp = 4;
    setRetrieveEpisodes(args, maxEpisode);

    expect(args.beginEp).toBe(1);
    expect(args.endEp).toBe(maxEpisode);
  })
})
