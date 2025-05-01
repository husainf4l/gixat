import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import '../../models/session.dart';
import '../../services/report_service.dart';
import '../../widgets/detail_screen_header.dart';
import '../../widgets/notes_editor_widget.dart';
import '../../widgets/image_grid_widget.dart';
import '../sessions/session_details_screen.dart';

class ReportDetailsScreen extends StatefulWidget {
  // Required parameter - only need sessionId
  final String sessionId;

  // Optional parameter - reportId
  final String? reportId;

  const ReportDetailsScreen({
    super.key,
    required this.sessionId,
    this.reportId,
  });

  @override
  State<ReportDetailsScreen> createState() => _ReportDetailsScreenState();
}

class _ReportDetailsScreenState extends State<ReportDetailsScreen> {
  final ReportService _reportService = ReportService();
  final TextEditingController _summaryController = TextEditingController();
  final TextEditingController _recommendationsController =
      TextEditingController();
  final TextEditingController _clientPhoneController = TextEditingController();
  final TextEditingController _clientCityController = TextEditingController();
  final TextEditingController _clientCountryController =
      TextEditingController();

  // State variables
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isEditing = false;
  String? _errorMessage;

  // Session data
  Session? _session;

  // Client and car info
  String _clientName = 'Loading...';
  String _carDetails = 'Loading...'; // Used to display car details in the UI
  String _clientId = '';
  String _carId = '';

  // Report data variables
  String? _clientNotes;
  List<String> _clientRequests = [];
  List<String> _clientNotesImages = [];

  String? _inspectionNotes;
  List<String> _inspectionFindings = [];
  List<String> _inspectionImages = [];

  String? _testDriveNotes;
  List<String> _testDriveObservations = [];
  List<String> _testDriveImages = [];

  // Client and car info
  Map<String, dynamic> _clientData = {};
  Map<String, dynamic> _carData = {};

  // Rating (1-5)
  int _conditionRating = 3;

  @override
  void initState() {
    super.initState();

    // If no reportId is provided, start in edit mode for a new report
    if (widget.reportId == null) {
      _isEditing = true;
    }

    _loadSessionAndData();
  }

  @override
  void dispose() {
    _summaryController.dispose();
    _recommendationsController.dispose();
    _clientPhoneController.dispose();
    _clientCityController.dispose();
    _clientCountryController.dispose();
    super.dispose();
  }

  Future<void> _loadSessionAndData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // First, fetch the complete session data using the sessionId
      final sessionDoc =
          await FirebaseFirestore.instance
              .collection('sessions')
              .doc(widget.sessionId)
              .get();

      if (!sessionDoc.exists) {
        setState(() {
          _errorMessage = 'Session not found. Please try again.';
        });
        return;
      }

      // Create session object from the document
      final sessionData = sessionDoc.data() as Map<String, dynamic>;
      _session = Session.fromMap(sessionData, widget.sessionId);

      // Now get client and car data from their respective collections
      await _fetchClientAndCarData();

