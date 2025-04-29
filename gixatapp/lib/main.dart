import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:get/get.dart';
import 'firebase_options/firebase_options.dart';
import 'controllers/auth_controller.dart';
import 'screens/login_page.dart';
import 'screens/main_navigation_screen.dart'; // Import the new navigation screen
import 'screens/garage_setup_screen.dart'; // Import the new garage setup screen
import 'theme/app_theme.dart';
import 'services/database_service.dart';

void main() async {
  // Ensure Flutter is initialized
  WidgetsFlutterBinding.ensureInitialized();

  try {
    // Initialize Firebase with the correct options
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    // Initialize and register the DatabaseService after Firebase is initialized
    await Get.putAsync(() => DatabaseService().init());

    // Initialize the AuthController after services are set up
    Get.put(AuthController());

    runApp(const MyApp());
  } catch (e) {
    print('Error initializing Firebase: ${e.toString()}');
    // Show some UI for error state or retry logic
    runApp(const ErrorApp());
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Gixat App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme(), // Use the light theme from AppTheme class
      darkTheme: AppTheme.darkTheme(), // Use the dark theme from AppTheme class
      themeMode: ThemeMode.system,
      home: const AuthWrapper(),
    );
  }
}

class ErrorApp extends StatelessWidget {
  const ErrorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Error',
      home: Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              const Text(
                'Failed to initialize app',
                style: TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () {
                  // Restart app logic would go here
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final AuthController authController = Get.find<AuthController>();

    return Obx(() {
      // Check if Firebase user exists
      if (authController.firebaseUser != null) {
        // Check if we have app user data
        if (authController.currentUser != null) {
          // Check if garage ID exists
          if (authController.currentUser?.garageId != null &&
              authController.currentUser!.garageId!.isNotEmpty) {
            // User is authenticated and has a garage ID, show main app
            return const MainNavigationScreen();
          } else {
            // User is authenticated but needs to set up garage ID
            return const GarageSetupScreen();
          }
        } else {
          // Firebase user exists but app user data is still loading
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
      } else {
        // User is not authenticated
        return LoginPage();
      }
    });
  }
}
