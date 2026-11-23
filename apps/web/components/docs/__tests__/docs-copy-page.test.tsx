import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DocsCopyPage } from "@/components/docs/docs-copy-page";
import { fallbackSiteOrigin } from "@/config/site";

const markdown = "# Select\n\nA component.";
const writeText = vi.fn();
const animateDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "animate"
);

describe("DocsCopyPage", () => {
  beforeEach(() => {
    Object.defineProperty(Element.prototype, "animate", {
      configurable: true,
      value: vi.fn().mockReturnValue({ cancel: vi.fn() }),
    });
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => markdown,
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (animateDescriptor) {
      Object.defineProperty(Element.prototype, "animate", animateDescriptor);
    } else {
      Reflect.deleteProperty(Element.prototype, "animate");
    }
  });

  it("copies preloaded markdown directly from the click", async () => {
    render(
      <DocsCopyPage
        markdownUrl="/llms.md/docs/components/select/content.md"
        url="/docs/components/select"
      />
    );

    const button = screen.getByRole("button", { name: /Copy Page/u });
    expect(button).toHaveProperty("disabled", true);

    await waitFor(() => expect(button).toHaveProperty("disabled", false));
    fireEvent.click(button);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(markdown));
  });

  it("opens the markdown and AI links with the current page", async () => {
    const markdownUrl =
      "http://localhost:3000/llms.md/docs/components/select/content.md";
    const pageUrl = "http://localhost:3000/docs/components/select";
    render(<DocsCopyPage markdownUrl={markdownUrl} url={pageUrl} />);

    await screen.findByRole("button", { name: /Copy Page/u });
    const buttons = screen.getAllByRole("button");
    fireEvent.pointerDown(buttons[1], { button: 0, ctrlKey: false });

    const markdownLink = await screen.findByRole("menuitem", {
      name: "View as Markdown",
    });
    expect(markdownLink).toHaveAttribute("href", markdownUrl);
    expect(markdownLink.tagName).toBe("A");

    const providers = [
      ["Open in Cursor", "text"],
      ["Open in ChatGPT", "q"],
      ["Open in Claude", "q"],
      ["Open in Perplexity", "q"],
      ["Open in Gemini", "prompt"],
      ["Open in Grok", "q"],
      ["Open in Scira AI", "q"],
    ];

    for (const [label, parameter] of providers) {
      const link = screen.getByRole("menuitem", { name: label });
      const destination = new URL(link.getAttribute("href") ?? "");
      expect(link.tagName).toBe("A");
      const prompt = destination.searchParams.get(parameter) ?? "";
      expect(prompt).toContain(`${fallbackSiteOrigin}/docs/components/select`);
      expect(prompt).toContain(
        `${fallbackSiteOrigin}/llms.md/docs/components/select/content.md`
      );
      expect(prompt).not.toContain("localhost");
    }

    expect(screen.queryByRole("menuitem", { name: /v0/i })).toBeNull();
  });
});
