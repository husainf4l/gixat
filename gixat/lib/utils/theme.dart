import 'package:flutter/material.dart';

/// Centralized color palette
class AppColors {
  static const primary = Color(0xFF1B75BB);
  static const secondary = Color(0xFFFFC31C);
  static const surfaceLight = Colors.white;
  static const surfaceDark = Color(0xFF1E1E1E);
  static const scaffoldLight = Color(0xFFF9F9F9);
  static const scaffoldDark = Color(0xFF121212);
  static const onPrimary = Colors.white;
  static const onSecondary = Colors.black;
  static const error = Colors.redAccent;
}

/// Shared text styles
class AppTextStyles {
  static const displayLarge = TextStyle(
    fontSize: 36,
    fontWeight: FontWeight.bold,
  );
  static const bodyLarge = TextStyle(fontSize: 16);
  static const labelSmall = TextStyle(fontSize: 12, letterSpacing: 0.5);
}

/// Shared elevated button style
final elevatedButtonStyle = ElevatedButton.styleFrom(
  backgroundColor: AppColors.primary,
  foregroundColor: AppColors.onPrimary,
  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
);

/// Shared input decoration theme generator
InputDecorationTheme inputDecorationTheme(Color color) {
  return InputDecorationTheme(
    filled: true,
    fillColor: color.withAlpha(30),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: BorderSide(color: color.withAlpha(30)),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
      borderSide: BorderSide(color: color, width: 2),
    ),
    labelStyle: TextStyle(color: color),
  );
}

/// Light Theme
final ThemeData lightTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.light,
  scaffoldBackgroundColor: AppColors.surfaceLight,
  colorScheme: const ColorScheme.light(
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    surface: AppColors.surfaceLight,
    onPrimary: AppColors.onPrimary,
    onSecondary: AppColors.onSecondary,
    error: AppColors.error,
  ),

  elevatedButtonTheme: ElevatedButtonThemeData(style: elevatedButtonStyle),
  floatingActionButtonTheme: const FloatingActionButtonThemeData(
    backgroundColor: AppColors.secondary,
    foregroundColor: AppColors.onSecondary,
  ),
  textTheme: TextTheme(
    displayLarge: AppTextStyles.displayLarge.copyWith(color: AppColors.primary),
    bodyLarge: AppTextStyles.bodyLarge.copyWith(color: Colors.grey[800]),
    labelSmall: AppTextStyles.labelSmall.copyWith(color: Colors.grey[600]),
  ),
  inputDecorationTheme: inputDecorationTheme(AppColors.primary),
);

/// Dark Theme
final ThemeData darkTheme = ThemeData(
  useMaterial3: true,
  brightness: Brightness.dark,
  scaffoldBackgroundColor: AppColors.scaffoldDark,
  colorScheme: const ColorScheme.dark(
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    surface: AppColors.surfaceDark,
    onPrimary: AppColors.onPrimary,
    onSecondary: AppColors.onSecondary,
    error: AppColors.error,
  ),

  elevatedButtonTheme: ElevatedButtonThemeData(style: elevatedButtonStyle),
  floatingActionButtonTheme: const FloatingActionButtonThemeData(
    backgroundColor: AppColors.secondary,
    foregroundColor: AppColors.onSecondary,
  ),
  textTheme: TextTheme(
    displayLarge: AppTextStyles.displayLarge.copyWith(
      color: AppColors.secondary,
    ),
    bodyLarge: AppTextStyles.bodyLarge.copyWith(color: Colors.grey[300]),
    labelSmall: AppTextStyles.labelSmall.copyWith(color: Colors.grey[500]),
  ),
  inputDecorationTheme: inputDecorationTheme(AppColors.secondary),
);
