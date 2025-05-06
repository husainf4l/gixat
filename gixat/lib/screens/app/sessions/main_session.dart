import 'package:flutter/material.dart';

class MainSession extends StatelessWidget {
  const MainSession({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: const Scaffold(body: Center(child: Text('Main Session'))),
    );
  }
}
