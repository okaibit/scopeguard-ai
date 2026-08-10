type ScopeAnalysisRequest = {
  sow: string;
  prTitle: string;
  prChanges: string;
  hourlyRate?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScopeAnalysisRequest;

    const {
      sow,
      prTitle,
      prChanges,
      hourlyRate = 50,
    } = body;

    if (!sow || !prTitle || !prChanges) {
      return Response.json(
        {
          error:
            "sow, prTitle and prChanges are required",
        },
        { status: 400 }
      );
    }

    const normalizedSow = sow.toLowerCase();
    const normalizedChanges = prChanges.toLowerCase();

    const scopeKeywords = [
      "pdf",
      "export",
      "csv",
      "report",
      "analytics",
      "authentication",
      "payment",
      "notification",
      "email",
      "upload",
      "download",
      "search",
      "integration",
      "api",
      "dashboard",
    ];

    const detectedKeywords = scopeKeywords.filter((keyword) =>
      normalizedChanges.includes(keyword)
    );

    const mentionedInSow = detectedKeywords.filter((keyword) =>
      normalizedSow.includes(keyword)
    );

    const newKeywords = detectedKeywords.filter(
      (keyword) => !normalizedSow.includes(keyword)
    );

    const isOutOfScope = newKeywords.length > 0;

    const estimatedHours = isOutOfScope
      ? Math.max(1, Math.min(8, newKeywords.length * 1.5))
      : 0;

    const settlement = Math.round(
      estimatedHours * hourlyRate
    );

    const confidence = isOutOfScope
      ? Math.min(
          97,
          78 + newKeywords.length * 4
        )
      : 91;

    const reasoning = isOutOfScope
      ? `The PR introduces functionality that is not explicitly represented in the original SOW. Detected additions: ${newKeywords.join(
          ", "
        )}.`
      : "The detected PR changes appear consistent with the functionality described in the original SOW.";

    return Response.json({
      success: true,
      analysis: {
        decision: isOutOfScope
          ? "Settlement required"
          : "Within scope",

        scopeStatus: isOutOfScope
          ? "out_of_scope"
          : "within_scope",

        confidence,

        detectedChanges: detectedKeywords,

        newScopeItems: newKeywords,

        existingScopeItems: mentionedInSow,

        estimatedHours,

        hourlyRate,

        settlement,

        currency: "USDC",

        reasoning,

        recommendation: isOutOfScope
          ? `Approve a ${settlement} USDC settlement for the additional work.`
          : "No additional settlement is recommended.",
      },
    });
  } catch {
    return Response.json(
      {
        error: "Invalid request body",
      },
      { status: 400 }
    );
  }
}
