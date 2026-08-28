"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, LogOut, RefreshCw, Trophy, User } from "lucide-react";
import ProjectsTab from "./ProjectsTab";
import SkillsTab from "./SkillsTab";
import CertificatesTab from "./CertificatesTab";
import { logoutAdmin } from "./actions";
import type { Database } from "@/lib/supabase/database.types";


export default function AdminDashboard() {
  // TODO: implement
  return null;
}
