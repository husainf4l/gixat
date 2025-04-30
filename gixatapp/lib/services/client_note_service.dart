import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/client_note.dart';

class ClientNoteService {
  final CollectionReference _jobCardCollection = FirebaseFirestore.instance
      .collection('jobCard');

  // Create a new client note
  Future<String?> createClientNote({
    required String clientId,
    required String carId,
    required String garageId,
    required String sessionId,
    required String notes,
    required List<String> clientRequests,
  }) async {
    try {
      final clientNote = ClientNote(
        id: '',
        clientId: clientId,
        carId: carId,
        garageId: garageId,
        sessionId: sessionId,
        notes: notes,
        clientRequests: clientRequests,
        createdAt: DateTime.now(),
      );

      // Add type field to identify this as a client note
      final Map<String, dynamic> noteData = clientNote.toMap();
      noteData['type'] = 'clientNotes';

      final docRef = await _jobCardCollection.add(noteData);
      return docRef.id;
    } catch (e) {
      print('Error creating client note: $e');
      return null;
    }
  }
}
