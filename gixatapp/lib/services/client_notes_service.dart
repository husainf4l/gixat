import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';

class ClientNotesService {
  final CollectionReference _clientNotesCollection = FirebaseFirestore.instance
      .collection('clientNotes');
  final CollectionReference _activityCollection = FirebaseFirestore.instance
      .collection('activity');

  // Try to get the AuthController if it's available
  final AuthController? _authController =
      Get.isRegistered<AuthController>() ? Get.find<AuthController>() : null;

  Future<String?> saveClientNote({
    required String sessionId,
    required String carId,
    required String clientId,
    required String notes,
    required List<String> requests,
    required List<String> images,
  }) async {
    try {
      // Save the client note document
      final docRef = await _clientNotesCollection.add({
        'sessionId': sessionId,
        'carId': carId,
        'clientId': clientId,
        'notes': notes,
        'requests': requests,
        'images': images,
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Create activity record for the client note creation - with consistent field names
      await _activityCollection.add({
        'sessionId': sessionId, // Make sure this matches exactly
        'clientNoteId': docRef.id,
        'timestamp': FieldValue.serverTimestamp(),
        'type': 'note',
        'title': 'Client Notes Added',
        'description':
            notes.isNotEmpty
                ? 'Notes: $notes'
                : 'Client requests and notes were added',
        'userId': _authController?.firebaseUser?.uid,
        'userName': _authController?.currentUser?.displayName,
      });

      // For debugging - also create an alternative format just in case
      print('Creating client note activity for session ID: $sessionId');

      return docRef.id;
    } catch (e) {
      print('Error saving client note: $e');
      return null;
    }
  }

  // Get client notes for a specific session
  Future<Map<String, dynamic>?> getClientNotesForSession(
    String sessionId,
  ) async {
    try {
      final snapshot =
          await _clientNotesCollection
              .where('sessionId', isEqualTo: sessionId)
              .get();

      if (snapshot.docs.isNotEmpty) {
        final doc = snapshot.docs.first;
        final data = doc.data() as Map<String, dynamic>;
        return {'id': doc.id, ...data};
      }
      return null;
    } catch (e) {
      print('Error getting client notes: $e');
      return null;
    }
  }
}
