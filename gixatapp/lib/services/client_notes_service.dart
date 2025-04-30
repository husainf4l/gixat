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
      print("DEBUG ClientNotesService: Starting saveClientNote");
      print(
        "DEBUG ClientNotesService: sessionId=$sessionId, carId=$carId, clientId=$clientId",
      );
      print("DEBUG ClientNotesService: notes length=${notes.length}");
      print("DEBUG ClientNotesService: requests count=${requests.length}");
      print("DEBUG ClientNotesService: images count=${images.length}");
      print("DEBUG ClientNotesService: images type=${images.runtimeType}");

      // Debug print all image URLs
      for (int i = 0; i < images.length; i++) {
        print("DEBUG ClientNotesService: image[$i]=${images[i]}");
      }

      // Create a fresh copy of the images list to avoid reference issues
      final List<String> validImages = [];
      for (String url in images) {
        if (url.trim().isNotEmpty) {
          validImages.add(url);
        }
      }

      print(
        "DEBUG ClientNotesService: validImages count=${validImages.length}",
      );

      // Prepare the data for Firestore
      final Map<String, dynamic> clientNoteData = {
        'sessionId': sessionId,
        'carId': carId,
        'clientId': clientId,
        'notes': notes,
        'requests': requests,
        'createdAt': FieldValue.serverTimestamp(),
      };

      // Only add images if there are any valid ones
      if (validImages.isNotEmpty) {
        clientNoteData['images'] = validImages;
      }

      print("DEBUG ClientNotesService: About to add document to Firestore");

      // Save the client note document
      final docRef = await _clientNotesCollection.add(clientNoteData);
      print(
        "DEBUG ClientNotesService: Document added successfully with ID: ${docRef.id}",
      );

      // Create activity record for the client note creation
      await _activityCollection.add({
        'sessionId': sessionId,
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

      print("DEBUG ClientNotesService: Activity record created successfully");
      print("DEBUG ClientNotesService: saveClientNote completed successfully");

      return docRef.id;
    } catch (e) {
      print("DEBUG ERROR ClientNotesService: Error saving client note: $e");
      if (e is FirebaseException) {
        print("DEBUG FIREBASE ERROR: code=${e.code}, message=${e.message}");
      }
      return null;
    }
  }

  // Get client notes for a specific session
  Future<Map<String, dynamic>?> getClientNotesForSession(
    String sessionId,
  ) async {
    try {
      print("DEBUG ClientNotesService: Getting notes for session: $sessionId");
      final snapshot =
          await _clientNotesCollection
              .where('sessionId', isEqualTo: sessionId)
              .get();

      print(
        "DEBUG ClientNotesService: Found ${snapshot.docs.length} client notes for session",
      );

      if (snapshot.docs.isNotEmpty) {
        final doc = snapshot.docs.first;
        final data = doc.data() as Map<String, dynamic>;

        if (data.containsKey('images')) {
          print(
            "DEBUG ClientNotesService: Found images in client notes: ${data['images']}",
          );
          print(
            "DEBUG ClientNotesService: Images type: ${data['images'].runtimeType}",
          );
          print(
            "DEBUG ClientNotesService: Images count: ${(data['images'] as List).length}",
          );
        } else {
          print("DEBUG ClientNotesService: No images found in client notes");
        }

        return {'id': doc.id, ...data};
      }
      return null;
    } catch (e) {
      print("DEBUG ERROR ClientNotesService: Error getting client notes: $e");
      return null;
    }
  }

  // Update an existing client note
  Future<bool> updateClientNote({
    required String clientNoteId,
    required String notes,
    required List<String> requests,
    List<String>? images,
  }) async {
    try {
      print(
        "DEBUG ClientNotesService: Starting updateClientNote for ID: $clientNoteId",
      );
      print("DEBUG ClientNotesService: notes length=${notes.length}");
      print("DEBUG ClientNotesService: requests count=${requests.length}");

      if (images != null) {
        print("DEBUG ClientNotesService: images count=${images.length}");
        print("DEBUG ClientNotesService: images type=${images.runtimeType}");

        // Debug print all image URLs
        for (int i = 0; i < images.length; i++) {
          print("DEBUG ClientNotesService: image[$i]=${images[i]}");
        }
      } else {
        print("DEBUG ClientNotesService: No images provided");
      }

      final updateData = {
        'notes': notes,
        'requests': requests,
        'updatedAt': FieldValue.serverTimestamp(),
      };

      if (images != null && images.isNotEmpty) {
        // Create a fresh copy of the images list with only valid URLs
        final List<String> validImages = [];
        for (String url in images) {
          if (url.trim().isNotEmpty) {
            validImages.add(url);
          }
        }

        if (validImages.isNotEmpty) {
          updateData['images'] = validImages;
          print(
            "DEBUG ClientNotesService: Adding ${validImages.length} valid images to update",
          );
        } else {
          print("DEBUG ClientNotesService: No valid images to update");
        }
      }

      print("DEBUG ClientNotesService: About to update document in Firestore");
      await _clientNotesCollection.doc(clientNoteId).update(updateData);
      print("DEBUG ClientNotesService: Document updated successfully");

      // Get the session ID for activity logging
      final noteDoc = await _clientNotesCollection.doc(clientNoteId).get();
      if (noteDoc.exists) {
        final noteData = noteDoc.data() as Map<String, dynamic>;
        final sessionId = noteData['sessionId'] as String?;

        if (sessionId != null) {
          // Create activity record for the note update
          await _activityCollection.add({
            'sessionId': sessionId,
            'clientNoteId': clientNoteId,
            'timestamp': FieldValue.serverTimestamp(),
            'type': 'note_update',
            'title': 'Client Notes Updated',
            'description':
                notes.isNotEmpty
                    ? 'Notes: $notes'
                    : 'Client requests were updated',
            'userId': _authController?.firebaseUser?.uid,
            'userName': _authController?.currentUser?.displayName,
          });
          print(
            "DEBUG ClientNotesService: Activity record created successfully",
          );
        }
      }

      print(
        "DEBUG ClientNotesService: updateClientNote completed successfully",
      );
      return true;
    } catch (e) {
      print("DEBUG ERROR ClientNotesService: Error updating client note: $e");
      if (e is FirebaseException) {
        print("DEBUG FIREBASE ERROR: code=${e.code}, message=${e.message}");
      }
      return false;
    }
  }
}
