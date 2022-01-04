import { getMiddlewareApiUrl } from "../../commons/src/methods/api";

jest.mock("../../commons/src/connections/manifest", () => ({
  ...(jest.requireActual("../../commons/src/connections/manifest") as any),
  fetchManifest: jest.fn(),
}));

describe("Components region selection based on component id prefix", () => {
  const ENV = process.env;

  beforeEach(() => {
    process.env = {
      ...ENV,
      API_GATEWAY: "web-components.nylas.com/middleware",
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => jest.restoreAllMocks());

  it("should select respective region middleware url", (done) => {
    const mockUSComponentId = "001-demo-agenda";
    const mockEUComponentId = "002-demo-agenda";
    const mockCAComponentId = "003-demo-agenda";
    const mockDefaultComponentId = "demo-agenda";

    expect(getMiddlewareApiUrl(mockUSComponentId)).toContain(
      "https://web-components.nylas.com/middleware",
    );
    expect(getMiddlewareApiUrl(mockEUComponentId)).toContain(
      "https://ireland-web-components.nylas.com/middleware",
    );
    expect(getMiddlewareApiUrl(mockCAComponentId)).toContain(
      "https://canada-web-components.nylas.com/middleware",
    );
    expect(getMiddlewareApiUrl(mockDefaultComponentId)).toContain(
      "https://web-components.nylas.com/middleware",
    );

    done();
  });
});
