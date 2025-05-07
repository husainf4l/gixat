import 'package:flutter/material.dart';
import 'package:gixat/services/controllers/auth_controller.dart';

class MainSession extends StatelessWidget {
  const MainSession({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Center(
          child: IconButton(
            onPressed: AuthController().signOut,
            icon: const Icon(Icons.logout),
          ),
        ),
      ),
    );
  }
}
