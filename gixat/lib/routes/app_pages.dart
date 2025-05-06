import 'package:get/get.dart';
import 'package:gixat/routes/auth_binding.dart';
import 'package:gixat/screens/auth/login.dart';
import 'package:gixat/screens/app/main_navigation_screen.dart';
import 'package:gixat/screens/auth/connect_garage_screen.dart';
import 'package:gixat/screens/auth/garage_setup_screen.dart';
import 'package:gixat/screens/auth/auth_splash_screen.dart';
import 'package:gixat/screens/auth/legal/terms_of_service_screen.dart';
import 'package:gixat/screens/auth/legal/privacy_policy_screen.dart';
// Import other screens here

part 'app_routes.dart';

class AppPages {
  static final routes = [
    GetPage(name: Routes.login, page: () => Login(), binding: AuthBinding()),
    GetPage(name: Routes.home, page: () => MainNavigationScreen()),
    GetPage(name: Routes.connectGarage, page: () => ConnectGarageScreen()),
    GetPage(name: Routes.setupGarage, page: () => const GarageSetupScreen()),
    GetPage(name: Routes.authSplash, page: () => const AuthSplashScreen()),
    GetPage(
      name: Routes.termsOfService,
      page: () => const TermsOfServiceScreen(),
    ),
    GetPage(
      name: Routes.privacyPolicy,
      page: () => const PrivacyPolicyScreen(),
    ),
  ];
}
