import { initiateOAuthFlow, initiateGoogleSignIn } from "@/utils/oauth";

describe("initiateOAuthFlow", () => {
  let mockForm: {
    method: string;
    action: string;
    submit: jest.Mock;
  };

  beforeEach(() => {
    mockForm = { method: "", action: "", submit: jest.fn() };
    jest.spyOn(document, "createElement").mockReturnValue(mockForm as unknown as HTMLElement);
    jest.spyOn(document.body, "appendChild").mockImplementation(() => mockForm as unknown as Node);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it("creates a form and submits it", () => {
    initiateOAuthFlow("Google", "/");
    expect(document.createElement).toHaveBeenCalledWith("form");
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(mockForm.submit).toHaveBeenCalled();
  });

  it("sets form method to POST", () => {
    initiateOAuthFlow("Google", "/");
    expect(mockForm.method).toBe("POST");
  });

  it("includes provider in the action URL", () => {
    initiateOAuthFlow("Google", "/dashboard");
    expect(mockForm.action).toContain("provider=Google");
  });

  it("encodes the returnUrl in the action", () => {
    initiateOAuthFlow("Google", "/dashboard?tab=orders");
    expect(mockForm.action).toContain(encodeURIComponent("/dashboard?tab=orders"));
  });

  it("uses the default API base URL when env var is not set", () => {
    initiateOAuthFlow("Google", "/");
    expect(mockForm.action).toContain("localhost:5100");
  });

  it("uses NEXT_PUBLIC_API_BASE_URL env var when set", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/api";
    initiateOAuthFlow("Google", "/");
    expect(mockForm.action).toContain("api.example.com");
  });

  it("uses 'Google' as default provider", () => {
    initiateOAuthFlow();
    expect(mockForm.action).toContain("provider=Google");
  });

  it("uses '/' as default returnUrl", () => {
    initiateOAuthFlow("Google");
    expect(mockForm.action).toContain(encodeURIComponent("/"));
  });
});

describe("initiateGoogleSignIn", () => {
  it("calls initiateOAuthFlow with Google provider and / returnUrl", () => {
    const mockForm = { method: "", action: "", submit: jest.fn() };
    jest.spyOn(document, "createElement").mockReturnValue(mockForm as unknown as HTMLElement);
    jest.spyOn(document.body, "appendChild").mockImplementation(() => mockForm as unknown as Node);

    initiateGoogleSignIn();

    expect(mockForm.action).toContain("provider=Google");
    expect(mockForm.action).toContain(encodeURIComponent("/"));
    expect(mockForm.submit).toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
