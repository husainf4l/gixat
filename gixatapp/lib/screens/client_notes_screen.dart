import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../controllers/auth_controller.dart';
import '../services/session_service.dart';
import '../services/client_notes_service.dart';
import 'main_navigation_screen.dart';

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
  final AuthController _authController = Get.find<AuthController>();
  final SessionService _sessionService = SessionService();
  final ClientNotesService _clientNotesService = ClientNotesService();

  final TextEditingController _customRequestController =
      TextEditingController();

  final List<String> _selectedRequests = [];
  String? _clientNotes;

  bool _isLoading = false;

  @override
  void dispose() {
    _customRequestController.dispose();
    super.dispose();
  }

  void _addCustomRequest() {
    final request = _customRequestController.text.trim();
    if (request.isNotEmpty) {
      setState(() {
        _selectedRequests.add(request);
        _customRequestController.clear();
      });
      FocusScope.of(context).unfocus();
    } else {
      _showAddRequestDialog();
    }
  }

  void _showAddRequestDialog() {
    if (!mounted) return;

    // Use StatefulBuilder to keep controller in dialog's scope and lifecycle
    showDialog(
      context: context,
      barrierDismissible: true,
      builder:
          (dialogContext) => StatefulBuilder(
            builder: (dialogContext, setDialogState) {
              // Create controller inside the builder to ensure fresh instance
              final dialogController = TextEditingController();

              return AlertDialog(
                title: const Text('Add New Request'),
                content: TextField(
                  controller: dialogController,
                  autofocus: true,
                  decoration: const InputDecoration(
                    hintText: 'Enter service request',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.build_circle),
                  ),
                  textCapitalization: TextCapitalization.sentences,
                  onSubmitted: (value) {
                    if (value.trim().isNotEmpty && mounted) {
                      setState(() {
                        _selectedRequests.add(value.trim());
                      });
                      Navigator.of(dialogContext).pop();
                    }
                  },
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogContext).pop(),
                    child: const Text('CANCEL'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      final request = dialogController.text.trim();
                      if (request.isNotEmpty && mounted) {
                        setState(() {
                          _selectedRequests.add(request);
                        });
                        Navigator.of(dialogContext).pop();
                      }
                    },
                    child: const Text('ADD'),
                  ),
                ],
              );
            },
          ),
    );
  }

  void _removeRequest(String request) {
    setState(() {
      _selectedRequests.remove(request);
    });
  }

  void _showNotesDialog() {
    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: true,
      builder:
          (dialogContext) => StatefulBuilder(
            builder: (dialogContext, setDialogState) {
              final notesDialogController = TextEditingController(
                text: _clientNotes ?? '',
              );

              return AlertDialog(
                title: const Text('Add Client Notes'),
                content: TextField(
                  controller: notesDialogController,
                  autofocus: true,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    hintText: 'Enter notes about client requests and issues',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.note_alt),
                  ),
                  textCapitalization: TextCapitalization.sentences,
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogContext).pop(),
                    child: const Text('CANCEL'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      if (mounted) {
                        setState(() {
                          _clientNotes = notesDialogController.text.trim();
                        });
                        Navigator.of(dialogContext).pop();
                      }
                    },
                    child: const Text('SAVE'),
                  ),
                ],
              );
            },
          ),
    );
  }

  Future<void> _saveNotes() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final clientNotesId = await _clientNotesService.saveClientNote(
        sessionId: widget.sessionId,
        carId: widget.carId,
        clientId: widget.clientId,
        notes: _clientNotes ?? '',
        requests: _selectedRequests,
        images: [], // Placeholder for images
      );

      if (clientNotesId != null) {
        final success = await _sessionService.updateSessionWithClientNote(
          sessionId: widget.sessionId,
          clientNoteId: clientNotesId,
        );
        if (success) {
          Get.snackbar(
            'Success',
            'Client notes saved successfully',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.green,
            colorText: Colors.white,
          );
          Get.offAll(() => const MainNavigationScreen());
        } else {
          throw Exception('Failed to update session with clientNotesId');
        }
      } else {
        throw Exception('Failed to save client notes');
      }

      await Future.delayed(const Duration(milliseconds: 800));
    } catch (e) {
      if (mounted) {
        Get.snackbar(
          'Error',
          'An error occurred: $e',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red,
          colorText: Colors.white,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
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
                  const SizedBox(width: 4),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _saveNotes,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child:
                        _isLoading
                            ? SizedBox(
                              width: 18,
                              height: 18,
                              child: const CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                            : const Text('SAVE'),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_clientNotes != null && _clientNotes!.isNotEmpty)
                    Card(
                      color: theme.colorScheme.surfaceVariant,
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: const Icon(Icons.note_alt),
                        title: Text(_clientNotes!),
                        trailing: IconButton(
                          icon: const Icon(Icons.edit),
                          onPressed: _showNotesDialog,
                        ),
                      ),
                    ),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.note_add),
                      label: Text(
                        _clientNotes == null || _clientNotes!.isEmpty
                            ? 'Add Client Notes'
                            : 'Edit Client Notes',
                      ),
                      onPressed: _showNotesDialog,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Client Requests:',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
            Flexible(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child:
                    _selectedRequests.isEmpty
                        ? Center(
                          child: Text(
                            'No requests added yet',
                            style: theme.textTheme.bodyLarge?.copyWith(
                              color: Colors.grey,
                            ),
                          ),
                        )
                        : ListView.builder(
                          itemCount: _selectedRequests.length,
                          itemBuilder: (context, index) {
                            final request = _selectedRequests[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              child: ListTile(
                                title: Text(request),
                                leading: Icon(
                                  _getIconForRequest(request),
                                  color: theme.primaryColor,
                                ),
                                trailing: IconButton(
                                  icon: const Icon(
                                    Icons.delete,
                                    color: Colors.red,
                                  ),
                                  onPressed: () => _removeRequest(request),
                                ),
                              ),
                            );
                          },
                        ),
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(
                                Icons.attach_file,
                                color: Colors.grey,
                              ),
                              tooltip: 'Attach image',
                              onPressed: () {
                                // TODO: Implement image picker logic
                              },
                            ),
                            Expanded(
                              child: TextField(
                                controller: _customRequestController,
                                decoration: const InputDecoration(
                                  hintText: 'Type a service request...',
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.symmetric(
                                    horizontal: 0,
                                    vertical: 14,
                                  ),
                                ),
                                textInputAction: TextInputAction.send,
                                onSubmitted: (_) => _addCustomRequest(),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    CircleAvatar(
                      backgroundColor: theme.primaryColor,
                      child: IconButton(
                        icon: const Icon(Icons.send, color: Colors.white),
                        onPressed: _addCustomRequest,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

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
