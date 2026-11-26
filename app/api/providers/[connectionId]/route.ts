import { NextResponse } from "next/server";
import {
  ProviderAuthenticationRequiredError,
  ProviderConnectionNotFoundError,
  createProviderConnectionService,
} from "@/lib/db/provider-connections";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  try {
    const service = await createProviderConnectionService();
    await service.disconnect((await params).connectionId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ProviderAuthenticationRequiredError) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Sign in required." } },
        { status: 401 },
      );
    }
    if (error instanceof ProviderConnectionNotFoundError) {
      return NextResponse.json(
        {
          error: {
            code: "CONNECTION_NOT_FOUND",
            message: "Connection not found.",
          },
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_ERROR",
          message: "Could not disconnect provider.",
        },
      },
      { status: 500 },
    );
  }
}
