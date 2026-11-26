import { NextResponse } from "next/server";
import {
  ProviderAuthenticationRequiredError,
  createProviderConnectionService,
} from "@/lib/db/provider-connections";

export async function GET() {
  try {
    const service = await createProviderConnectionService();
    return NextResponse.json({ connections: await service.list() });
  } catch (error) {
    if (error instanceof ProviderAuthenticationRequiredError) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Sign in required." } },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        error: {
          code: "PROVIDER_ERROR",
          message: "Could not load provider connections.",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const service = await createProviderConnectionService();
    const connection = await service.connect((await request.json()) as unknown);
    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    if (error instanceof ProviderAuthenticationRequiredError) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Sign in required." } },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Provide a valid Gemini API key and label.",
        },
      },
      { status: 400 },
    );
  }
}
