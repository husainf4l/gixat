import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../services/session_service.dart';

class ClientNotesScreen extends StatefulWidget {
  final String clientId;
  final String clientName;
  final String carId;
  final String sessionId;

  const ClientNotesScreen({
    Key? key,
    required this.clientId,
    required this.clientName,
    required this.carId,
    required this.sessionId,
  }) : super(key: key);

  @override
  State<ClientNotesScreen> createState() => _ClientNotesScreenState();
}

class _ClientNotesScreenState extends State<ClientNotesScreen> {
  final _formKey = GlobalKey<FormState>();
  final AuthController _authController = Get.find<AuthController>();
  final SessionService _sessionService = SessionService();

  final TextEditingController _notesController = TextEditingController();

  final List<String> _selectedRequests = [];
  final List<String> _availableRequests = [
    'Oil Change',
    'Brake Service',
    'Tire Rotation',
    'Engine Diagnostics',
    'AC Service',
    'Battery Replacement',
  ];

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Add gesture detector to dismiss keyboard when tapping outside
    WidgetsBinding.instance.addPostFrameCallback((_) {
      GestureDetector(
        onTap: () {
          // This ensures keyboard is dismissed when tapping anywhere else
          FocusScope.of(context).unfocus();
        },
        behavior: HitTestBehavior.opaque,
        child: Container(),
      );
    });
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _saveNotes() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Here you would save the client note to Firebase
      // For example:
      // final clientNoteId = await _clientNoteService.createClientNote(
      //   clientId: widget.clientId,
      //   carId: widget.carId,
      //   garageId: _authController.currentUser!.garageId,
      //   sessionId: widget.sessionId,
      //   notes: _notesController.text,
      //   clientRequests: _selectedRequests,
      // );

      // Then update the session with the client note ID
      // await _sessionService.updateSessionWithClientNote(
      //   sessionId: widget.sessionId,
      //   clientNoteId: clientNoteId!,
      // );

      // For now, just show success message
      Get.snackbar(
        'Success',
        'Client notes saved successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );

      // Navigate to main/home
      Get.offAllNamed('/home');
    } catch (e) {
      Get.snackbar(
        'Error',
        'An error occurred: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Client Notes',
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'for ${widget.clientName}',
                          style: theme.textTheme.titleMedium,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () {
                      Get.back();
                    },
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        controller: _notesController,
                        decoration: InputDecoration(
                          labelText: 'Client Notes',
                          prefixIcon: const Icon(Icons.note_alt),
                          border: const OutlineInputBorder(),
                          hintText:
                              'Enter notes about client requests and issues',
                          // Add an explicit "keyboard done" button in the suffix
                          suffixIcon: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.keyboard_hide),
                                tooltip: 'Done',
                                onPressed: () {
                                  // Close keyboard when done icon is tapped
                                  FocusScope.of(context).unfocus();
                                },
                              ),
                            ],
                          ),
                        ),
                        maxLines: 5,
                        // Use multiline keyboard type
                        keyboardType: TextInputType.multiline,
                        // Allow natural newlines with the return key
                        textInputAction: TextInputAction.newline,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter some notes';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Client Requests:',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: ListView.builder(
                          itemCount: _availableRequests.length,
                          itemBuilder: (context, index) {
                            final request = _availableRequests[index];
                            return CheckboxListTile(
                              title: Text(request),
                              value: _selectedRequests.contains(request),
                              secondary: Icon(
                                _getIconForRequest(request),
                                color: theme.primaryColor,
                              ),
                              onChanged: (bool? selected) {
                                setState(() {
                                  if (selected == true) {
                                    _selectedRequests.add(request);
                                  } else {
                                    _selectedRequests.remove(request);
                                  }
                                });
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _saveNotes,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child:
                              _isLoading
                                  ? const CircularProgressIndicator()
                                  : const Text('SAVE NOTES'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Helper method to get appropriate icons for different request types
  IconData _getIconForRequest(String request) {
    switch (request.toLowerCase()) {
      case 'oil change':
        return Icons.oil_barrel;

      case 'tire rotation':
        return Icons.tire_repair;
      case 'engine diagnostics':
        return Icons.settings;
      case 'ac service':
        return Icons.ac_unit;
      case 'battery replacement':
        return Icons.battery_full;
      default:
        return Icons.build;
    }
  }
}
