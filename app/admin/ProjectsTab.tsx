"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { createProject, deleteProject, updateProject } from "./actions";
import ImageUploadField from "./ImageUploadField";
import type { Database } from "@/lib/supabase/database.types";


export default function ProjectsTab() {
  // TODO: implement
  return null;
}
