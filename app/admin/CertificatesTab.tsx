"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { createCertificate, deleteCertificate, updateCertificate } from "./actions";
import { ColorInput, Field } from "./ProjectsTab";
import ImageUploadField from "./ImageUploadField";
import type { Database } from "@/lib/supabase/database.types";


export default function CertificatesTab() {
  // TODO: implement
  return null;
}
