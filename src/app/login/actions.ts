"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loginSchema, signupSchema } from "@/lib/validations";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();

  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    orgName: formData.get("orgName"),
    orgDomain: formData.get("orgDomain"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    // Use service role client to bypass RLS — user has no session cookie yet at this point
    const serviceClient = createServiceClient();
    const { error: profileError } = await serviceClient.from("issuers").insert({
      id: authData.user.id,
      org_name: parsed.data.orgName,
      org_domain: parsed.data.orgDomain.toLowerCase(),
    });

    if (profileError) {
      console.error("Issuer insert error:", profileError);
      return { error: `Profile setup failed: ${profileError.message}` };
    }
  }

  redirect("/dashboard");
}
