import 'package:flutter/material.dart';
import 'package:gixat/widgets/setup_steps/address_input.dart';

class LocationStep extends StatelessWidget {
  final TextEditingController streetController;
  final TextEditingController phoneController;
  final Function(String) onCountryChanged;
  final Function(String) onCityChanged;
  final bool isDark;
  final Color titleTextColor;
  final Color subtitleTextColor;
  final Color accentColor;
  final VoidCallback onBack;
  final VoidCallback onNext;
  final bool isFormValid;
  final bool isLoading;

  const LocationStep({
    super.key,
    required this.streetController,
    required this.phoneController,
    required this.onCountryChanged,
    required this.onCityChanged,
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
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Text(
            'Where are you located?',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: titleTextColor,
            ),
          ),

          const SizedBox(height: 8),

          // Subtitle
          Text(
            'Enter your garage\'s address so customers can find you',
            style: TextStyle(fontSize: 14, color: subtitleTextColor),
          ),

          const SizedBox(height: 32),

          // Enhanced Address Input
          Container(
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withAlpha(50) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow:
                  isDark
                      ? []
                      : [
                        BoxShadow(
                          color: Colors.black.withAlpha(50),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                AddressInput(
                  streetController: streetController,
                  phoneController: phoneController,
                  onCountryChanged: onCountryChanged,
                  onCityChanged: onCityChanged,
                  onPhoneChanged: (_) {}, // We handle phone separately
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
                            Text('Continue'),
                            const SizedBox(width: 4),
                            Icon(Icons.arrow_forward_ios, size: 16),
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
