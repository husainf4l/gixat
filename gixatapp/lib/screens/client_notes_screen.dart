import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';
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
  final ImagePicker _imagePicker = ImagePicker();
  final FirebaseStorage _storage = FirebaseStorage.instance;

  final TextEditingController _customRequestController =
      TextEditingController();

  final List<String> _selectedRequests = [];
  String? _clientNotes;
  List<File> _selectedImages = [];
  List<String> _uploadedImageUrls = [];
  bool _isLoading = false;
  bool _isUploading = false;

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
      // First upload any selected images to Firebase Storage
      if (_selectedImages.isNotEmpty) {
        await _uploadImagesToFirebase();
      }

      final clientNotesId = await _clientNotesService.saveClientNote(
        sessionId: widget.sessionId,
        carId: widget.carId,
        clientId: widget.clientId,
        notes: _clientNotes ?? '',
        requests: _selectedRequests,
        images: _uploadedImageUrls,
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

  // Pick images from gallery or camera
  Future<void> _pickImages({
    required ImageSource source,
    bool multiple = false,
  }) async {
    try {
      setState(() {
        _isUploading = true;
      });

      if (source == ImageSource.gallery && multiple) {
        // Pick multiple images from gallery
        final List<XFile> pickedFiles = await _imagePicker.pickMultiImage();
        if (pickedFiles.isNotEmpty) {
          setState(() {
            for (var file in pickedFiles) {
              _selectedImages.add(File(file.path));
            }
          });
        }
      } else {
        // Pick single image from gallery or camera
        final XFile? pickedFile = await _imagePicker.pickImage(
          source: source,
          imageQuality: 80, // Reduce quality to save storage
        );

        if (pickedFile != null) {
          setState(() {
            _selectedImages.add(File(pickedFile.path));
          });
        }
      }

      // Show selected images preview
      if (_selectedImages.isNotEmpty) {
        _showImagesPreview();
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to pick image: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  // Show image source options (camera or gallery)
  void _showImageSourceOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Take Photo'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImages(source: ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImages(source: ImageSource.gallery);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Select Multiple Images'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImages(source: ImageSource.gallery, multiple: true);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  // Upload images to Firebase Storage
  Future<List<String>> _uploadImagesToFirebase() async {
    if (_selectedImages.isEmpty) return [];

    setState(() {
      _isUploading = true;
    });

    try {
      List<String> newlyUploadedUrls = [];

      for (var imageFile in _selectedImages) {
        try {
          // Create a unique file name with timestamp
          String fileName =
              'session_${widget.sessionId}_${DateTime.now().millisecondsSinceEpoch}.jpg';

          // Create a reference to the specified Firebase Storage bucket and path
          Reference storageRef = FirebaseStorage.instance
              .refFromURL('gs://gixat-app.firebasestorage.app')
              .child('client_notes_images/$fileName');

          // Upload the file
          await storageRef.putFile(imageFile);

          // Get the download URL
          String downloadUrl = await storageRef.getDownloadURL();
          newlyUploadedUrls.add(downloadUrl);
        } catch (e) {
          print('Error uploading individual image: $e');
          // Continue with the other images even if one fails
        }
      }

      // Add the newly uploaded URLs to the list of uploaded URLs
      _uploadedImageUrls.addAll(newlyUploadedUrls);

      // Clear the selected images list since they've been uploaded
      setState(() {
        _selectedImages.clear();
      });

      // Show success message if any images were uploaded
      if (newlyUploadedUrls.isNotEmpty) {
        Get.snackbar(
          'Success',
          'Images uploaded successfully',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green,
          colorText: Colors.white,
        );
      }

      return _uploadedImageUrls;
    } catch (e) {
      print('Error in _uploadImagesToFirebase: $e');
      Get.snackbar(
        'Error',
        'Failed to upload images: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return [];
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  // Show preview of selected images in a dialog
  void _showImagesPreview() {
    showDialog(
      context: context,
      builder:
          (context) => Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Selected Images',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (_selectedImages.isEmpty)
                    // Show empty container when there are no images
                    Container(
                      height: 200,
                      width: double.infinity,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.image_not_supported,
                            size: 48,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'No images selected',
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    SizedBox(
                      height: 300,
                      child: GridView.builder(
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 8,
                              mainAxisSpacing: 8,
                            ),
                        itemCount: _selectedImages.length,
                        itemBuilder: (context, index) {
                          return Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.file(
                                  _selectedImages[index],
                                  width: double.infinity,
                                  height: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Positioned(
                                top: 4,
                                right: 4,
                                child: GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _selectedImages.removeAt(index);
                                    });
                                    Navigator.pop(context);
                                    if (_selectedImages.isNotEmpty) {
                                      _showImagesPreview();
                                    }
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.close,
                                      size: 16,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      child: const Text('Done'),
                    ),
                  ),
                ],
              ),
            ),
          ),
    );
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
                              onPressed: _showImageSourceOptions,
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
