import 'package:flutter/material.dart';

class GarageSetupNavigationBar extends StatelessWidget {
  final List<String> steps;
  final int currentStep;
  final VoidCallback? onBack;
  final VoidCallback? onNext;
  final bool isFormValid;
  final bool isLoading;
  final bool isDark;
  final Color accentColor;
  final Color stepColor;
  final String? nextLabel;
  final String? backLabel;

  const GarageSetupNavigationBar({
    super.key,
    required this.steps,
    required this.currentStep,
    required this.onBack,
    required this.onNext,
    required this.isFormValid,
    required this.isLoading,
    required this.isDark,
    required this.accentColor,
    required this.stepColor,
    this.nextLabel,
    this.backLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 0, 0, 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Divider for separation
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 32),
            height: 2,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              gradient: LinearGradient(
                colors: [
                  accentColor.withAlpha(10),
                  Colors.transparent,
                  accentColor.withAlpha(10),
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: LinearGradient(
                colors:
                    isDark
                        ? [
                          Colors.black.withAlpha(115),
                          Colors.black.withAlpha(65),
                        ]
                        : [
                          Colors.white.withAlpha(215),
                          Colors.white.withAlpha(165),
                        ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color:
                      isDark
                          ? Colors.black.withAlpha(65)
                          : Colors.grey.withAlpha(10),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ],
              border: Border.all(
                color:
                    isDark
                        ? Colors.white.withAlpha(10)
                        : Colors.grey.withAlpha(10),
                width: 1.2,
              ),
              backgroundBlendMode: BlendMode.overlay,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Step dots
                _StepDots(
                  steps: steps,
                  currentStep: currentStep,
                  activeColor: accentColor,
                  inactiveColor: stepColor,
                ),
                const SizedBox(height: 16),
                // Navigation row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Back/Cancel button
                    TextButton(
                      onPressed: onBack,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        minimumSize: const Size(90, 44),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        foregroundColor:
                            isDark ? Colors.white70 : Colors.black54,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            currentStep > 0
                                ? Icons.arrow_back_ios
                                : Icons.close,
                            size: 16,
                            color: isDark ? Colors.white70 : Colors.black54,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            backLabel ?? (currentStep > 0 ? 'Back' : 'Cancel'),
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Continue/Create button
                    TextButton(
                      onPressed: (isFormValid && !isLoading) ? onNext : null,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        minimumSize: const Size(90, 44),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        backgroundColor:
                            isFormValid
                                ? accentColor.withAlpha(20)
                                : Colors.transparent,
                        foregroundColor:
                            isFormValid
                                ? accentColor
                                : accentColor.withAlpha(20),
                      ),
                      child:
                          isLoading
                              ? SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    accentColor,
                                  ),
                                ),
                              )
                              : Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    nextLabel ??
                                        (currentStep == steps.length - 1
                                            ? 'Create'
                                            : 'Continue'),
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Icon(
                                    currentStep == steps.length - 1
                                        ? Icons.check
                                        : Icons.arrow_forward_ios,
                                    size: 16,
                                  ),
                                ],
                              ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StepDots extends StatelessWidget {
  final List<String> steps;
  final int currentStep;
  final Color activeColor;
  final Color inactiveColor;

  const _StepDots({
    required this.steps,
    required this.currentStep,
    required this.activeColor,
    required this.inactiveColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(steps.length, (index) {
        final isActive = index == currentStep;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          margin: const EdgeInsets.symmetric(horizontal: 6),
          width: isActive ? 22 : 10,
          height: 10,
          decoration: BoxDecoration(
            color: isActive ? activeColor : inactiveColor,
            borderRadius: BorderRadius.circular(8),
            boxShadow:
                isActive
                    ? [
                      BoxShadow(
                        color: activeColor.withAlpha(20),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ]
                    : [],
          ),
        );
      }),
    );
  }
}