      // Then load the report data
      await _loadReportData();
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading session data: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchClientAndCarData() async {
    if (_session == null) return;

    try {
      // Get the client data from customers collection
      final clientId = _session!.client['id'];
      _clientId = clientId;

      final clientDoc =
          await FirebaseFirestore.instance
              .collection('clients')
              .doc(clientId)
              .get();

      if (clientDoc.exists) {
        _clientData = clientDoc.data() as Map<String, dynamic>;
      } else {
        // Fallback to session data
        _clientData = _session!.client;
      }

      // Get client name
      _clientName = _clientData['name'] ?? 'Unknown Client';

      // Get the car data from cars collection
      final carId = _session!.car['id'];
      _carId = carId;

      final carDoc =
          await FirebaseFirestore.instance.collection('cars').doc(carId).get();

      if (carDoc.exists) {
        _carData = carDoc.data() as Map<String, dynamic>;
      } else {
        // Fallback to session data
        _carData = _session!.car;
      }

      // Format car details string
      final carMake = _carData['make'] ?? '';
      final carModel = _carData['model'] ?? '';
      final plateNumber = _carData['plateNumber'] ?? '';
      _carDetails =
          '$carMake $carModel ${plateNumber.isNotEmpty ? '• $plateNumber' : ''}';

      // Set form field values
      _clientPhoneController.text = _clientData['phone'] ?? '';

      // Handle nested address fields
      if (_clientData.containsKey('address') && _clientData['address'] is Map) {
        Map<String, dynamic> address =
            _clientData['address'] as Map<String, dynamic>;
        _clientCityController.text = address['city'] ?? '';
        _clientCountryController.text = address['country'] ?? '';
      } else {
        // Fallback to direct properties if address map doesn't exist
        _clientCityController.text = _clientData['city'] ?? '';
        _clientCountryController.text = _clientData['country'] ?? '';
      }
    } catch (e) {
      debugPrint('Error fetching client/car data: $e');
      // Fallback to session data if there's an error
      _clientData = _session!.client;
      _carData = _session!.car;
      _clientName = _clientData['name'] ?? 'Unknown Client';

      final carMake = _carData['make'] ?? '';
      final carModel = _carData['model'] ?? '';
      final plateNumber = _carData['plateNumber'] ?? '';
      _carDetails =
          '$carMake $carModel ${plateNumber.isNotEmpty ? '• $plateNumber' : ''}';
    }
  }

  Future<void> _loadReportData() async {
    if (_session == null) return;

    try {
      // Load existing report if reportId exists
      if (widget.reportId != null) {
        final reportData = await _reportService.getReport(widget.reportId!);
        if (reportData != null) {
          setState(() {
            // Set controllers
            _summaryController.text = reportData['summary'] ?? '';
            _recommendationsController.text =
                reportData['recommendations'] ?? '';

            // Set other report fields
            _conditionRating = reportData['conditionRating'] ?? 3;
            _clientNotes = reportData['clientNotes'];
            _inspectionNotes = reportData['inspectionNotes'];
            _testDriveNotes = reportData['testDriveNotes'];

            // Set lists
            if (reportData['clientRequests'] != null) {
              _clientRequests = List<String>.from(reportData['clientRequests']);
            }
            if (reportData['inspectionFindings'] != null) {
              _inspectionFindings = List<String>.from(
                reportData['inspectionFindings'],
              );
            }
            if (reportData['testDriveObservations'] != null) {
              _testDriveObservations = List<String>.from(
                reportData['testDriveObservations'],
              );
            }

            // Set images
            if (reportData['clientNotesImages'] != null) {
              _clientNotesImages = List<String>.from(
                reportData['clientNotesImages'],
              );
            }
            if (reportData['inspectionImages'] != null) {
              _inspectionImages = List<String>.from(
                reportData['inspectionImages'],
              );
            }
            if (reportData['testDriveImages'] != null) {
              _testDriveImages = List<String>.from(
                reportData['testDriveImages'],
              );
            }
          });
          return;
        }
      }

      // If no existing report or failed to load, gather data from source records
      // Load client notes data if it exists
      if (_session!.clientNoteId != null) {
        final clientNotesData = await _reportService.getClientNotes(
          _session!.clientNoteId!,
        );
        if (clientNotesData != null) {
          setState(() {
            _clientNotes = clientNotesData['notes'];
            if (clientNotesData['requests'] != null) {
              _clientRequests = List<String>.from(clientNotesData['requests']);
            }
            if (clientNotesData['images'] != null) {
              _clientNotesImages = List<String>.from(clientNotesData['images']);
            }
          });
        }
      }

      // Load inspection data if it exists
      if (_session!.inspectionId != null) {
        final inspectionData = await _reportService.getInspection(
          _session!.inspectionId!,
        );
        if (inspectionData != null) {
          setState(() {
            _inspectionNotes = inspectionData['notes'];
            if (inspectionData['findings'] != null) {
              _inspectionFindings = List<String>.from(
                inspectionData['findings'],
              );
            }
            if (inspectionData['images'] != null) {
              _inspectionImages = List<String>.from(inspectionData['images']);
            }
          });
        }
      }

      // Load test drive data if it exists
      if (_session!.testDriveId != null) {
        final testDriveData = await _reportService.getTestDrive(
          _session!.testDriveId!,
        );
        if (testDriveData != null) {
          setState(() {
            _testDriveNotes = testDriveData['notes'];
            if (testDriveData['observations'] != null) {
              _testDriveObservations = List<String>.from(
                testDriveData['observations'],
              );
            }
            if (testDriveData['images'] != null) {
              _testDriveImages = List<String>.from(testDriveData['images']);
            }
          });
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading report data: $e';
      });
    }
  }

