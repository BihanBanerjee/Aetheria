// src/app/api/inngest/route.ts - Add error handling
import { serve } from "inngest/next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    console.log("=== Inngest GET request ===");
    console.log("Environment check:", {
      hasEventKey: !!process.env.INNGEST_EVENT_KEY,
      hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
      eventKeyPrefix: process.env.INNGEST_EVENT_KEY?.substring(0, 20),
      signingKeyPrefix: process.env.INNGEST_SIGNING_KEY?.substring(0, 20),
    });

    // Import dynamically to catch import errors
    const { Inngest } = await import("inngest");
    
    const inngest = new Inngest({ 
      id: "aetheria",
      name: "Aetheria Project Processing",
      eventKey: process.env.INNGEST_EVENT_KEY,
    });

    console.log("Inngest client created:", inngest.id);

    // Create a simple test function
    const testFunction = inngest.createFunction(
      { 
        id: "aetheria-test-function",
        name: "Test Function"
      },
      { event: "test.event" },
      async ({ event }) => {
        console.log("Test function executed");
        return { success: true };
      }
    );

    console.log("Function created:", testFunction);

    const handler = serve({
      client: inngest,
      functions: [testFunction],
      streaming: false,
    });

    console.log("Handler created successfully");
    return handler.GET(request);
  } catch (error) {
    console.error("=== Inngest endpoint error ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    
    return NextResponse.json({
      error: "Inngest endpoint failed",
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { Inngest } = await import("inngest");
    const inngest = new Inngest({ 
      id: "aetheria",
      name: "Aetheria Project Processing",
      eventKey: process.env.INNGEST_EVENT_KEY,
    });

    const testFunction = inngest.createFunction(
      { 
        id: "aetheria-test-function",
        name: "Test Function"
      },
      { event: "test.event" },
      async ({ event }) => {
        return { success: true };
      }
    );

    const handler = serve({
      client: inngest,
      functions: [testFunction],
      streaming: false,
    });

    return handler.POST(request);
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { Inngest } = await import("inngest");
    const inngest = new Inngest({ 
      id: "aetheria",
      name: "Aetheria Project Processing", 
      eventKey: process.env.INNGEST_EVENT_KEY,
    });

    const testFunction = inngest.createFunction(
      { 
        id: "aetheria-test-function",
        name: "Test Function"
      },
      { event: "test.event" },
      async ({ event }) => {
        return { success: true };
      }
    );

    const handler = serve({
      client: inngest,
      functions: [testFunction],
      streaming: false,
    });

    return handler.PUT(request);
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}