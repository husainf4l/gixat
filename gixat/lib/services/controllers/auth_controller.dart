import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:io' show Platform;
import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:gixat/routes/app_pages.dart';
import 'package:gixat/models/gixat_user.dart';

class AuthController extends GetxController {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  RxBool isDarkMode = Get.isDarkMode.obs;

  final Rx<User?> user = Rx<User?>(null);
  final Rx<GixatUser?> gixatUser = Rx<GixatUser?>(null);

  // Form controllers
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  // Form validation errors
  final emailError = ''.obs;
  final passwordError = ''.obs;

  // UI state
  final isLoading = false.obs;
  final obscurePassword = true.obs;

  @override
  void onInit() {
    super.onInit();

    // First set initial user without triggering navigation
    user.value = _auth.currentUser;

    // Listen for theme changes
    ever(Get.isDarkMode.obs, (bool isDark) {
      isDarkMode.value = isDark;
    });

    // Schedule auth setup after the first frame renders
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Set up auth state listener
      _auth.authStateChanges().listen((User? firebaseUser) {
        user.value = firebaseUser;
        if (firebaseUser != null) {
          _loadOrCreateGixatUser(firebaseUser);
        } else {
          gixatUser.value = null;
        }
      });

      // Now set up ever listener for subsequent changes
      ever(gixatUser, _handleGixatUserChanged);

      // Handle initial auth state manually, but only after the first frame
      if (user.value != null) {
        _loadOrCreateGixatUser(user.value!);
      }
    });
  }

  // Load or create Gixat user
  Future<void> _loadOrCreateGixatUser(User firebaseUser) async {
    try {
      final doc =
          await _firestore.collection('users').doc(firebaseUser.uid).get();

      if (doc.exists) {
        // User exists in Firestore
        gixatUser.value = GixatUser.fromDocument(doc);
        debugPrint(
          'Loaded user: \n${gixatUser.value?.toMap()}',
        ); // Debug print for garageId
      } else {
        // Create new user
        final newUser = GixatUser(
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? '',
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          garageId: null, // New user has no garage
          role: 'user', // Set default role to 'user'
          emailVerified: firebaseUser.emailVerified,
          createdAt: Timestamp.now(),
          lastSignInAt: Timestamp.now(),
          metadata: {},
        );

        // Save to Firestore
        await _firestore
            .collection('users')
            .doc(firebaseUser.uid)
            .set(newUser.toMap());
        gixatUser.value = newUser;
      }
    } catch (e) {
      debugPrint('Error loading/creating Gixat user: $e');
    }
  }

  // Route based on GixatUser state
  void _handleGixatUserChanged(GixatUser? user) {
    Future.microtask(() {
      if (user == null) {
        Get.offAllNamed(Routes.login);
      } else if (user.garageId == null || user.garageId!.isEmpty) {
        Get.offAllNamed(Routes.connectGarage);
      } else {
        Get.offAllNamed(Routes.home);
      }
    });
  }

  // Update garage ID
  Future<void> updateUserGarage(String garageId) async {
    if (garageId.isEmpty || user.value == null) return;

    isLoading.value = true;
    try {
      await _firestore.collection('users').doc(user.value!.uid).update({
        'garageId': garageId,
        'lastSignInAt': Timestamp.now(),
      });

      // Update local copy
      gixatUser.value = gixatUser.value!.copyWith(
        garageId: garageId,
        lastSignInAt: Timestamp.now(),
      );
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to update garage connection',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Get.theme.colorScheme.error.withAlpha(30),
        colorText: Get.theme.colorScheme.error,
      );
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }

  // Toggle password visibility
  void togglePasswordVisibility() {
    obscurePassword.value = !obscurePassword.value;
  }

  // Validate email format
  bool _isEmailValid(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  // Email/Password Login
  Future<void> login() async {
    // Reset errors
    emailError.value = '';
    passwordError.value = '';

    // Basic validation
    final email = emailController.text.trim();
    final password = passwordController.text;

    if (email.isEmpty) {
      emailError.value = 'Email is required';
      return;
    }

    if (!_isEmailValid(email)) {
      emailError.value = 'Enter a valid email address';
      return;
    }

    if (password.isEmpty) {
      passwordError.value = 'Password is required';
      return;
    }

    if (password.length < 6) {
      passwordError.value = 'Password must be at least 6 characters';
      return;
    }

    // Show splash screen before attempting login
    Get.offNamed(Routes.authSplash);

    // Attempt login
    isLoading.value = true;

    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      // Auth state listener will handle navigation
    } on FirebaseAuthException catch (e) {
      _handleFirebaseAuthError(e);
      // Navigate back to login screen on error
      Get.offNamed(Routes.login);
    } catch (e) {
      Get.snackbar(
        'Error',
        'An unexpected error occurred',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Get.theme.colorScheme.error.withAlpha(30),
        colorText: Get.theme.colorScheme.error,
      );
      // Navigate back to login screen on error
      Get.offNamed(Routes.login);
    } finally {
      isLoading.value = false;
    }
  }

  // Sign up with email/password
  Future<void> signUp(String name, String email, String password) async {
    isLoading.value = true;

    try {
      UserCredential userCredential = await _auth
          .createUserWithEmailAndPassword(email: email, password: password);

      // Update display name
      await userCredential.user?.updateDisplayName(name);

      // Auth state listener will handle navigation
    } on FirebaseAuthException catch (e) {
      _handleFirebaseAuthError(e);
    } catch (e) {
      Get.snackbar(
        'Error',
        'An unexpected error occurred during sign up',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Get.theme.colorScheme.error.withAlpha(30),
        colorText: Get.theme.colorScheme.error,
      );
    } finally {
      isLoading.value = false;
    }
  }

  // Sign in with Google
  Future<void> signInWithGoogle() async {
    isLoading.value = true;

    try {
      // Start the Google sign-in process
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        // User canceled the sign-in flow
        isLoading.value = false;
        return;
      }

      // Show splash screen once user has selected their Google account
      Get.offNamed(Routes.authSplash);

      // Get authentication details from Google
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // Create Firebase credential
      final OAuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in with Firebase
      await _auth.signInWithCredential(credential);
      // Auth state listener will handle navigation
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to sign in with Google',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Get.theme.colorScheme.error.withAlpha(30),
        colorText: Get.theme.colorScheme.error,
      );
      // Navigate back to login screen on error
      Get.offNamed(Routes.login);
    } finally {
      isLoading.value = false;
    }
  }

  // Sign in with Apple
  Future<void> signInWithApple() async {
    if (!Platform.isIOS) return;

    isLoading.value = true;

    try {
      // Generate a random string for the nonce
      final rawNonce = _generateNonce();
      final nonce = _sha256ofString(rawNonce);

      // Request Apple sign-in credentials
      final appleCredential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: nonce,
      );

      // Show splash screen after user has authenticated with Apple
      Get.offNamed(Routes.authSplash);

      // Create an OAuthCredential for Firebase
      final oauthCredential = OAuthProvider(
        "apple.com",
      ).credential(idToken: appleCredential.identityToken, rawNonce: rawNonce);

      // Sign in with Firebase
      await _auth.signInWithCredential(oauthCredential);
      // Auth state listener will handle navigation
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to sign in with Apple',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Get.theme.colorScheme.error.withAlpha(30),
        colorText: Get.theme.colorScheme.error,
      );
      // Navigate back to login screen on error
      Get.offNamed(Routes.login);
    } finally {
      isLoading.value = false;
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      // First sign out from Firebase
      await _auth.signOut();

      // Clear Google Sign-In state
      // This fixes the issue with Google sign-in not working after sign out
      // by fully disconnecting the GoogleSignIn instance
      await _googleSignIn.disconnect();
      await _googleSignIn.signOut();

      // Auth state listener will handle navigation
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to sign out',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  // Reset password
  Future<void> forgotPassword() async {
    final email = emailController.text.trim();

    if (email.isEmpty) {
      emailError.value = 'Please enter your email address';
      return;
    }

    if (!_isEmailValid(email)) {
      emailError.value = 'Enter a valid email address';
      return;
    }

    isLoading.value = true;

    try {
      await _auth.sendPasswordResetEmail(email: email);
      Get.snackbar(
        'Success',
        'Password reset email sent. Check your inbox.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.withAlpha(30),
        colorText: Colors.green,
      );
    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found') {
        emailError.value = 'No user found with this email address';
      } else {
        Get.snackbar(
          'Error',
          'Failed to send password reset email',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Get.theme.colorScheme.error.withAlpha(30),
          colorText: Get.theme.colorScheme.error,
        );
      }
    } finally {
      isLoading.value = false;
    }
  }

  // Navigate to sign-up screen
  void navigateToSignUp() {
    emailError.value = '';
    passwordError.value = '';
    Get.toNamed(Routes.home); // Navigate to the sign-up screen instead of home
  }

  // Handle Firebase auth errors
  void _handleFirebaseAuthError(FirebaseAuthException e) {
    switch (e.code) {
      case 'invalid-email':
        emailError.value = 'Invalid email format';
        break;
      case 'user-disabled':
        emailError.value = 'This account has been disabled';
        break;
      case 'user-not-found':
        emailError.value = 'No account found with this email';
        break;
      case 'wrong-password':
        passwordError.value = 'Incorrect password';
        break;
      case 'email-already-in-use':
        emailError.value = 'Email already in use by another account';
        break;
      case 'weak-password':
        passwordError.value = 'Password is too weak';
        break;
      case 'operation-not-allowed':
        Get.snackbar(
          'Error',
          'This sign-in method is not enabled',
          snackPosition: SnackPosition.BOTTOM,
        );
        break;
      case 'account-exists-with-different-credential':
        Get.snackbar(
          'Error',
          'An account already exists with the same email address',
          snackPosition: SnackPosition.BOTTOM,
        );
        break;
      default:
        Get.snackbar(
          'Error',
          'Authentication failed: ${e.message}',
          snackPosition: SnackPosition.BOTTOM,
        );
    }
  }

  // Generate a random nonce for Apple sign-in
  String _generateNonce([int length = 32]) {
    final random = Random.secure();
    final charCodes = List<int>.generate(length, (_) {
      int code = random.nextInt(62);
      if (code < 10) return code + 48; // 0-9
      if (code < 36) return code + 55; // A-Z
      return code + 61; // a-z
    });
    return String.fromCharCodes(charCodes);
  }

  // Generate SHA-256 hash for Apple sign-in
  String _sha256ofString(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Create a new garage
  Future<dynamic> createGarage(Map<String, dynamic> garageData) async {
    if (user.value == null) {
      return {'isSuccess': false, 'message': 'User not authenticated'};
    }

    isLoading.value = true;
    try {
      // Create a new garage document in Firestore
      final docRef = await _firestore.collection('garages').add({
        ...garageData,
        'createdById': user.value!.uid,
        'createdAt': Timestamp.now(),
        'updatedAt': Timestamp.now(),
      });

      // Get the new garage ID
      final garageId = docRef.id;

      // Update the user with the new garage ID
      await _firestore.collection('users').doc(user.value!.uid).update({
        'garageId': garageId,
        'lastSignInAt': Timestamp.now(),
        'role': 'admin', // Set the user as the admin of the garage
      });

      // Update local copy
      gixatUser.value = gixatUser.value!.copyWith(
        garageId: garageId,
        lastSignInAt: Timestamp.now(),
      );

      return {'isSuccess': true, 'garageId': garageId};
    } catch (e) {
      debugPrint('Error creating garage: $e');
      return {
        'isSuccess': false,
        'message': 'Failed to create garage: ${e.toString()}',
      };
    } finally {
      isLoading.value = false;
    }
  }

  // Check if phone number is registered under garage/clients
}