  void _toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
    });
  }

  void _showEditClientNotesDialog() {
    NotesEditorWidget.showEditDialog(
      context,
      initialValue: _clientNotes ?? '',
      onSave: (value) {
        if (mounted) {
          setState(() {
            _clientNotes = value;
          });
        }
      },
    );
  }

  void _showEditInspectionNotesDialog() {
    NotesEditorWidget.showEditDialog(
      context,
      initialValue: _inspectionNotes ?? '',
      onSave: (value) {
        if (mounted) {
          setState(() {
            _inspectionNotes = value;
          });
        }
      },
    );
  }

  void _showEditTestDriveNotesDialog() {
    NotesEditorWidget.showEditDialog(
      context,
      initialValue: _testDriveNotes ?? '',
      onSave: (value) {
        if (mounted) {
          setState(() {
            _testDriveNotes = value;
          });
        }
      },
    );
  }

  Future<void> _saveChanges() async {
    if (!mounted) return;

    // Validate required IDs
    if (_clientId.isEmpty || _carId.isEmpty) {
      Get.snackbar(
        'Error',
        'Missing required client or car information',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    try {
      // Update client data with form fields
      _clientData['phone'] = _clientPhoneController.text;

      // Handle address structure properly
      if (!_clientData.containsKey('address')) {
        _clientData['address'] = {};
      }

      if (_clientData['address'] is! Map) {
        _clientData['address'] = {};
      }

      // Update the address map
      (_clientData['address'] as Map<String, dynamic>)['city'] =
          _clientCityController.text;
      (_clientData['address'] as Map<String, dynamic>)['country'] =
          _clientCountryController.text;

      // Create report data
      final Map<String, dynamic> reportData = {
        'summary': _summaryController.text,
        'recommendations': _recommendationsController.text,
        'conditionRating': _conditionRating,
        'clientNotes': _clientNotes,
        'inspectionNotes': _inspectionNotes,
        'testDriveNotes': _testDriveNotes,
        'clientRequests': _clientRequests,
        'inspectionFindings': _inspectionFindings,
        'testDriveObservations': _testDriveObservations,
        'clientNotesImages': _clientNotesImages,
        'inspectionImages': _inspectionImages,
        'testDriveImages': _testDriveImages,
      };

      String reportId = widget.reportId ?? '';

      if (reportId.isEmpty) {
        // Create new report
        reportId = await _reportService.saveReport(
          sessionId: widget.sessionId,
          carId: _carId,
          clientId: _clientId,
          clientData: _clientData,
          carData: _carData,
          reportData: reportData,
        );

        // Update session with the new report ID
        await FirebaseFirestore.instance
            .collection('sessions')
            .doc(widget.sessionId)
            .update({
              'reportId': reportId,
              'status': 'REPORTED', // Update session status as reported
              'updatedAt': DateTime.now(),
            });
      } else {
        // Update existing report
        await _reportService.updateReport(
          reportId: reportId,
          sessionId: widget.sessionId,
          clientData: _clientData,
          carData: _carData,
          reportData: reportData,
        );
      }

      Get.snackbar(
        'Success',
        'Report saved successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );

      // Navigate directly back to the session details screen with updated session data
      final sessionDoc =
          await FirebaseFirestore.instance
              .collection('sessions')
              .doc(widget.sessionId)
              .get();

      if (sessionDoc.exists) {
        final sessionData = sessionDoc.data() as Map<String, dynamic>;
        // Create Session object with both the map and ID
        final session = Session.fromMap(sessionData, widget.sessionId);
        // Navigate to session details with updated session
        Get.off(() => SessionDetailsScreen(session: session));
      } else {
        // If session doesn't exist for some reason, just go back
        Get.back(result: {'refresh': true});
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error saving report: $e';
      });

      Get.snackbar(
        'Error',
        'Failed to save report: ${e.toString()}',
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
                    'Error Loading Report',
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
            // Header with the reusable DetailScreenHeader widget
            DetailScreenHeader(
              title:
                  widget.reportId == null
                      ? 'New Vehicle Report'
                      : 'Vehicle Report',
              subtitle: _clientName,
              isEditing: _isEditing,
              isSaving: _isSaving,
              onSavePressed: _saveChanges,
              onEditPressed: _toggleEditMode,
              onCancelPressed: widget.reportId == null ? null : _toggleEditMode,
            ),

            // Main content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Report Date
                    Container(
                      padding: const EdgeInsets.symmetric(
                        vertical: 8,
                        horizontal: 16,
                      ),
                      decoration: BoxDecoration(
                        color: theme.primaryColor.withAlpha(26),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Report Date:',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            DateFormat('MMM dd, yyyy').format(DateTime.now()),
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Client Information Section
                    Text(
                      'Client Information',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.black12,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: theme.primaryColor.withAlpha(51),
                        ),
                      ),
                      child: Column(
                        children: [
                          // Client name (non-editable)
                          InfoRow(
                            label: 'Name',
                            value: _clientData['name'] ?? '',
                            isEditing: false,
                          ),

                          const SizedBox(height: 12),

                          // Phone (editable)
                          _isEditing
                              ? TextFieldRow(
                                label: 'Phone',
                                controller: _clientPhoneController,
                              )
                              : InfoRow(
                                label: 'Phone',
                                value: _clientPhoneController.text,
                                isEditing: false,
                              ),

                          const SizedBox(height: 12),

                          // City (editable)
                          _isEditing
                              ? TextFieldRow(
                                label: 'City',
                                controller: _clientCityController,
                              )
                              : InfoRow(
                                label: 'City',
                                value: _clientCityController.text,
                                isEditing: false,
                              ),

                          const SizedBox(height: 12),

                          // Country (editable)
                          _isEditing
                              ? TextFieldRow(
                                label: 'Country',
                                controller: _clientCountryController,
                              )
                              : InfoRow(
                                label: 'Country',
                                value: _clientCountryController.text,
                                isEditing: false,
                              ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Car Information Section
                    Text(
                      'Vehicle Information',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _carDetails,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.black12,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: theme.primaryColor.withAlpha(51),
                        ),
                      ),
                      child: Column(
                        children: [
                          // Make
                          InfoRow(
                            label: 'Make',
                            value: _carData['make'] ?? '',
                            isEditing: false,
                          ),

                          const SizedBox(height: 12),

                          // Model
                          InfoRow(
                            label: 'Model',
                            value: _carData['model'] ?? '',
                            isEditing: false,
                          ),

                          const SizedBox(height: 12),

                          // Year
                          InfoRow(
                            label: 'Year',
                            value:
                                _carData['year'] != null
                                    ? _carData['year'].toString()
                                    : '',
                            isEditing: false,
                          ),

                          const SizedBox(height: 12),

                          // Plate number
                          InfoRow(
                            label: 'Plate Number',
                            value: _carData['plateNumber'] ?? '',
                            isEditing: false,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Condition Rating
                    Text(
                      'Vehicle Condition Rating',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),

                    _isEditing
                        ? Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(5, (index) {
                            final rating = index + 1;
                            return GestureDetector(
                              onTap: () {
                                setState(() {
                                  _conditionRating = rating;
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8,
                                  horizontal: 16,
                                ),
                                decoration: BoxDecoration(
                                  color:
                                      rating == _conditionRating
                                          ? theme.primaryColor
                                          : Colors.black12,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color:
                                        rating == _conditionRating
                                            ? theme.primaryColor
                                            : Colors.grey.withAlpha(77),
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  rating.toString(),
                                  style: TextStyle(
                                    color:
                                        rating == _conditionRating
                                            ? Colors.black
                                            : Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            );
                          }),
                        )
                        : Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.black12,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: theme.primaryColor.withAlpha(51),
                            ),
                          ),
                          child: Row(
                            children: [
                              Text(
                                'Rating: ',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                '$_conditionRating / 5',
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: _getRatingColor(_conditionRating),
                                ),
                              ),
                              Text(
                                ' (${_getRatingText(_conditionRating)})',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: Colors.white70,
                                ),
                              ),
                            ],
                          ),
                        ),

                    const SizedBox(height: 8),
                    Text(
                      '1 = Poor, 5 = Excellent',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.grey[500],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Report Summary
                    Text(
                      'Summary',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _isEditing
                        ? TextField(
                          controller: _summaryController,
                          maxLines: 5,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.black12,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.grey.withAlpha(77),
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.grey.withAlpha(77),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: theme.primaryColor),
                            ),
                            hintText:
                                'Enter a summary of the vehicle inspection',
                            hintStyle: TextStyle(color: Colors.grey[500]),
                          ),
                        )
                        : Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.black12,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: theme.primaryColor.withAlpha(51),
                            ),
                          ),
                          child: Text(
                            _summaryController.text.isNotEmpty
                                ? _summaryController.text
                                : 'No summary provided',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color:
                                  _summaryController.text.isNotEmpty
                                      ? Colors.white
                                      : Colors.grey[500],
                              fontStyle:
                                  _summaryController.text.isNotEmpty
                                      ? FontStyle.normal
                                      : FontStyle.italic,
                            ),
                          ),
                        ),

                    const SizedBox(height: 24),

                    // Recommendations
                    Text(
                      'Recommendations',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _isEditing
                        ? TextField(
                          controller: _recommendationsController,
                          maxLines: 5,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: Colors.black12,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.grey.withAlpha(77),
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.grey.withAlpha(77),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: theme.primaryColor),
                            ),
                            hintText:
                                'Enter your recommendations for the vehicle',
                            hintStyle: TextStyle(color: Colors.grey[500]),
                          ),
                        )
                        : Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.black12,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: theme.primaryColor.withAlpha(51),
                            ),
                          ),
                          child: Text(
                            _recommendationsController.text.isNotEmpty
                                ? _recommendationsController.text
                                : 'No recommendations provided',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color:
                                  _recommendationsController.text.isNotEmpty
                                      ? Colors.white
                                      : Colors.grey[500],
                              fontStyle:
                                  _recommendationsController.text.isNotEmpty
                                      ? FontStyle.normal
                                      : FontStyle.italic,
                            ),
                          ),
                        ),

                    const SizedBox(height: 24),

                    // Client Notes Section
                    if (_clientNotes != null ||
                        _clientNotesImages.isNotEmpty) ...[
                      Text(
                        'Client Notes',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Notes
                      if (_clientNotes != null && _clientNotes!.isNotEmpty) ...[
                        NotesEditorWidget(
                          notes: _clientNotes,
                          isEditing: _isEditing,
                          onEditPressed: _showEditClientNotesDialog,
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Images
                      if (_clientNotesImages.isNotEmpty) ...[
                        Text(
                          'Client Notes Images',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ImageGridWidget(
                          uploadedImageUrls: _clientNotesImages,
                          selectedImages: const [],
                          isEditing: false,
                        ),
                        const SizedBox(height: 16),
                      ],

                      const SizedBox(height: 16),
                    ],

                    // Inspection Section
                    if (_inspectionNotes != null ||
                        _inspectionImages.isNotEmpty) ...[
                      Text(
                        'Inspection Details',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Notes
                      if (_inspectionNotes != null &&
                          _inspectionNotes!.isNotEmpty) ...[
                        NotesEditorWidget(
                          notes: _inspectionNotes,
                          isEditing: _isEditing,
                          onEditPressed: _showEditInspectionNotesDialog,
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Images
                      if (_inspectionImages.isNotEmpty) ...[
                        Text(
                          'Inspection Images',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ImageGridWidget(
                          uploadedImageUrls: _inspectionImages,
                          selectedImages: const [],
                          isEditing: false,
                        ),
                        const SizedBox(height: 16),
                      ],

                      const SizedBox(height: 16),
                    ],

                    // Test Drive Section
                    if (_testDriveNotes != null ||
                        _testDriveImages.isNotEmpty) ...[
                      Text(
                        'Test Drive Results',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Notes
                      if (_testDriveNotes != null &&
                          _testDriveNotes!.isNotEmpty) ...[
                        NotesEditorWidget(
                          notes: _testDriveNotes,
                          isEditing: _isEditing,
                          onEditPressed: _showEditTestDriveNotesDialog,
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Images
                      if (_testDriveImages.isNotEmpty) ...[
                        Text(
                          'Test Drive Images',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ImageGridWidget(
                          uploadedImageUrls: _testDriveImages,
                          selectedImages: const [],
                          isEditing: false,
                        ),
                        const SizedBox(height: 16),
                      ],

                      const SizedBox(height: 16),
                    ],

                    // Client Requests Section
                    if (_clientRequests.isNotEmpty) ...[
                      Text(
                        'Client Service Requests',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _clientRequests.length,
                        itemBuilder: (context, index) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black12,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: theme.primaryColor.withAlpha(26),
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.build,
                                  size: 20,
                                  color: theme.primaryColor,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    _clientRequests[index],
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Inspection Findings Section
                    if (_inspectionFindings.isNotEmpty ||
                        _testDriveObservations.isNotEmpty) ...[
                      Text(
                        'Inspection Findings',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Inspection Findings
                      if (_inspectionFindings.isNotEmpty) ...[
                        Text(
                          'Vehicle Inspection',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _inspectionFindings.length,
                          itemBuilder: (context, index) {
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black12,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: theme.primaryColor.withAlpha(26),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.search,
                                    size: 20,
                                    color: theme.primaryColor,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      _inspectionFindings[index],
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(color: Colors.white),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Test Drive Observations
                      if (_testDriveObservations.isNotEmpty) ...[
                        Text(
                          'Test Drive Observations',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _testDriveObservations.length,
                          itemBuilder: (context, index) {
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black12,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: theme.primaryColor.withAlpha(26),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.directions_car,
                                    size: 20,
                                    color: theme.primaryColor,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      _testDriveObservations[index],
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(color: Colors.white),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 16),
                      ],
                    ],

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getRatingColor(int rating) {
    if (rating <= 1) {
      return Colors.red;
    } else if (rating <= 2) {
      return Colors.orange;
    } else if (rating <= 3) {
      return Colors.yellow;
    } else if (rating <= 4) {
      return Colors.lightGreen;
    } else {
      return Colors.green;
    }
  }

  String _getRatingText(int rating) {
    if (rating <= 1) {
      return 'Poor';
    } else if (rating <= 2) {
      return 'Fair';
    } else if (rating <= 3) {
      return 'Average';
    } else if (rating <= 4) {
      return 'Good';
    } else {
      return 'Excellent';
    }
  }
}

// Helper widget for displaying information rows in non-edit mode
class InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isEditing;

  const InfoRow({
    super.key,
    required this.label,
    required this.value,
    this.isEditing = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: TextStyle(
              color: Colors.grey[400],
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value.isNotEmpty ? value : 'Not provided',
            style: TextStyle(
              color: value.isNotEmpty ? Colors.white : Colors.grey[600],
              fontWeight: FontWeight.w500,
              fontStyle: value.isNotEmpty ? FontStyle.normal : FontStyle.italic,
            ),
          ),
        ),
      ],
    );
  }
}

// Helper widget for text field rows in edit mode
class TextFieldRow extends StatelessWidget {
  final String label;
  final TextEditingController controller;

  const TextFieldRow({
    super.key,
    required this.label,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: TextStyle(
              color: Colors.grey[400],
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: TextField(
            controller: controller,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
              filled: true,
              fillColor: Colors.black12,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey.withAlpha(77)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey.withAlpha(77)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Theme.of(context).primaryColor),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
