class Session {
  final String id;
  final String clientId;
  final String carId;
  final String garageId;
  final String status; // OPEN, IN_PROGRESS, COMPLETED, etc.
  final String? clientNoteId;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Session({
    required this.id,
    required this.clientId,
    required this.carId,
    required this.garageId,
    required this.status,
    this.clientNoteId,
    this.createdAt,
    this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'clientId': clientId,
      'carId': carId,
      'garageId': garageId,
      'status': status,
      'clientNoteId': clientNoteId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  factory Session.fromMap(Map<String, dynamic> map, String id) {
    return Session(
      id: id,
      clientId: map['clientId'] ?? '',
      carId: map['carId'] ?? '',
      garageId: map['garageId'] ?? '',
      status: map['status'] ?? 'UNKNOWN',
      clientNoteId: map['clientNoteId'],
      createdAt: map['createdAt']?.toDate(),
      updatedAt: map['updatedAt']?.toDate(),
    );
  }
}
