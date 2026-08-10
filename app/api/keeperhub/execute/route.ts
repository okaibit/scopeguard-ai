import {
  DirectExecutor,
  KeeperHubClient,
} from "@keeperhub/sdk";

type KeeperHubResult = {
  executionId?: string;
  status?: string;
  transactionHash?: string;
  transactionLink?: string;
  txHash?: string;
  hash?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

const DEMO_SETTLEMENT_LIMIT = 3;

export async function POST(request: Request) {
  const apiKey = process.env.KEEPERHUB_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        success: false,
        error:
          "KEEPERHUB_API_KEY is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const body =
      await request.json().catch(() => ({}));

    /*
     * -------------------------------------------------------
     * REQUEST VALUES
     * -------------------------------------------------------
     */

    const requestedAmount = String(
      body.amount ?? ""
    ).trim();

    const currency = String(
      body.currency ?? "USDC"
    ).toUpperCase();

    const recipientAddress = String(
      body.recipientAddress ??
        process.env.KEEPERHUB_RECIPIENT_ADDRESS ??
        ""
    ).trim();

    const network = String(
      body.network ??
        process.env.KEEPERHUB_NETWORK ??
        "84532"
    ).trim();

    /*
     * page.tsx currently sends the execution request
     * without execute:true.
     *
     * Therefore:
     *
     * - execute:false = preview
     * - anything else = execute
     */
    const execute = body.execute !== false;

    /*
     * -------------------------------------------------------
     * VALIDATE AMOUNT
     * -------------------------------------------------------
     */

    if (!requestedAmount) {
      return Response.json(
        {
          success: false,
          error:
            "Settlement amount is required.",
        },
        { status: 400 }
      );
    }

    if (
      !/^\d+(\.\d+)?$/.test(
        requestedAmount
      ) ||
      Number(requestedAmount) <= 0
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Invalid settlement amount.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * DEMO SETTLEMENT SAFETY CAP
     * -------------------------------------------------------
     *
     * The current ScopeGuard demo is intended to
     * execute only a 3 USDC settlement.
     *
     * If page.tsx accidentally sends 150 USDC,
     * this route will reject it instead of attempting
     * a larger transfer.
     */

    const numericAmount =
      Number(requestedAmount);

    if (
      numericAmount >
      DEMO_SETTLEMENT_LIMIT
    ) {
      return Response.json(
        {
          success: false,
          error:
            `Demo settlement is limited to ${DEMO_SETTLEMENT_LIMIT} USDC. ` +
            `Received ${requestedAmount} USDC.`,
          requestedAmount,
          maximumDemoSettlement:
            DEMO_SETTLEMENT_LIMIT,
          onchainExecuted: false,
        },
        { status: 400 }
      );
    }

    /*
     * Normalize the amount sent to KeeperHub.
     */
    const amount =
      numericAmount ===
      Math.floor(numericAmount)
        ? String(numericAmount)
        : numericAmount.toFixed(6);

    /*
     * -------------------------------------------------------
     * VALIDATE CURRENCY
     * -------------------------------------------------------
     */

    if (currency !== "USDC") {
      return Response.json(
        {
          success: false,
          error:
            "Only USDC settlements are supported.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * VALIDATE RECIPIENT
     * -------------------------------------------------------
     */

    if (!recipientAddress) {
      return Response.json(
        {
          success: false,
          error:
            "Recipient address is required. Set KEEPERHUB_RECIPIENT_ADDRESS in .env.local.",
        },
        { status: 400 }
      );
    }

    if (
      !/^0x[a-fA-F0-9]{40}$/.test(
        recipientAddress
      )
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Invalid EVM recipient address.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * TOKEN ADDRESS
     * -------------------------------------------------------
     */

    const tokenAddress =
      process.env
        .BASE_SEPOLIA_USDC_ADDRESS;

    if (!tokenAddress) {
      return Response.json(
        {
          success: false,
          error:
            "BASE_SEPOLIA_USDC_ADDRESS is not configured.",
        },
        { status: 500 }
      );
    }

    if (
      !/^0x[a-fA-F0-9]{40}$/.test(
        tokenAddress
      )
    ) {
      return Response.json(
        {
          success: false,
          error:
            "BASE_SEPOLIA_USDC_ADDRESS is not a valid EVM address.",
        },
        { status: 500 }
      );
    }

    /*
     * -------------------------------------------------------
     * CREATE KEEPERHUB CLIENT
     * -------------------------------------------------------
     */

    const client =
      new KeeperHubClient({
        apiKey,
      });

    const executor =
      new DirectExecutor(client);

    /*
     * -------------------------------------------------------
     * PREVIEW MODE
     * -------------------------------------------------------
     */

    if (!execute) {
      return Response.json({
        success: true,
        mode: "preview",
        message:
          "Settlement prepared for KeeperHub execution.",
        settlement: {
          amount,
          currency,
          recipientAddress,
          network,
          tokenAddress,
        },
        keeperHubConfigured: true,
        onchainExecuted: false,
      });
    }

    /*
     * -------------------------------------------------------
     * EXECUTION LOG
     * -------------------------------------------------------
     */

    console.log(
      "----------------------------------------"
    );

    console.log(
      "ScopeGuard → KeeperHub"
    );

    console.log(
      "Amount:",
      amount,
      currency
    );

    console.log(
      "Recipient:",
      recipientAddress
    );

    console.log(
      "Network:",
      network
    );

    console.log(
      "Token:",
      tokenAddress
    );

    console.log(
      "Executing blockchain transfer..."
    );

    /*
     * -------------------------------------------------------
     * ACTUAL KEEPERHUB EXECUTION
     * -------------------------------------------------------
     */

    const result =
      (await executor.transfer({
        network,
        recipientAddress,
        amount,
        tokenAddress,
      })) as KeeperHubResult;

    /*
     * -------------------------------------------------------
     * LOG COMPLETE KEEPERHUB RESPONSE
     * -------------------------------------------------------
     */

    console.log(
      "KeeperHub execution result:"
    );

    console.log(
      JSON.stringify(
        result,
        null,
        2
      )
    );

    console.log(
      "----------------------------------------"
    );

    /*
     * -------------------------------------------------------
     * NORMALIZE TRANSACTION PROOF
     * -------------------------------------------------------
     */

    const transactionHash =
      result?.transactionHash ??
      result?.txHash ??
      result?.hash ??
      undefined;

    const transactionLink =
      result?.transactionLink ??
      (
        transactionHash
          ? `https://sepolia.basescan.org/tx/${transactionHash}`
          : undefined
      );

    const normalizedStatus =
      String(
        result?.status ?? ""
      ).toLowerCase();

    /*
     * -------------------------------------------------------
     * SUCCESS STATUSES
     * -------------------------------------------------------
     */

    const successfulStatuses = [
      "completed",
      "complete",
      "success",
      "succeeded",
      "successful",
      "confirmed",
      "executed",
      "submitted",
      "pending",
    ];

    const hasTransactionProof =
      Boolean(
        transactionHash ||
          transactionLink
      );

    const executionSucceeded =
      successfulStatuses.includes(
        normalizedStatus
      ) ||
      hasTransactionProof;

    /*
     * -------------------------------------------------------
     * KEEPERHUB DID NOT CONFIRM
     * -------------------------------------------------------
     */

    if (!executionSucceeded) {
      return Response.json(
        {
          success: false,
          mode: "execute",
          message:
            "KeeperHub did not confirm execution.",

          error:
            result?.error ??
            result?.message ??
            "KeeperHub returned no recognized success status or transaction hash.",

          settlement: {
            amount,
            currency,
            recipientAddress,
            network,
            tokenAddress,
          },

          keeperHub: result,

          rawKeeperHubResult:
            result,

          onchainExecuted: false,
        },
        { status: 502 }
      );
    }

    /*
     * -------------------------------------------------------
     * SUCCESS
     * -------------------------------------------------------
     */

    return Response.json({
      success: true,

      mode: "execute",

      message:
        "KeeperHub execution completed successfully.",

      settlement: {
        amount,
        currency,
        recipientAddress,
        network,
        tokenAddress,
      },

      keeperHub: {
        ...result,
        transactionHash,
        transactionLink,
      },

      executionProof: {
        transactionHash,
        transactionLink,

        status:
          normalizedStatus ||
          "completed",

        amount,

        currency,

        network:
          network === "84532"
            ? "Base Sepolia"
            : network,
      },

      onchainExecuted: true,

      transactionHash,

      transactionLink,
    });
  } catch (error) {
    /*
     * -------------------------------------------------------
     * ERROR HANDLING
     * -------------------------------------------------------
     */

    console.error(
      "----------------------------------------"
    );

    console.error(
      "KeeperHub execution error:"
    );

    console.error(error);

    console.error(
      "----------------------------------------"
    );

    return Response.json(
      {
        success: false,

        mode: "execute",

        message:
          "KeeperHub execution failed.",

        error:
          error instanceof Error
            ? error.message
            : "KeeperHub execution failed.",

        errorDetails:
          error instanceof Error
            ? {
                name: error.name,
                message:
                  error.message,
              }
            : error,

        onchainExecuted: false,
      },
      { status: 500 }
    );
  }
}
