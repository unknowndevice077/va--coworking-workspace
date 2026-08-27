"use server";

import { redirect } from "next/navigation";
import { destroyClientSession } from "@/lib/client-auth";

export async function clientLogoutAction() {
  await destroyClientSession();
  redirect("/client/login");
}
