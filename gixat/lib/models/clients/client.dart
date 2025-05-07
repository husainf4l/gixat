import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:gixat/models/clients/address.dart';
import 'package:gixat/models/clients/company.dart';

class Client {
  final String? id;
  final String name;
  final String phoneNumber;
  final Address address;
  final bool isCompany;
  final Company? company;
  final DateTime? createdAt;
  final List<String>? carIds;
  final List<String>? sessionIds;

  Client({
    this.id,
    required this.name,
    required this.phoneNumber,
    required this.address,
    required this.isCompany,
    this.company,
    this.createdAt,
    this.carIds,
    this.sessionIds,
  });

  // Factory constructor to create a Client from Firebase document
  factory Client.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;

    // Handle address data
    final addressData =
        data['address'] ??
        {'city': data['city'] ?? '', 'country': data['country'] ?? ''};

    // Handle company data
    final bool isCompany = data['isCompany'] ?? false;
    Company? company;

    if (isCompany) {
      final companyData =
          data['company'] ??
          {'name': data['companyName'] ?? '', 'trn': data['trn'] ?? ''};
      company = Company.fromFirestore(companyData as Map<String, dynamic>);
    }

    return Client(
      id: doc.id,
      name: data['name'] ?? '',
      phoneNumber: data['phone'] ?? '',
      address: Address.fromFirestore(addressData as Map<String, dynamic>),
      isCompany: isCompany,
      company: company,
      createdAt:
          data['createdAt'] != null
              ? (data['createdAt'] as Timestamp).toDate()
              : null,
      carIds:
          (data['carIds'] as List<dynamic>?)?.map((e) => e as String).toList(),
      sessionIds:
          (data['sessionIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList(),
    );
  }

  // Convert Client to Map for Firebase
  Map<String, dynamic> toFirestore() {
    final Map<String, dynamic> data = {
      'name': name,
      'phone': phoneNumber,
      'address': address.toFirestore(),
      'isCompany': isCompany,
      'createdAt': FieldValue.serverTimestamp(),
      'carIds': carIds,
      'sessionIds': sessionIds,
    };

    // Add company data if it's a company
    if (isCompany && company != null) {
      data['company'] = company!.toFirestore();
    }

    return data;
  }

  // Method to validate client data
  static String? validate(Client client) {
    if (client.name.isEmpty) {
      return 'Name is required';
    }
    if (client.phoneNumber.isEmpty) {
      return 'Phone number is required';
    }
    if (client.address.city.isEmpty) {
      return 'City is required';
    }
    if (client.address.country.isEmpty) {
      return 'Country is required';
    }
    if (client.isCompany) {
      if (client.company == null || client.company!.name.isEmpty) {
        return 'Company name is required';
      }
    }
    return null; // No validation errors
  }
}
