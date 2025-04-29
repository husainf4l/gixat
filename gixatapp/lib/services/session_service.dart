import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/session.dart';

class SessionService {
  final CollectionReference _sessionsCollection = FirebaseFirestore.instance
      .collection('sessions');

  // Create a new session
  Future<String?> createSession({
    required String clientId,
    required String carId,
    required String garageId,
  }) async {
    try {
      final Map<String, dynamic> sessionData = {
        'clientId': clientId,
        'carId': carId,
        'garageId': garageId,
        'status': 'OPEN',
        'createdAt': FieldValue.serverTimestamp(),
      };

      final docRef = await _sessionsCollection.add(sessionData);
      return docRef.id;
    } catch (e) {
      print('Error creating session: $e');
      return null;
    }
  }

  // Update session with client note ID
  Future<bool> updateSessionWithClientNote({
    required String sessionId,
    required String clientNoteId,
  }) async {
    try {
      await _sessionsCollection.doc(sessionId).update({
        'clientNoteId': clientNoteId,
        'updatedAt': FieldValue.serverTimestamp(),
      });
      return true;
    } catch (e) {
      print('Error updating session: $e');
      return false;
    }
  }
}
