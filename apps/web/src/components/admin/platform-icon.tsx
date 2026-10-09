"use client";

import {
  Facebook,
  Instagram,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  MessageSquare,
  Music2,
  QrCode,
  Send,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { SharePlatform } from "@relwick/shared";

const ICONS: Record<SharePlatform, LucideIcon> = {
  WHATSAPP: MessageCircle,
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  TIKTOK: Music2,
  LINKEDIN: Linkedin,
  X: Twitter,
  YOUTUBE: Youtube,
  TELEGRAM: Send,
  EMAIL: Mail,
  SMS: MessageSquare,
  QR: QrCode,
  OTHER: Link2,
};

export function PlatformIcon({ platform, size = 16 }: { platform: SharePlatform; size?: number }) {
  const Icon = ICONS[platform] ?? Link2;
  return <Icon size={size} strokeWidth={2} aria-hidden="true" />;
}
