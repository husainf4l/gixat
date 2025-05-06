import 'package:cloud_firestore/cloud_firestore.dart';

class GixatUser {
  final String uid;
  final String email;
  final String displayName;
  final String? photoURL;
  final String? phoneNumber;
  final String? garageId; // Garage identifier
  final String role; // User role within the system
  final bool emailVerified;
  final Timestamp createdAt;
  final Timestamp lastSignInAt;
  final Map<String, dynamic>? metadata;

  GixatUser({
    required this.uid,
    required this.email,
    required this.displayName,
    this.photoURL,
    this.phoneNumber,
    this.garageId,
    this.role = 'user', // Default role is 'user'
    required this.emailVerified,
    required this.createdAt,
    required this.lastSignInAt,
    this.metadata,
  });

  // Create from Firebase User and Firestore data
  factory GixatUser.fromFirebase({
    required Map<String, dynamic> userData,
    required String uid,
  }) {
    return GixatUser(
      uid: uid,
      email: userData['email'] ?? '',
      displayName: userData['displayName'] ?? '',
      photoURL: userData['photoURL'],
      phoneNumber: userData['phoneNumber'],
      garageId: userData['garageId'],
      role: userData['role'] ?? 'user',
      emailVerified: userData['emailVerified'] ?? false,
      createdAt: userData['createdAt'] ?? Timestamp.now(),
      lastSignInAt: userData['lastSignInAt'] ?? Timestamp.now(),
      metadata: userData['metadata'],
    );
  }

  // Convert to Map for Firestore
  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'email': email,
      'displayName': displayName,
      'photoURL': photoURL,
      'phoneNumber': phoneNumber,
      'garageId': garageId,
      'role': role,
      'emailVerified': emailVerified,
      'createdAt': createdAt,
      'lastSignInAt': lastSignInAt,
      'metadata': metadata,
    };
  }

  // Create a copy of the user with modified fields
  GixatUser copyWith({
    String? uid,
    String? email,
    String? displayName,
    String? photoURL,
    String? phoneNumber,
    String? garageId,
    String? role,
    bool? emailVerified,
    Timestamp? createdAt,
    Timestamp? lastSignInAt,
    Map<String, dynamic>? metadata,
  }) {
    return GixatUser(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoURL: photoURL ?? this.photoURL,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      garageId: garageId ?? this.garageId,
      role: role ?? this.role,
      emailVerified: emailVerified ?? this.emailVerified,
      createdAt: createdAt ?? this.createdAt,
      lastSignInAt: lastSignInAt ?? this.lastSignInAt,
      metadata: metadata ?? this.metadata,
    );
  }

  // Convert Firestore document to GixatUser
  static GixatUser fromDocument(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return GixatUser.fromFirebase(userData: data, uid: doc.id);
  }
}
