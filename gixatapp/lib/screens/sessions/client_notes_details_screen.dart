import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';
import '../../models/session.dart';
import '../../services/client_notes_service.dart';
import '../../services/session_service.dart';

class ClientNotesDetailsScreen extends StatefulWidget {
  final Session session;
  final String? clientNotesId;
  final String clientName;
  final String carDetails;

  const ClientNotesDetailsScreen({
    Key? key,
    required this.session,
    this.clientNotesId,
    required this.clientName,
    required this.carDetails,
  }) : super(key: key);

  @override
  State<ClientNotesDetailsScreen> createState() =>
      _ClientNotesDetailsScreenState();
}

class _ClientNotesDetailsScreenState extends State<ClientNotesDetailsScreen> {
  final ClientNotesService _clientNotesService = ClientNotesService();
  final SessionService _sessionService = SessionService();
  final TextEditingController _customRequestController =
      TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();
  final FirebaseStorage _storage = FirebaseStorage.instance;

  String? _notes;
  List<String> _requests = [];
  List<File> _selectedImages = [];
  List<String> _uploadedImageUrls = [];
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isUploading = false;
  bool _isEditing = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchClientNotes();
  }

  @override
  void dispose() {
    _customRequestController.dispose();
    super.dispose();
  }

  Future<void> _fetchClientNotes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (widget.clientNotesId != null) {
        // Fetch existing client notes
        final clientNoteDoc =
            await FirebaseFirestore.instance
                .collection('clientNotes')
                .doc(widget.clientNotesId)
                .get();

        if (clientNoteDoc.exists) {
          final data = clientNoteDoc.data() as Map<String, dynamic>;
          setState(() {
            _notes = data['notes'] as String?;
            if (data['requests'] != null) {
              _requests = List<String>.from(data['requests']);
            }

            // Load existing image URLs
            if (data['images'] != null) {
              _uploadedImageUrls = List<String>.from(data['images']);
            }
          });
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading client notes: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
    });
  }

  void _showEditNotesDialog() {
    if (!mounted) return;

    final TextEditingController notesController = TextEditingController(
      text: _notes ?? '',
    );

    showDialog(
      context: context,
      barrierDismissible: true,
      builder:
          (dialogContext) => AlertDialog(
            title: const Text('Edit Client Notes'),
            content: TextField(
              controller: notesController,
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
                      _notes = notesController.text.trim();
                    });
                    Navigator.of(dialogContext).pop();
                  }
                },
                child: const Text('SAVE'),
              ),
            ],
          ),
    );
  }

  void _addCustomRequest() {
    final request = _customRequestController.text.trim();
    if (request.isNotEmpty) {
      setState(() {
        _requests.add(request);
        _customRequestController.clear();
      });
      FocusScope.of(context).unfocus();
    } else {
      _showAddRequestDialog();
    }
  }

  void _showAddRequestDialog() {
    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: true,
      builder:
          (dialogContext) => StatefulBuilder(
            builder: (dialogContext, setDialogState) {
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
                        _requests.add(value.trim());
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
                          _requests.add(request);
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
      _requests.remove(request);
    });
  }

  Future<void> _saveChanges() async {
    if (!mounted) return;

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    try {
      print("DEBUG: Starting save changes process");
      print("DEBUG: Selected images count: ${_selectedImages.length}");
      print(
        "DEBUG: Existing uploaded URLs count: ${_uploadedImageUrls.length}",
      );

      // First upload any selected images to Firebase Storage
      if (_selectedImages.isNotEmpty) {
        print("DEBUG: Uploading images to Firebase Storage");
        List<String> uploadedUrls = await _uploadImagesToFirebase();
        print(
          "DEBUG: Images uploaded successfully, got ${uploadedUrls.length} URLs",
        );
      }

      print(
        "DEBUG: Total image URLs after upload: ${_uploadedImageUrls.length}",
      );
      print("DEBUG: Image URLs data type: ${_uploadedImageUrls.runtimeType}");

      // Debug print all URLs
      for (int i = 0; i < _uploadedImageUrls.length; i++) {
        print("DEBUG: URL $i: ${_uploadedImageUrls[i]}");
      }

      String? clientNotesId = widget.clientNotesId;
      print(
        "DEBUG: Client notes ID is ${clientNotesId ?? 'null (creating new)'}",
      );

      if (clientNotesId != null) {
        // Update existing client notes
        print("DEBUG: Updating existing client note");
        bool updateSuccess = await _clientNotesService.updateClientNote(
          clientNoteId: clientNotesId,
          notes: _notes ?? '',
          requests: _requests,
          images: _uploadedImageUrls,
        );
        print("DEBUG: Update success: $updateSuccess");
      } else {
        // Create new client notes
        print("DEBUG: Creating new client note");
        clientNotesId = await _clientNotesService.saveClientNote(
          sessionId: widget.session.id,
          carId: widget.session.car['id'] ?? '',
          clientId: widget.session.client['id'] ?? '',
          notes: _notes ?? '',
          requests: _requests,
          images: _uploadedImageUrls,
        );

        print(
          "DEBUG: Client note created with ID: ${clientNotesId ?? 'failed'}",
        );

        if (clientNotesId != null) {
          // Link the notes to the session
          print("DEBUG: Linking note to session");
          await _sessionService.updateSessionWithClientNote(
            sessionId: widget.session.id,
            clientNoteId: clientNotesId,
            notes: _notes,
          );
          print("DEBUG: Successfully linked note to session");
        } else {
          throw Exception('Failed to create client notes');
        }
      }

      Get.snackbar(
        'Success',
        'Client notes saved successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );

      // Toggle out of edit mode after successfully saving
      if (mounted) {
        _toggleEditMode();
      }

      // Return to previous screen
      // Get.back(); // Commented out to stay on the screen after saving
    } catch (e) {
      print("DEBUG ERROR: ${e.toString()}");
      if (e is FirebaseException) {
        print("DEBUG FIREBASE ERROR: code=${e.code}, message=${e.message}");
      }
      setState(() {
        _errorMessage = 'Error saving client notes: $e';
      });

      Get.snackbar(
        'Error',
        'Failed to save client notes: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
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
    if (_selectedImages.isEmpty) return _uploadedImageUrls;

    setState(() {
      _isUploading = true;
    });

    try {
      List<String> newlyUploadedUrls = [];

      for (var imageFile in _selectedImages) {
        try {
          // Create a unique file name with timestamp
          String fileName =
              'session_${widget.session.id}_${DateTime.now().millisecondsSinceEpoch}.jpg';

          print("DEBUG: Starting upload for file: $fileName");

          // Create a reference to the specified Firebase Storage bucket and path
          Reference storageRef = FirebaseStorage.instance
              .refFromURL('gs://gixat-app.firebasestorage.app')
              .child('client_notes_images/$fileName');

          // Upload the file
          final TaskSnapshot uploadTask = await storageRef.putFile(imageFile);
          print(
            "DEBUG: Upload successful, bytes transferred: ${uploadTask.bytesTransferred}",
          );

          // Get the download URL
          String downloadUrl = await storageRef.getDownloadURL();
          print("DEBUG: Got download URL: $downloadUrl");

          // Check if URL is valid
          if (downloadUrl.startsWith('http')) {
            newlyUploadedUrls.add(downloadUrl);
            print(
              "DEBUG: Added URL to newlyUploadedUrls list. Current count: ${newlyUploadedUrls.length}",
            );
          } else {
            print("DEBUG ERROR: Invalid download URL format: $downloadUrl");
          }
        } catch (e) {
          print("DEBUG ERROR: Failed uploading individual image: $e");
          if (e is FirebaseException) {
            print("DEBUG FIREBASE ERROR: ${e.code} - ${e.message}");
          }
        }
      }

      print(
        "DEBUG: All uploads completed. Total new URLs: ${newlyUploadedUrls.length}",
      );
      print(
        "DEBUG: Current _uploadedImageUrls before adding new ones: ${_uploadedImageUrls.length}",
      );

      // Add the newly uploaded URLs to the list of uploaded URLs
      final List<String> updatedUrls = List<String>.from(_uploadedImageUrls);
      updatedUrls.addAll(newlyUploadedUrls);

      setState(() {
        _uploadedImageUrls = updatedUrls;
        _selectedImages.clear();
      });

      print(
        "DEBUG: Final _uploadedImageUrls after adding new ones: ${_uploadedImageUrls.length}",
      );
      print(
        "DEBUG: _uploadedImageUrls type: ${_uploadedImageUrls.runtimeType}",
      );

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
      print("DEBUG ERROR in _uploadImagesToFirebase: $e");
      Get.snackbar(
        'Error',
        'Failed to upload images: $e',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return _uploadedImageUrls;
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  // Remove a selected image
  void _removeSelectedImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  // Display uploaded images in a grid
  Widget _buildUploadedImagesGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: _uploadedImageUrls.length,
      itemBuilder: (context, index) {
        return Stack(
          children: [
            GestureDetector(
              onTap: () {
                // Show full-screen image preview
                showDialog(
                  context: context,
                  builder:
                      (context) => Dialog(
                        insetPadding: EdgeInsets.zero,
                        child: GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: InteractiveViewer(
                            minScale: 0.5,
                            maxScale: 3.0,
                            child: Image.network(
                              _uploadedImageUrls[index],
                              fit: BoxFit.contain,
                              loadingBuilder: (
                                context,
                                child,
                                loadingProgress,
                              ) {
                                if (loadingProgress == null) return child;
                                return Center(
                                  child: CircularProgressIndicator(
                                    value:
                                        loadingProgress.expectedTotalBytes !=
                                                null
                                            ? loadingProgress
                                                    .cumulativeBytesLoaded /
                                                loadingProgress
                                                    .expectedTotalBytes!
                                            : null,
                                  ),
                                );
                              },
                              errorBuilder: (context, error, stackTrace) {
                                return Container(
                                  color: Colors.grey[300],
                                  child: const Center(
                                    child: Icon(
                                      Icons.broken_image,
                                      color: Colors.red,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ),
                );
              },
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  _uploadedImageUrls[index],
                  width: double.infinity,
                  height: double.infinity,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      color: Colors.grey[200],
                      child: Center(
                        child: CircularProgressIndicator(
                          value:
                              loadingProgress.expectedTotalBytes != null
                                  ? loadingProgress.cumulativeBytesLoaded /
                                      loadingProgress.expectedTotalBytes!
                                  : null,
                        ),
                      ),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: Colors.grey[300],
                      child: const Center(
                        child: Icon(Icons.broken_image, color: Colors.red),
                      ),
                    );
                  },
                ),
              ),
            ),
            if (_isEditing)
              Positioned(
                top: 4,
                right: 4,
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _uploadedImageUrls.removeAt(index);
                    });
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
    );
  }

  // Display selected images (waiting to be uploaded) in a grid
  Widget _buildSelectedImagesGrid() {
    if (_selectedImages.isEmpty) {
      return Container();
    }

    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.amber[50],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.amber),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          margin: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: Colors.amber[800], size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'These images will be uploaded when you save',
                  style: TextStyle(color: Colors.amber[800], fontSize: 12),
                ),
              ),
            ],
          ),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: _selectedImages.length,
          itemBuilder: (context, index) {
            return Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.file(
                    _selectedImages[index],
                    width: double.infinity,
                    height: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                Positioned(
                  top: 0,
                  right: 0,
                  left: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.6),
                          Colors.transparent,
                        ],
                      ),
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.file_upload_outlined,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
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
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return Scaffold(
        body: SafeArea(
          child: Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(theme.primaryColor),
            ),
          ),
        ),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
                  const SizedBox(height: 16),
                  Text(
                    'Error Loading Notes',
                    style: theme.textTheme.titleLarge?.copyWith(
                      color: Colors.red[400],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _errorMessage!,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Get.back(),
                    child: const Text('Go Back'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header section
            Container(
              padding: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Back button and title
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => Get.back(),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.black12,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.arrow_back_ios_new_rounded,
                            size: 18,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Client Notes',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'by ${widget.clientName}',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[400],
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Edit and Save Buttons
                  Row(
                    children: [
                      if (_isEditing)
                        IconButton(
                          icon: const Icon(Icons.cancel_outlined),
                          onPressed: _toggleEditMode,
                          tooltip: 'Cancel Editing',
                        ),
                      IconButton(
                        icon: Icon(
                          _isEditing
                              ? Icons.save_outlined
                              : Icons.edit_outlined,
                        ),
                        onPressed: _isEditing ? _saveChanges : _toggleEditMode,
                        tooltip: _isEditing ? 'Save Changes' : 'Edit Notes',
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Main content - moved car details inside the expanded container
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Car details - now inside the scrollable area
                      Container(
                        padding: const EdgeInsets.all(12.0),
                        decoration: BoxDecoration(
                          color: Colors.black12,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: theme.primaryColor.withOpacity(0.2),
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: theme.primaryColor.withOpacity(0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.directions_car,
                                color: theme.primaryColor,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                widget.carDetails,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Notes Section
                      Text(
                        'Notes',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: _isEditing ? _showEditNotesDialog : null,
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color:
                                _isEditing
                                    ? theme.primaryColor.withOpacity(0.05)
                                    : theme.cardColor,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color:
                                  _isEditing
                                      ? theme.primaryColor.withOpacity(0.3)
                                      : Colors.grey.withOpacity(0.2),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (_notes == null || _notes!.isEmpty)
                                Row(
                                  children: [
                                    Icon(
                                      Icons.note_alt_outlined,
                                      size: 16,
                                      color: Colors.grey[500],
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      _isEditing
                                          ? 'Tap to add notes'
                                          : 'No notes added yet',
                                      style: TextStyle(
                                        color: Colors.grey[500],
                                        fontStyle: FontStyle.italic,
                                      ),
                                    ),
                                  ],
                                )
                              else
                                Text(
                                  _notes!,
                                  style: theme.textTheme.bodyMedium,
                                ),
                              if (_isEditing && (_notes?.isNotEmpty ?? false))
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Text(
                                      'Tap to edit',
                                      style: TextStyle(
                                        color: theme.primaryColor,
                                        fontSize: 12,
                                        fontStyle: FontStyle.italic,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Requests Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Service Requests',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (_isEditing)
                            IconButton(
                              icon: const Icon(Icons.add_circle_outline),
                              onPressed: _showAddRequestDialog,
                              tooltip: 'Add Request',
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      if (_requests.isEmpty)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: theme.cardColor,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.grey.withOpacity(0.2),
                            ),
                          ),
                          child: Center(
                            child: Text(
                              'No service requests added',
                              style: TextStyle(
                                color: Colors.grey[500],
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _requests.length,
                          itemBuilder: (context, index) {
                            final request = _requests[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: ListTile(
                                leading: Icon(
                                  _getIconForRequest(request),
                                  color: theme.primaryColor,
                                ),
                                title: Text(request),
                                trailing:
                                    _isEditing
                                        ? IconButton(
                                          icon: const Icon(
                                            Icons.delete,
                                            color: Colors.red,
                                          ),
                                          onPressed:
                                              () => _removeRequest(request),
                                        )
                                        : null,
                              ),
                            );
                          },
                        ),

                      const SizedBox(height: 24),

                      // Images Section
                      Text(
                        'Uploaded Images',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _buildUploadedImagesGrid(),

                      const SizedBox(height: 24),

                      // Selected Images Section
                      // Text(
                      //   'Selected Images (Pending Upload)',
                      //   style: theme.textTheme.titleMedium?.copyWith(
                      //     fontWeight: FontWeight.bold,
                      //   ),
                      const SizedBox(height: 8),
                      _buildSelectedImagesGrid(),
                    ],
                  ),
                ),
              ),
            ),

            // Input area - only shown in edit mode
            if (_isEditing)
              SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: theme.cardColor,
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
                                icon: Icon(
                                  Icons.attach_file,
                                  color: theme.primaryColor,
                                ),
                                onPressed: _showImageSourceOptions,
                                tooltip: 'Add Images',
                              ),
                              Expanded(
                                child: TextField(
                                  controller: _customRequestController,
                                  decoration: const InputDecoration(
                                    hintText: 'Add a service request...',
                                    border: InputBorder.none,
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 16,
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

            // Save button - only shown in edit mode
            if (_isEditing)
              SafeArea(
                top: false,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : _saveChanges,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: theme.primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child:
                        _isSaving
                            ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                            : const Text(
                              'SAVE CHANGES',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
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
