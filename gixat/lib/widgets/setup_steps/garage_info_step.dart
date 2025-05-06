import 'package:flutter/material.dart';
import 'package:gixat/widgets/text_field.dart';
import 'package:get/get.dart';

class GarageInfoStep extends StatelessWidget {
  final TextEditingController nameController;
  final bool isDark;
  final Color titleTextColor;
  final Color subtitleTextColor;
  final Color accentColor;
  final List<String> steps;
  final RxInt currentStep;
  final VoidCallback onBack;
  final VoidCallback onNext;
  final bool isFormValid;
  final bool isLoading;

  const GarageInfoStep({
    super.key,
    required this.nameController,
    required this.isDark,
    required this.titleTextColor,
    required this.subtitleTextColor,
    required this.accentColor,
    required this.steps,
    required this.currentStep,
    required this.onBack,
    required this.onNext,
    required this.isFormValid,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Animated illustration
          Center(
            child: TweenAnimationBuilder<double>(
              duration: const Duration(milliseconds: 800),
              tween: Tween<double>(begin: 0.0, end: 1.0),
              curve: Curves.easeOutBack,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Container(
                    width: 120,
                    height: 120,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: accentColor.withAlpha(20),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Image.asset(
                      'assets/icons/garage_icon.png',
                      errorBuilder: (context, error, stackTrace) {
                        return Icon(
                          Icons.business_rounded,
                          size: 60,
                          color: accentColor,
                        );
                      },
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 32),

          // Title
          Center(
            child: Text(
              'Tell us about your garage',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: titleTextColor,
              ),
            ),
          ),

          const SizedBox(height: 8),

          // Subtitle
          Center(
            child: Text(
              'Let\'s set up your workspace to manage your automotive business',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: subtitleTextColor),
            ),
          ),

          const SizedBox(height: 36),

          // Garage name input with animation
          TweenAnimationBuilder<Offset>(
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOutCubic,
            tween: Tween<Offset>(begin: const Offset(0, 40), end: Offset.zero),
            builder: (context, offset, child) {
              return Transform.translate(
                offset: offset,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 600),
                  opacity: offset == Offset.zero ? 1.0 : 0.0,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'What\'s your garage name?',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: titleTextColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      GixatTextField(
                        controller: nameController,
                        labelText: 'Garage or Business Name',
                        hintText: 'Enter your garage name',
                        prefixIcon: Icon(
                          Icons.store_rounded,
                          color: accentColor,
                          size: 22,
                        ),
                        textInputAction: TextInputAction.next,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'This name will appear on invoices and customer communications.',
                        style: TextStyle(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                          color: subtitleTextColor,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 24),

          // Navigation buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: onBack,
                child: Row(
                  children: [
                    Icon(Icons.arrow_back_ios, size: 16),
                    const SizedBox(width: 4),
                    Text(currentStep.value > 0 ? 'Back' : 'Cancel'),
                  ],
                ),
              ),
              TextButton(
                onPressed: isFormValid && !isLoading ? onNext : null,
                child:
                    isLoading
                        ? SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2.2),
                        )
                        : Row(
                          children: [
                            Text(
                              currentStep.value == steps.length - 1
                                  ? 'Create'
                                  : 'Continue',
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              currentStep.value == steps.length - 1
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
    );
  }
}
