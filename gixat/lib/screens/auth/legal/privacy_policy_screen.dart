import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class PrivacyPolicyScreen extends StatefulWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  PrivacyPolicyScreenState createState() => PrivacyPolicyScreenState();
}

class PrivacyPolicyScreenState extends State<PrivacyPolicyScreen>
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
                    'Privacy Policy',
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
                              'At Gixat, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the application.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Information We Collect
                            Text(
                              'Information We Collect',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'We may collect several types of information from and about users of our application, including:\n\n• Personal identifiers such as name, email address, phone number, and location\n• Automotive service business information\n• Customer information you input into the system\n• Vehicle information and service records\n• Usage data about how you interact with our application\n• Device information including device type, operating system, and browser type',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // How We Use Your Information
                            Text(
                              'How We Use Your Information',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'We use the information we collect to:\n\n• Provide, maintain, and improve our services\n• Process and manage your account registration\n• Fulfill and manage your service requests\n• Send you technical notices, updates, security alerts, and support messages\n• Respond to your comments, questions, and requests\n• Analyze usage patterns and improve user experience\n• Develop new products, services, and features',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Data Security
                            Text(
                              'Data Security',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'We implement appropriate security measures to protect the security of your personal information. We use industry-standard encryption technologies when transferring and receiving data. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Third-Party Services
                            Text(
                              'Third-Party Services',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Our app may use third-party services that collect information used to identify you. These include:\n\n• Firebase Analytics for app usage analytics\n• Firebase Authentication for secure login\n• Google Cloud services for data storage\n• Payment processors for subscription management',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Your Data Rights
                            Text(
                              'Your Data Rights',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Depending on your location, you may have certain rights regarding your personal information, such as:\n\n• Access to the personal information we have about you\n• Correction of inaccurate personal information\n• Deletion of your personal information\n• Restriction or objection to our use of your personal information\n• Portability of your personal information\n• Withdrawal of consent',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Children's Privacy
                            Text(
                              'Children\'s Privacy',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Our Services are not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn we have collected or received personal information from a child under 13, we will delete that information.',
                              style: TextStyle(
                                fontSize: 15,
                                color: bodyTextColor,
                                height: 1.6,
                              ),
                            ),

                            const SizedBox(height: 24),

                            // Changes to Privacy Policy
                            Text(
                              'Changes to Privacy Policy',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'We may update our Privacy Policy from time to time. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.',
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
                              'If you have questions or concerns about this Privacy Policy, please contact us at:\n\nprivacy@gixat.com',
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
