// types/next.d.ts
import { NextRequest } from "next/server";

declare module "next/server" {
  interface NextRequest {
    userId?: number; // Add userId as an optional property
  }
}
