import { logTemplate, redactSensitiveValues } from "./log";

describe("log template redaction", () => {
  it("redacts sensitive nested values", () => {
    expect(
      redactSensitiveValues({
        mongo: {
          username: "search-next",
          password: "secret",
        },
        admin: {
          confirmPassword: "secret",
        },
        nested: [{ accessToken: "token" }],
      }),
    ).toEqual({
      mongo: {
        username: "search-next",
        password: "[REDACTED]",
      },
      admin: {
        confirmPassword: "[REDACTED]",
      },
      nested: [{ accessToken: "[REDACTED]" }],
    });
  });

  it("does not print sensitive body values", () => {
    const output = logTemplate({
      url: "/setup/check",
      method: "POST",
      ip: "127.0.0.1",
      statusCode: 200,
      body: {
        mongo: {
          password: "secret",
        },
      },
    });

    expect(output).toContain('"password":"[REDACTED]"');
    expect(output).not.toContain("secret");
  });
});
