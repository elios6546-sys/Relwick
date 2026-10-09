// Relwick v2 — thème Flutter
// pubspec.yaml : google_fonts (Instrument Sans et JetBrains Mono sont sur Google Fonts).
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class RelwickLight {
  static const bg = Color(0xFFF9F6F1);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceSunken = Color(0xFFF1ECE4);
  static const line = Color(0xFFE6E0D7);
  static const lineStrong = Color(0xFF8F8A80);
  static const text = Color(0xFF0D111E);
  static const textMuted = Color(0xFF535766);
  static const primary = Color(0xFF483EFE);
  static const primaryHover = Color(0xFF3A30D3);
  static const onPrimary = Color(0xFFFFFFFF);
  static const link = Color(0xFF483EFE);
  static const primarySoft = Color(0xFFE3E6FF);
  static const primarySoftText = Color(0xFF3A30D3);
  static const copper = Color(0xFFC6782E);
  static const copperText = Color(0xFF894C06);
  static const copperSoft = Color(0xFFF8E8DB);
  static const success = Color(0xFF00654B);
  static const successSoft = Color(0xFFD3F0E3);
  static const warning = Color(0xFF816002);
  static const warningSoft = Color(0xFFFBE9C6);
  static const danger = Color(0xFFC9222B);
  static const dangerSoft = Color(0xFFFDE9E7);
  static const focus = Color(0xFF483EFE);
  static const logoIndigo = Color(0xFF483EFE);
  static const logoCopper = Color(0xFFC6782E);
}

class RelwickDark {
  static const bg = Color(0xFF0D111E);
  static const surface = Color(0xFF151926);
  static const surfaceSunken = Color(0xFF080A16);
  static const line = Color(0xFF262B3A);
  static const lineStrong = Color(0xFF707482);
  static const text = Color(0xFFF9F6F1);
  static const textMuted = Color(0xFF9498A5);
  static const primary = Color(0xFF5250FE);
  static const primaryHover = Color(0xFF483EFE);
  static const onPrimary = Color(0xFFFFFFFF);
  static const link = Color(0xFF8D90FF);
  static const primarySoft = Color(0xFF1E1B6C);
  static const primarySoftText = Color(0xFFADB3FF);
  static const copper = Color(0xFFDC9659);
  static const copperText = Color(0xFFEAB489);
  static const copperSoft = Color(0xFF2E1602);
  static const success = Color(0xFF46B591);
  static const successSoft = Color(0xFF003525);
  static const warning = Color(0xFFE0AB22);
  static const warningSoft = Color(0xFF493400);
  static const danger = Color(0xFFF2716A);
  static const dangerSoft = Color(0xFF590A0E);
  static const focus = Color(0xFF8D90FF);
  static const logoIndigo = Color(0xFF6E6AFF);
  static const logoCopper = Color(0xFFDC9659);
}

ThemeData relwickTheme(Brightness b) {
  final dark = b == Brightness.dark;
  final scheme = ColorScheme(
    brightness: b,
    primary: dark ? RelwickDark.primary : RelwickLight.primary,
    onPrimary: Colors.white,
    secondary: dark ? RelwickDark.copper : RelwickLight.copper,
    onSecondary: dark ? RelwickDark.bg : Colors.white,
    error: dark ? RelwickDark.danger : RelwickLight.danger,
    onError: dark ? RelwickDark.bg : Colors.white,
    surface: dark ? RelwickDark.surface : RelwickLight.surface,
    onSurface: dark ? RelwickDark.text : RelwickLight.text,
    onSurfaceVariant: dark ? RelwickDark.textMuted : RelwickLight.textMuted,
    outline: dark ? RelwickDark.lineStrong : RelwickLight.lineStrong,
    outlineVariant: dark ? RelwickDark.line : RelwickLight.line,
  );
  final base = ThemeData(useMaterial3: true, colorScheme: scheme,
      scaffoldBackgroundColor: dark ? RelwickDark.bg : RelwickLight.bg);
  return base.copyWith(
    textTheme: GoogleFonts.instrumentSansTextTheme(base.textTheme),
    filledButtonTheme: FilledButtonThemeData(style: FilledButton.styleFrom(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
      textStyle: GoogleFonts.instrumentSans(fontWeight: FontWeight.w500, fontSize: 14))),
    cardTheme: CardThemeData(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
  );
}
