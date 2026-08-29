import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const CONTACT_RECEIVER = process.env.CONTACT_RECEIVER_EMAIL || "satish.21.buv@gmail.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, purpose, phone, email, message } = body as Record<string, unknown>;

  if (
    typeof name !== "string" || !name.trim() || /\d/.test(name) ||
    typeof purpose !== "string" || !purpose.trim() ||
    typeof phone !== "string" || !/^[0-9+()\-\s]+$/.test(phone.trim()) ||
    typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) ||
    typeof message !== "string" || !message.trim()
  ) {
    return NextResponse.json({ error: "Please fill in every field with a valid value." }, { status: 422 });
  }

  let emailSent = false;
  let savedToDb = false;

  // Send the notification email first so we know whether to record
  // email_sent alongside the durable copy below.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_SENDER_EMAIL || "Cricket Portfolio <onboarding@resend.dev>",
        to: CONTACT_RECEIVER,
        replyTo: email,
        subject: `Press Box: ${purpose} — from ${name}`,
        text: `Name: ${name}\nPurpose: ${purpose}\nPhone: ${phone}\nEmail: ${email}\n\nQuestion:\n${message}`,
      });
      if (error) {
        console.error("[contact] Resend error:", error);
      } else {
        emailSent = true;
      }
    } catch (err) {
      console.error("[contact] Failed to send email:", err);
    }
  }

  // Always keep a durable copy in Supabase, independent of email delivery —
  // so a submission is never silently lost if Resend isn't configured or a
  // send fails.
  if (isSupabaseAdminConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase.from("messages").insert({
        name,
        purpose,
        phone,
        email,
        question: message,
        email_sent: emailSent,
      });
      if (error) {
        console.error("[contact] Supabase insert error:", error);
      } else {
        savedToDb = true;
      }
    } catch (err) {
      console.error("[contact] Failed to save message:", err);
    }
  }

  if (!emailSent && !savedToDb) {
    return NextResponse.json(
      { error: "Couldn't deliver your message right now. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
