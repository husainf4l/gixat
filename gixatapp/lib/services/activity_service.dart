import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../models/activity.dart';

class ActivityService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final CollectionReference _activitiesCollection = FirebaseFirestore.instance
      .collection('activity');
  final AuthController _authController = Get.find<AuthController>();

  // Create a new activity
  Future<String?> createActivity({
    required String sessionId,
    required String type,
    required String title,
    String? description,
  }) async {
    try {
      final activityData = {
        'sessionId': sessionId,
        'type': type,
        'title': title,
        'description': description,
        'timestamp': FieldValue.serverTimestamp(),
        'userId': _authController.firebaseUser?.uid,
        'userName': _authController.currentUser?.displayName,
      };

      final docRef = await _activitiesCollection.add(activityData);
      return docRef.id;
    } catch (e) {
      print('Error creating activity: $e');
      return null;
    }
  }

  // Get activities for a specific session
  Future<List<Activity>> getSessionActivities(String sessionId) async {
    try {
      final snapshot =
          await _activitiesCollection
              .where('sessionId', isEqualTo: sessionId)
              .orderBy('timestamp', descending: true)
              .get();

      return snapshot.docs
          .map(
            (doc) =>
                Activity.fromMap(doc.data() as Map<String, dynamic>, doc.id),
          )
          .toList();
    } catch (e) {
      print('Error getting session activities: $e');
      return [];
    }
  }

  // Create a status change activity
  Future<String?> createStatusChangeActivity({
    required String sessionId,
    required String oldStatus,
    required String newStatus,
  }) async {
    return createActivity(
      sessionId: sessionId,
      type: 'status_change',
      title: 'Status Changed',
      description: 'Status updated from $oldStatus to $newStatus',
    );
  }

  // Create a note activity
  Future<String?> createNoteActivity({
    required String sessionId,
    String? notes,
  }) async {
    return createActivity(
      sessionId: sessionId,
      type: 'note',
      title: 'Client Notes Added',
      description: notes,
    );
  }

  // Create an inspection activity
  Future<String?> createInspectionActivity({
    required String sessionId,
    String? description,
  }) async {
    return createActivity(
      sessionId: sessionId,
      type: 'inspection',
      title: 'Inspection Completed',
      description: description,
    );
  }

  // Create a test drive activity
  Future<String?> createTestDriveActivity({
    required String sessionId,
    String? notes,
  }) async {
    return createActivity(
      sessionId: sessionId,
      type: 'test_drive',
      title: 'Test Drive Completed',
      description: notes,
    );
  }

  // Create a job order activity
  Future<String?> createJobOrderActivity({
    required String sessionId,
    String? description,
  }) async {
    return createActivity(
      sessionId: sessionId,
      type: 'job_order',
      title: 'Job Order Created',
      description: description,
    );
  }
}
