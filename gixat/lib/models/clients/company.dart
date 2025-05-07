class Company {
  final String name;
  final String trn; // Tax Registration Number

  Company({required this.name, this.trn = ''});

  // Factory constructor to create a Company from Firebase document
  factory Company.fromFirestore(Map<String, dynamic> data) {
    return Company(name: data['name'] ?? '', trn: data['trn'] ?? '');
  }

  // Convert Company to Map for Firebase
  Map<String, dynamic> toFirestore() {
    return {'name': name, 'trn': trn};
  }
}
