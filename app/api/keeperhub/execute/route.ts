import { DirectExecutor, KeeperHubClient } from "@keeperhub/sdk";
type KeeperHubResult = {
  executionId?: string;
  status?: string;
  transactionHash?: string;
  transactionLink?: string;
  error?: string;
  [key: string]: unknown;
};
export async function POST(request: Request) {
  const apiKey = process.env.KEEPERHUB_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        success: false,
        error: "KeeperHub API key is not configured",
      },
      { status: 500 }
    );
  }
  try {
    const body = await request.json().catch(() => ({}));
    const amount = String(body.amount ?? "5");
    const recipientAddress = String(
      body.recipientAddress ?? ""
    );
    const network = String(body.network ?? "84532");
    // Actual blockchain execution must be explicitly requested.
    const execute = body.execute === true;
    if (!recipientAddress) {
      return Response.json(
        {
          success: false,
          error: "Recipient address is required",
        },
        { status: 400 }
      );
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      return Response.json(
        {
          success: false,
          error: "Invalid EVM recipient address",
        },
        { status: 400 }
      );
    }
    if (
      !/^\d+(\.\d+)?$/.test(amount) ||
      Number(amount) <= 0
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid settlement amount",
        },
        { status: 400 }
      );
    }
    const client = new KeeperHubClient({
      apiKey,
    });
    const executor = new DirectExecutor(client);
    // Preview mode.
    // This confirms that ScopeGuard is configured to communicate
    // with KeeperHub without broadcasting a transaction.
    if (!execute) {
      return Response.json({
        success: true,
        mode: "preview",
        message:
          "Settlement prepared for KeeperHub execution",
        settlement: {
          amount,
          recipientAddress,
          network,
        },
        keeperHubConfigured: true,
        onchainExecuted: false,
      });
    }
    const tokenAddress =
      process.env.BASE_SEPOLIA_USDC_ADDRESS;
    if (!tokenAddress) {
      return Response.json(
        {
          success: false,
          error:
            "BASE_SEPOLIA_USDC_ADDRESS is not configured",
        },
        { status: 500 }
      );
    }
    const result =
      (await executor.transfer({
        network,
        recipientAddress,
        amount,
        tokenAddress,
      })) as KeeperHubResult;
    console.log(
      "KeeperHub execution result:",
      JSON.stringify(result, null, 2)
    );
    /*
     * KeeperHub can report a successful blockchain execution
     * with the status "completed".
     *
     * Some integrations may also return "success".
     *
     * We therefore treat both statuses as successful.
     */
    const successfulStatuses = [
      "completed",
      "success",
      "succeeded",
      "confirmed",
    ];
    const normalizedStatus =
      String(result?.status ?? "").toLowerCase();
    const executionSucceeded =
      successfulStatuses.includes(normalizedStatus) ||
      Boolean(result?.transactionHash);
    if (!executionSucceeded) {
      return Response.json(
        {
          success: false,
          mode: "execute",
          message: "KeeperHub execution failed",
          settlement: {
            amount,
            recipientAddress,
            network,
          },
          keeperHub: result,
          onchainExecuted: false,
        },
        { status: 502 }
      );
    }
    /*
     * A transaction hash is the strongest proof that a
     * blockchain transaction was actually submitted.
     */
    const transactionHash =
      result?.transactionHash;
    const transactionLink =
      result?.transactionLink ||
      (transactionHash
        ? `https://sepolia.basescan.org/tx/${transactionHash}`
        : undefined);
    return Response.json({
      success: true,
      mode: "execute",
      message:
        "KeeperHub execution completed successfully",
      settlement: {
        amount,
        recipientAddress,
        network,
      },
      keeperHub: {
        ...result,
        transactionHash,
        transactionLink,
      },
      onchainExecuted: true,
      transactionHash,
      transactionLink,
    });
  } catch (error) {
    console.error(
      "KeeperHub execution error:",
      error
    );
    return Response.json(
      {
        success: false,
        mode: "execute",
        message: "KeeperHub execution failed",
        error:
          error instanceof Error
            ? error.message
            : "KeeperHub execution failed",
        onchainExecuted: false,
      },
      { status: 500 }
    );
  }
}
