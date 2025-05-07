class Address {
  final String? street;
  final String city;
  final String country;

  Address({this.street, required this.city, required this.country});

  // Factory constructor to create an Address from Firebase document
  factory Address.fromFirestore(Map<String, dynamic> data) {
    return Address(
      street: data['street'],
      city: data['city'] ?? '',
      country: data['country'] ?? '',
    );
  }

  // Convert Address to Map for Firebase
  Map<String, dynamic> toFirestore() {
    return {'street': street, 'city': city, 'country': country};
  }
}
