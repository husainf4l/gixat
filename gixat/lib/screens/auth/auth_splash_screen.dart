import 'package:flutter/material.dart';
import 'dart:ui';

class AuthSplashScreen extends StatelessWidget {
  const AuthSplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor =
        isDark ? const Color(0xFF101014) : const Color(0xFFF7F8FA);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: [
          // Background gradient
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors:
                      isDark
                          ? [const Color(0xFF23243A), const Color(0xFF101014)]
                          : [const Color(0xFFE8ECF7), const Color(0xFFF7F8FA)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
          ),

          // Blur effect
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
              child: Container(color: Colors.transparent),
            ),
          ),

          // Content
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // App logo
                Image.asset(
                  isDark
                      ? 'assets/logos/gixatd.png'
                      : 'assets/logos/gixatl.png',
                  width: 120,
                  height: 120,
                ),
                const SizedBox(height: 24),

                // Loading indicator
                const CircularProgressIndicator(color: Color(0xFF1B75BB)),

                const SizedBox(height: 32),

                // Loading text
                Text(
                  'Signing in...',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color:
                        isDark
                            ? Colors.white.withAlpha(50)
                            : const Color(0xFF1A1A2E),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
