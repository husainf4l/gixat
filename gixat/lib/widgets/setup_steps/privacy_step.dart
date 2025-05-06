import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:get/get.dart';

class PrivacyStep extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController streetController;
  final TextEditingController phoneController;
  final TextEditingController emailController;
  final String selectedCountry;
  final String selectedCity;
  final bool privacyAccepted;
  final Function(bool?) onPrivacyChanged;
  final bool isDark;
  final Color titleTextColor;
  final Color subtitleTextColor;
  final Color accentColor;
  final VoidCallback onBack;
  final VoidCallback onNext;
  final bool isFormValid;
  final bool isLoading;

  const PrivacyStep({
    super.key,
    required this.nameController,
    required this.streetController,
    required this.phoneController,
    required this.emailController,
    required this.selectedCountry,
    required this.selectedCity,
    required this.privacyAccepted,
    required this.onPrivacyChanged,
    required this.isDark,
    required this.titleTextColor,
    required this.subtitleTextColor,
    required this.accentColor,
    required this.onBack,
    required this.onNext,
    required this.isFormValid,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    // Create gesture recognizers for the links
    final termsRecognizer =
        TapGestureRecognizer()..onTap = () => Get.toNamed('/legal/terms');
    final privacyRecognizer =
        TapGestureRecognizer()..onTap = () => Get.toNamed('/legal/privacy');

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Animated checkmark icon
          Center(
            child: TweenAnimationBuilder<double>(
              duration: const Duration(milliseconds: 600),
              tween: Tween<double>(begin: 0.0, end: 1.0),
              curve: Curves.elasticOut,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: accentColor.withAlpha(20),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.check_circle_outline_rounded,
                      size: 60,
                      color: accentColor,
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
              'Almost there!',
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
              'Review your information and accept the terms to create your garage',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: subtitleTextColor),
            ),
          ),

          const SizedBox(height: 32),

          // Summary card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withAlpha(20) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow:
                  isDark
                      ? []
                      : [
                        BoxShadow(
                          color: Colors.black.withAlpha(20),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
            ),
            child: _buildSummarySection(
              titleTextColor,
              subtitleTextColor,
              accentColor,
            ),
          ),

          const SizedBox(height: 24),

          // Terms and Privacy
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: isDark ? Colors.white.withAlpha(20) : Colors.grey.shade50,
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Privacy checkbox with improved styling
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Transform.scale(
                      scale: 1.1,
                      child: Checkbox(
                        value: privacyAccepted,
                        onChanged: onPrivacyChanged,
                        activeColor: accentColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        visualDensity: VisualDensity.compact,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => onPrivacyChanged(!privacyAccepted),
                        child: RichText(
                          text: TextSpan(
                            style: TextStyle(
                              color: subtitleTextColor,
                              fontSize: 14,
                              height: 1.5,
                            ),
                            children: [
                              const TextSpan(text: 'I agree to the '),
                              TextSpan(
                                text: 'Terms of Service',
                                style: TextStyle(
                                  color: accentColor,
                                  decoration: TextDecoration.underline,
                                  fontWeight: FontWeight.w500,
                                ),
                                recognizer: termsRecognizer,
                              ),
                              const TextSpan(text: ' and '),
                              TextSpan(
                                text: 'Privacy Policy',
                                style: TextStyle(
                                  color: accentColor,
                                  decoration: TextDecoration.underline,
                                  fontWeight: FontWeight.w500,
                                ),
                                recognizer: privacyRecognizer,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Data processing notice
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.info_outline_rounded,
                      color: accentColor.withAlpha(20),
                      size: 18,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Your data will be securely stored and processed in accordance with our privacy policy.',
                        style: TextStyle(
                          fontSize: 12,
                          color: subtitleTextColor,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
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
                    Text('Back'),
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
                            Text('Create'),
                            const SizedBox(width: 4),
                            Icon(Icons.check, size: 16),
                          ],
                        ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummarySection(
    Color titleTextColor,
    Color subtitleTextColor,
    Color accentColor,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Summary',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: titleTextColor,
          ),
        ),

        const SizedBox(height: 16),

        // Garage name
        Row(
          children: [
            Icon(Icons.store_rounded, size: 20, color: accentColor),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Garage Name',
                    style: TextStyle(fontSize: 12, color: subtitleTextColor),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    nameController.text.isNotEmpty
                        ? nameController.text
                        : 'Not provided',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: titleTextColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Location
        Row(
          children: [
            Icon(Icons.location_on_rounded, size: 20, color: accentColor),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Location',
                    style: TextStyle(fontSize: 12, color: subtitleTextColor),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    streetController.text.isNotEmpty
                        ? '${streetController.text}, $selectedCity, $selectedCountry'
                        : 'Not provided',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: titleTextColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // Contact info
        Row(
          children: [
            Icon(Icons.phone_rounded, size: 20, color: accentColor),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Contact',
                    style: TextStyle(fontSize: 12, color: subtitleTextColor),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    phoneController.text.isNotEmpty
                        ? phoneController.text
                        : 'Not provided',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: titleTextColor,
                    ),
                  ),
                  if (emailController.text.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        emailController.text,
                        style: TextStyle(
                          fontSize: 14,
                          color: subtitleTextColor,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
