import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:gixat/controllers/auth_controller.dart';
import 'package:gixat/widgets/setup_steps/garage_info_step.dart';
import 'package:gixat/widgets/setup_steps/location_step.dart';
import 'package:gixat/widgets/setup_steps/privacy_step.dart';
import 'package:gixat/models/garage.dart';

class GarageSetupScreen extends StatefulWidget {
  const GarageSetupScreen({super.key});

  @override
  GarageSetupScreenState createState() => GarageSetupScreenState();
}

class GarageSetupScreenState extends State<GarageSetupScreen>
    with SingleTickerProviderStateMixin {
  final nameController = TextEditingController();
  final streetController = TextEditingController();
  final phoneController = TextEditingController();
  final emailController = TextEditingController();
  final authController = Get.find<AuthController>();
  late AnimationController _animationController;
  bool _privacyAccepted = false;
  final _isFormValid = false.obs;
  final _currentStep = 0.obs;
  final PageController _pageController = PageController();

  // Store country and city selections
  String selectedCountry = '';
  String selectedCity = '';

  // Setup steps
  final List<String> _setupSteps = ['Garage Info', 'Location', 'Finish'];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    // Start the animation
    _animationController.forward();

    // Add listeners to text controllers to validate input
    nameController.addListener(_validateStep);
    streetController.addListener(_validateStep);
    phoneController.addListener(_validateStep);
    emailController.addListener(_validateStep);
  }

  @override
  void dispose() {
    _animationController.dispose();
    nameController.dispose();
    streetController.dispose();
    phoneController.dispose();
    emailController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _validateStep() {
    switch (_currentStep.value) {
      case 0:
        _isFormValid.value = nameController.text.trim().isNotEmpty;
        break;
      case 1:
        _isFormValid.value =
            streetController.text.trim().isNotEmpty &&
            selectedCountry.isNotEmpty &&
            selectedCity.isNotEmpty;
        break;
      case 2:
        _isFormValid.value = phoneController.text.trim().isNotEmpty;
        break;
      case 3:
        _isFormValid.value = _privacyAccepted;
        break;
      default:
        _isFormValid.value = false;
    }
  }

  void _nextStep() {
    if (_currentStep.value < 2) {
      _currentStep.value++;
      _pageController.animateToPage(
        _currentStep.value,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
      _validateStep();
    } else if (_currentStep.value == 2 && _isFormValid.value) {
      _handleCreateGarage();
    }
  }

  void _previousStep() {
    if (_currentStep.value > 0) {
      _currentStep.value--;
      _pageController.animateToPage(
        _currentStep.value,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
      _validateStep();
    } else {
      Get.back();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    MediaQuery.of(context);

    // Define theme colors
    final Color accentColor = const Color(0xFF1B75BB);
    final Color backgroundColor =
        isDark ? const Color(0xFF101014) : const Color(0xFFF7F8FA);
    final Color titleTextColor =
        isDark ? Colors.white : const Color(0xFF1A1A2E);
    final Color subtitleTextColor =
        isDark ? Colors.white70 : const Color(0xFF4A4A68);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: backgroundColor,
        body: Stack(
          children: [
            // Animated background pattern

            // Main content
            SafeArea(
              child: Column(
                children: [
                  SizedBox(height: 20),
                  // Page content
                  Expanded(
                    child: PageView(
                      controller: _pageController,
                      physics: const NeverScrollableScrollPhysics(),
                      children: [
                        // Step 1: Garage Info
                        GarageInfoStep(
                          nameController: nameController,
                          isDark: isDark,
                          titleTextColor: titleTextColor,
                          subtitleTextColor: subtitleTextColor,
                          accentColor: accentColor,
                          steps: _setupSteps,
                          currentStep: _currentStep,
                          onBack:
                              () =>
                                  _currentStep.value > 0
                                      ? _previousStep()
                                      : Get.back(),
                          onNext: _nextStep,
                          isFormValid: _isFormValid.value,
                          isLoading: authController.isLoading.value,
                        ),

                        // Step 2: Location
                        LocationStep(
                          streetController: streetController,
                          phoneController: phoneController,
                          onCountryChanged: (country) {
                            setState(() {
                              selectedCountry = country;
                              _validateStep();
                            });
                          },
                          onCityChanged: (city) {
                            setState(() {
                              selectedCity = city;
                              _validateStep();
                            });
                          },
                          isDark: isDark,
                          titleTextColor: titleTextColor,
                          subtitleTextColor: subtitleTextColor,
                          accentColor: accentColor,
                          onBack: _previousStep,
                          onNext: _nextStep,
                          isFormValid: _isFormValid.value,
                          isLoading: authController.isLoading.value,
                        ),

                        // Step 4: Privacy & Submit
                        PrivacyStep(
                          nameController: nameController,
                          streetController: streetController,
                          phoneController: phoneController,
                          emailController: emailController,
                          selectedCountry: selectedCountry,
                          selectedCity: selectedCity,
                          privacyAccepted: _privacyAccepted,
                          onPrivacyChanged: (val) {
                            setState(() {
                              _privacyAccepted = val ?? false;
                              _validateStep();
                            });
                          },
                          isDark: isDark,
                          titleTextColor: titleTextColor,
                          subtitleTextColor: subtitleTextColor,
                          accentColor: accentColor,
                          onBack: _previousStep,
                          onNext: _nextStep,
                          isFormValid: _isFormValid.value,
                          isLoading: authController.isLoading.value,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleCreateGarage() {
    // Validate all inputs one final time
    if (nameController.text.trim().isEmpty) {
      Get.snackbar(
        'Missing Information',
        'Please enter a name for your garage',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withAlpha(26),
        colorText: Colors.red,
        margin: const EdgeInsets.all(16),
      );
      _currentStep.value = 0;
      _pageController.animateToPage(
        0,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
      return;
    }

    if (streetController.text.trim().isEmpty ||
        selectedCity.isEmpty ||
        selectedCountry.isEmpty) {
      Get.snackbar(
        'Missing Information',
        'Please enter a complete address',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withAlpha(26),
        colorText: Colors.red,
        margin: const EdgeInsets.all(16),
      );
      _currentStep.value = 1;
      _pageController.animateToPage(
        1,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
      return;
    }

    if (phoneController.text.trim().isEmpty) {
      Get.snackbar(
        'Missing Information',
        'Please enter a contact phone number',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withAlpha(26),
        colorText: Colors.red,
        margin: const EdgeInsets.all(16),
      );
      _currentStep.value = 2;
      _pageController.animateToPage(
        2,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
      return;
    }

    if (!_privacyAccepted) {
      Get.snackbar(
        'Terms Not Accepted',
        'Please accept the terms of service and privacy policy',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.withAlpha(26),
        colorText: Colors.red,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    // Construct garage data
    final garage = Garage(
      id: '', // Set this if you have an ID from backend, else leave empty
      name: nameController.text.trim(),
      address: Address(
        street: streetController.text.trim(),
        city: selectedCity,
        country: selectedCountry,
      ),
      phone: phoneController.text.trim(),
      email:
          emailController.text.trim().isNotEmpty
              ? emailController.text.trim()
              : null,
    );

    // Send data to API
    authController.createGarage(garage.toJson()).then((response) {
      if (response is Map && response['isSuccess'] == true) {
        _showSuccessDialog();
      } else {
        _handleErrorResponse(response);
      }
    });
  }

  void _showSuccessDialog() {
    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        elevation: 0,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color:
                Theme.of(context).brightness == Brightness.dark
                    ? const Color(0xFF1E1E2E)
                    : Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.check_circle,
                color: Color(0xFF1B75BB),
                size: 70,
              ),
              const SizedBox(height: 24),
              Text(
                'Garage Created!',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color:
                      Theme.of(context).brightness == Brightness.dark
                          ? Colors.white
                          : const Color(0xFF1A1A2E),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Your garage workspace is ready to use.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color:
                      Theme.of(context).brightness == Brightness.dark
                          ? Colors.white70
                          : const Color(0xFF4A4A68),
                ),
              ),
            ],
          ),
        ),
      ),
    );

    Future.delayed(const Duration(milliseconds: 1500), () {
      Get.offAllNamed('/home'); // Navigate to home route on success
    });
  }

  void _handleErrorResponse(dynamic response) {
    final message =
        response is Map
            ? response['message'] ?? 'Failed to create garage'
            : 'Failed to create garage';

    Get.snackbar(
      'Error',
      message,
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.red.withAlpha(26),
      colorText: Colors.red,
      margin: const EdgeInsets.all(16),
    );
  }
}
