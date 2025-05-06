import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class TermsOfServiceScreen extends StatefulWidget {
  const TermsOfServiceScreen({super.key});

  @override
  TermsOfServiceScreenState createState() => TermsOfServiceScreenState();
}

class TermsOfServiceScreenState extends State<TermsOfServiceScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    // Start the animation
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Define theme-specific colors for better visibility
    final Color backgroundColor =
        isDark ? const Color(0xFF101014) : const Color(0xFFF7F8FA);

    final Color cardBgColor =
        isDark
            ? const Color(0xFF1E1E2E)
            : Colors.white.withAlpha(242); // 95% opacity

    final Color titleTextColor =
        isDark ? Colors.white : const Color(0xFF1A1A2E);

    final Color bodyTextColor =
        isDark
            ? Colors.white.withAlpha(230)
            : const Color(0xFF4A4A68); // 90% opacity

    final Color headingColor =
        isDark ? const Color(0xFF4D9EE8) : const Color(0xFF1B75BB);

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
          SafeArea(
            child: CustomScrollView(
              slivers: [
                // App bar
                SliverAppBar(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  pinned: true,
                  leading: IconButton(
                    icon: Icon(
                      Icons.arrow_back_rounded,
                      color: isDark ? Colors.white : const Color(0xFF1A1A2E),
                    ),
                    onPressed: () => Get.back(),
                  ),
                  title: Text(
                    'Terms of Service',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                      color: titleTextColor,
                    ),
                  ),
                ),

                // Content
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: AnimatedBuilder(
                      animation: _animationController,
                      builder: (context, child) {
                        return FadeTransition(
                          opacity: _animationController,
                          child: SlideTransition(
                            position: Tween<Offset>(
                              begin: const Offset(0, 0.1),
                              end: Offset.zero,
                            ).animate(
                              CurvedAnimation(
                                parent: _animationController,
                                curve: Curves.easeOut,
                              ),
                            ),
                            child: child,
                          ),
                        );
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 24),
                        padding: const EdgeInsets.symmetric(
                          vertical: 24,
                          horizontal: 20,
                        ),
                        decoration: BoxDecoration(
                          color: cardBgColor,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(
                                isDark ? 51 : 13,
                              ), // 20% and 5% opacity
                              blurRadius: 24,
                              offset: const Offset(0, 8),
                            ),
                          ],
                          border: Border.all(
                            color:
                                isDark
                                    ? Colors.white.withAlpha(38) // 15% opacity
                                    : Colors.black.withAlpha(10), // 4% opacity
                            width: 1.1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Last updated date
                            Text(
                              'Last Updated: May 1, 2025',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: bodyTextColor,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Introduction
                            Text(
                              'Introduction',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Welcome to Gixat. These Terms of Service ("Terms") govern your access to and use of our website, mobile applications, and other online products and services (collectively, the "Services") provided by Gixat LLC ("Gixat", "we", "us", or "our").',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Account Information
                            Text(
                              'Account Information',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'To use certain features of the Services, you may be required to create an account and provide certain information about yourself. You agree that any information you provide will be accurate, complete, and updated as needed. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Using the Services
                            Text(
                              'Using the Services',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'You may use our Services only as permitted by these Terms and applicable law. You may not use our Services:\n\n• In any way that violates any applicable law or regulation\n• To send spam or bulk unsolicited messages\n• To interfere with or disrupt the Services or servers or networks connected to the Services\n• To attempt to gain unauthorized access to any part of the Services\n• To harvest or collect email addresses or other contact information of other users',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Garage Management
                            Text(
                              'Garage Management',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Our Services are designed to help you manage your automotive service business. You are solely responsible for:\n\n• The accuracy of the data you enter into the system\n• Complying with all applicable laws and regulations regarding automotive service and repair in your jurisdiction\n• Securing appropriate customer consent for data storage and processing\n• Implementing proper security measures within your business',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Intellectual Property
                            Text(
                              'Intellectual Property',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'The Services and all content and materials available through the Services, including but not limited to trademarks, designs, text, graphics, images, and software, are the property of Gixat or our licensors and are protected by copyright, trademark, and other intellectual property laws.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Termination
                            Text(
                              'Termination',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'We reserve the right to suspend or terminate your access to the Services at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Services, us, or third parties, or for any other reason.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Changes to Terms
                            Text(
                              'Changes to Terms',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'We may modify these Terms at any time. If we do, we will let you know by posting the modified Terms on the site and/or by sending you an email or other communication. It\'s important that you review the modified Terms. If you continue to use the Services after we have posted modified Terms, you are indicating that you agree to be bound by the modified Terms.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Contact
                            Text(
                              'Contact',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'If you have any questions about these Terms, please contact us at:\n\nsupport@gixat.com',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 30),

                            // Accept button
                            Center(
                              child: ElevatedButton(
                                onPressed: () => Get.back(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1B75BB),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 32,
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: const Text(
                                  'I Understand',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
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
          ),
        ],
      ),
    );
  }
}
