import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:gixat/services/controllers/auth_controller.dart';
import 'dart:ui';
import 'package:gixat/routes/app_pages.dart';

class ConnectGarageScreen extends StatefulWidget {
  const ConnectGarageScreen({super.key});

  @override
  ConnectGarageScreenState createState() => ConnectGarageScreenState();
}

class ConnectGarageScreenState extends State<ConnectGarageScreen>
    with SingleTickerProviderStateMixin {
  final controller = TextEditingController();
  final authController = Get.find<AuthController>();
  late AnimationController _animationController;
  bool _privacyAccepted = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 800),
    );
    // Start the animation
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final width = MediaQuery.of(context).size.width;
    return Scaffold(
      backgroundColor: isDark ? Color(0xFF101014) : Color(0xFFF7F8FA),
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors:
                      isDark
                          ? [Color(0xFF23243A), Color(0xFF101014)]
                          : [Color(0xFFE8ECF7), Color(0xFFF7F8FA)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
              child: Container(color: Colors.transparent),
            ),
          ),
          Center(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: AnimatedContainer(
                  duration: Duration(milliseconds: 400),
                  curve: Curves.easeOut,
                  padding: const EdgeInsets.symmetric(
                    vertical: 32,
                    horizontal: 24,
                  ),
                  width: width < 420 ? double.infinity : 400,
                  decoration: BoxDecoration(
                    color:
                        isDark
                            ? Colors.white.withAlpha(18) // 7% opacity
                            : Colors.white.withAlpha(230), // 90% opacity
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(13), // 5% opacity
                        blurRadius: 24,
                        offset: Offset(0, 8),
                      ),
                    ],
                    border: Border.all(
                      color: Colors.white.withAlpha(33), // 13% opacity
                      width: 1.1,
                    ),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: Color(
                              0xFF1B75BB,
                            ).withAlpha(26), // 10% opacity
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.home_rounded,
                            size: 34,
                            color: Color(0xFF1B75BB),
                          ),
                        ),
                      ),
                      SizedBox(height: 24),
                      Text(
                        'Join Your Garage Workspace',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.7,
                          color: isDark ? Colors.white : Color(0xFF222222),
                        ),
                      ),
                      Text(
                        'Enter your invitation code to access your team’s workspace and unlock Gixat’s full potential.',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.white70 : Color(0xFF6B7280),
                          fontWeight: FontWeight.w400,
                        ),
                        textAlign: TextAlign.left,
                      ),
                      SizedBox(height: 20),
                      TextField(
                        controller: controller,
                        decoration: InputDecoration(
                          labelText: 'Invitation Code',
                          hintText: 'Paste or type your code',
                          labelStyle: TextStyle(
                            fontWeight: FontWeight.w500,
                            color: isDark ? Colors.grey[400] : Colors.grey[700],
                          ),
                          prefixIcon: Icon(
                            Icons.key_rounded,
                            color: Color(
                              0xFF1B75BB,
                            ).withAlpha(179), // 70% opacity
                            size: 22,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                              color:
                                  isDark
                                      ? Colors.grey[700]!
                                      : Colors.grey[300]!,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                              color:
                                  isDark
                                      ? Colors.grey[700]!
                                      : Colors.grey[300]!,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                              color: Color(0xFF1B75BB),
                              width: 2,
                            ),
                          ),
                          fillColor:
                              isDark
                                  ? Colors.white.withAlpha(20) // 8% opacity
                                  : Color(0xFFF2F4F8),
                          filled: true,
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 16,
                          ),
                        ),
                        style: TextStyle(
                          fontSize: 16,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                        keyboardType: TextInputType.text,
                        textInputAction: TextInputAction.done,
                      ),
                      SizedBox(height: 12),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(right: 4.0),
                            child: Checkbox(
                              value: _privacyAccepted,
                              onChanged: (val) {
                                setState(() => _privacyAccepted = val ?? false);
                              },
                              activeColor: Color(0xFF1B75BB),
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                              visualDensity: VisualDensity.compact,
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => Get.toNamed('/privacy'),
                              child: RichText(
                                text: TextSpan(
                                  style: TextStyle(
                                    color:
                                        isDark
                                            ? Colors.white70
                                            : Color(0xFF6B7280),
                                    fontSize: 14,
                                  ),
                                  children: [
                                    TextSpan(text: 'I accept the '),
                                    TextSpan(
                                      text: 'Privacy Policy',
                                      style: TextStyle(
                                        color: Color(0xFF1B75BB),
                                        decoration: TextDecoration.underline,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 22),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed:
                              (_privacyAccepted &&
                                      !authController.isLoading.value)
                                  ? () async {
                                    final garageId = controller.text.trim();
                                    await authController.updateUserGarage(
                                      garageId,
                                    );
                                    // Optionally, show a success message or navigate
                                    if (authController
                                            .gixatUser
                                            .value
                                            ?.garageId ==
                                        garageId) {
                                      Get.snackbar(
                                        'Success',
                                        'Garage connected successfully!',
                                        snackPosition: SnackPosition.BOTTOM,
                                        backgroundColor: Colors.green.withAlpha(
                                          30,
                                        ),
                                        colorText: Colors.green,
                                      );
                                      // Optionally navigate to home or dashboard
                                      // Get.offAllNamed(Routes.home);
                                    }
                                  }
                                  : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFF1B75BB),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            textStyle: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 17,
                            ),
                          ),
                          child:
                              authController.isLoading.value
                                  ? SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2.5,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white,
                                      ),
                                    ),
                                  )
                                  : Text('Connect'),
                        ),
                      ),
                      SizedBox(height: 14),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: OutlinedButton.icon(
                          icon: Icon(
                            Icons.add_business_rounded,
                            color: Color(0xFF1B75BB),
                          ),
                          label: Text(
                            'Create a New Garage',
                            style: TextStyle(
                              color: Color(0xFF1B75BB),
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: Color(0xFF1B75BB),
                              width: 1.5,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            foregroundColor: Color(0xFF1B75BB),
                            backgroundColor: Color(0xFF1B75BB).withAlpha(12),
                            textStyle: TextStyle(fontWeight: FontWeight.w600),
                          ),
                          onPressed: () => Get.toNamed(Routes.setupGarage),
                        ),
                      ),
                      TextButton.icon(
                        icon: Icon(
                          Icons.logout_rounded,
                          size: 18,
                          color: isDark ? Colors.white70 : Colors.grey[700],
                        ),
                        label: Text(
                          'Switch Account',
                          style: TextStyle(
                            color: isDark ? Colors.white70 : Colors.grey[700],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        onPressed: () => authController.signOut(),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
