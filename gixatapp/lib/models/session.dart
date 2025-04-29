class Session {
  final String id;
  final Map<String, dynamic> car; // Nested car object
  final Map<String, dynamic> client; // Nested client object
  final String garageId;
  final String status; // OPEN, IN_PROGRESS, COMPLETED, etc.
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Session({
    required this.id,
    required this.car,
    required this.client,
    required this.garageId,
    required this.status,
    this.createdAt,
    this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'car': car,
      'client': client,
      'garageId': garageId,
      'status': status,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  factory Session.fromMap(Map<String, dynamic> map, String id) {
    return Session(
      id: id,
      car: map['car'] ?? {},
      client: map['client'] ?? {},
      garageId: map['garageId'] ?? '',
      status: map['status'] ?? 'UNKNOWN',
      createdAt: map['createdAt']?.toDate(),
      updatedAt: map['updatedAt']?.toDate(),
    );
  }

  bool isClosed() {
    return status == 'CLOSED';
  }
}
