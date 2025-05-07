import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SnackBarService {
  // Singleton instance
  static final SnackBarService _instance = SnackBarService._internal();
  
  factory SnackBarService() => _instance;
  
  SnackBarService._internal();

  // Show message using GetX snackbar (doesn't need BuildContext)
  void showMessage(String message, {bool isError = true}) {
    // Format the error message to remove "Exception: " prefix if it exists
    String displayMessage = message;
    if (isError && message.contains('Exception:')) {
      displayMessage = message.replaceFirst('Exception: ', '');
    }

    Get.snackbar(
      isError ? 'Error' : 'Success',
      displayMessage,
      backgroundColor: isError ? Colors.red : Colors.green,
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
      snackPosition: SnackPosition.BOTTOM,
      margin: const EdgeInsets.all(16),
    );
  }

  // Alternative method using ScaffoldMessenger (requires BuildContext)
  void showMessageWithContext(BuildContext context, String message, {bool isError = true}) {
    // Format the error message to remove "Exception: " prefix if it exists
    String displayMessage = message;
    if (isError && message.contains('Exception:')) {
      displayMessage = message.replaceFirst('Exception: ', '');
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(displayMessage),
        backgroundColor: isError ? Colors.red : Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}