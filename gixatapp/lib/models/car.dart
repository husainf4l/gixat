class Car {
  final String id;
  final String make;
  final String model;
  final int year;
  final String plateNumber;
  final String vin;
  final String clientId;
  final String garageId;
  final List<String> sessions; // IDs of service sessions

  Car({
    required this.id,
    required this.make,
    required this.model,
    required this.year,
    required this.plateNumber,
    this.vin = '', // Optional VIN number
    required this.clientId,
    required this.garageId,
    this.sessions = const [], // Default to empty list
  });

  Map<String, dynamic> toMap() {
    return {
      'make': make,
      'model': model,
      'year': year,
      'plateNumber': plateNumber,
      'vin': vin,
      'clientId': clientId,
      'garageId': garageId,
      'sessions': sessions,
    };
  }

  factory Car.fromMap(Map<String, dynamic> map, String id) {
    return Car(
      id: id,
      make: map['make'] ?? '',
      model: map['model'] ?? '',
      year: map['year'] ?? 0,
      plateNumber: map['plateNumber'] ?? '',
      vin: map['vin'] ?? '',
      clientId: map['clientId'] ?? '',
      garageId: map['garageId'] ?? '',
      sessions: List<String>.from(map['sessions'] ?? []),
    );
  }

  // Add copyWith method for easier updates
  Car copyWith({
    String? id,
    String? make,
    String? model,
    int? year,
    String? plateNumber,
    String? vin,
    String? clientId,
    String? garageId,
    List<String>? sessions,
  }) {
    return Car(
      id: id ?? this.id,
      make: make ?? this.make,
      model: model ?? this.model,
      year: year ?? this.year,
      plateNumber: plateNumber ?? this.plateNumber,
      vin: vin ?? this.vin,
      clientId: clientId ?? this.clientId,
      garageId: garageId ?? this.garageId,
      sessions: sessions ?? this.sessions,
    );
  }

  // Add a method to add a session to the car
  Car addSession(String sessionId) {
    final updatedSessions = List<String>.from(sessions);
    updatedSessions.add(sessionId);
    return copyWith(sessions: updatedSessions);
  }
}
