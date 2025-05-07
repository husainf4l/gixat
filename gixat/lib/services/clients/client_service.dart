import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:gixat/models/clients/client.dart';
import 'package:gixat/models/clients/address.dart';
import 'package:gixat/models/clients/company.dart';
import 'package:gixat/services/controllers/auth_controller.dart';

class ClientResult {
  final bool success;
  final String message;
  final Client? client;

  ClientResult({required this.success, required this.message, this.client});

  // Helper factory methods for common results
  factory ClientResult.success(String message, {Client? client}) {
    return ClientResult(success: true, message: message, client: client);
  }

  factory ClientResult.error(String message) {
    return ClientResult(success: false, message: message);
  }
}

class ClientService {
  // Singleton instance
  static final ClientService _instance = ClientService._internal();

  factory ClientService() => _instance;

  ClientService._internal();

  final authController = Get.find<AuthController>();
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Helper to get clients collection reference
  CollectionReference _getClientsCollection(String garageId) {
    return _firestore.collection('garages').doc(garageId).collection('clients');
  }

  // Centralized validation method for client data
  String? _validateClientData({
    required String name,
    required String phoneNumber,
    required String? city,
    required String? country,
    required bool isCompany,
    String? companyName,
  }) {
    if (name.isEmpty) {
      return 'Please enter a name';
    }

    if (phoneNumber.isEmpty) {
      return 'Please enter a phone number';
    }

    if (city == null || city.isEmpty) {
      return 'Please select a city';
    }

    if (country == null || country.isEmpty) {
      return 'Please select a country';
    }

    if (isCompany && (companyName == null || companyName.isEmpty)) {
      return 'Company name is required';
    }

    return null;
  }

  // Check for the garage ID and return error if not available
  String? _getGarageIdOrError() {
    final garageId = authController.gixatUser.value?.garageId;
    return garageId;
  }

  // Unified method to handle client form submission (for both create and update)
  Future<ClientResult> processClientForm({
    required String name,
    required String phoneNumber,
    required String? city,
    required String? country,
    String? street,
    required bool isCompany,
    String? companyName,
    String? trn,
    String? clientId,
    GlobalKey<FormState>? formKey,
  }) async {
    try {
      // Optional: Form validation using the form key if provided
      if (formKey != null && formKey.currentState?.validate() != true) {
        return ClientResult.error('Please fill in all required fields');
      }

      // Data validation
      final validationError = _validateClientData(
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        city: city,
        country: country,
        isCompany: isCompany,
        companyName: companyName?.trim(),
      );

      if (validationError != null) {
        return ClientResult.error(validationError);
      }

      // Get garage ID
      final garageId = _getGarageIdOrError();
      if (garageId == null) {
        return ClientResult.error('Garage ID is not available');
      }

      // For new clients, check if phone is already registered
      if (clientId == null) {
        final isRegistered = await isPhoneRegistered(garageId, phoneNumber.trim());
        if (isRegistered) {
          return ClientResult.error('Phone number is already registered');
        }
      }

      // Create address
      final address = Address(
        city: city!,
        country: country!,
        street: street,
      );

      // Create company if applicable
      Company? company;
      if (isCompany && companyName != null && companyName.isNotEmpty) {
        company = Company(
          name: companyName.trim(),
          trn: (trn ?? '').trim(),
        );
      }

      // Create client object
      final client = Client(
        id: clientId, // null for new clients
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address,
        isCompany: isCompany,
        company: company,
      );

      // Validate using the Client model's validation
      final modelValidationError = Client.validate(client);
      if (modelValidationError != null) {
        return ClientResult.error(modelValidationError);
      }

      // Create or update client in Firestore
      if (clientId == null) {
        // Create new client
        final clientsCollection = _getClientsCollection(garageId);
        final docRef = await clientsCollection.add(client.toFirestore());
        final docSnapshot = await docRef.get();
        final createdClient = Client.fromFirestore(docSnapshot);
        return ClientResult.success(
          'Client successfully created',
          client: createdClient,
        );
      } else {
        // Update existing client
        final clientsCollection = _getClientsCollection(garageId);
        await clientsCollection.doc(clientId).update(client.toFirestore());
        return ClientResult.success(
          'Client successfully updated',
          client: client,
        );
      }
    } catch (e) {
      debugPrint('Error processing client: $e');
      return ClientResult.error('An unexpected error occurred: ${e.toString()}');
    }
  }

  // Simplified method for backward compatibility
  Future<ClientResult> saveClient({
    required String name,
    required String phoneNumber,
    required String? city,
    required String? country,
    String? street,
    required bool isCompany,
    String companyName = '',
    String trn = '',
    required GlobalKey<FormState>? formKey,
  }) async {
    return processClientForm(
      name: name,
      phoneNumber: phoneNumber,
      city: city,
      country: country,
      street: street,
      isCompany: isCompany,
      companyName: companyName,
      trn: trn,
      formKey: formKey,
    );
  }

  // Simplified method for backward compatibility
  Future<ClientResult> submitClientForm({
    required Client client,
    required bool validateFields,
    String? selectedCity,
    String? selectedCountry,
    String? selectedStreet,
    bool isCompany = false,
    String? companyName,
    String? trn,
  }) async {
    return processClientForm(
      clientId: client.id, // Include ID for updates
      name: client.name,
      phoneNumber: client.phoneNumber,
      city: selectedCity ?? client.address.city,
      country: selectedCountry ?? client.address.country,
      street: selectedStreet ?? client.address.street, 
      isCompany: isCompany,
      companyName: companyName ?? (client.company?.name ?? ''),
      trn: trn ?? (client.company?.trn ?? ''),
    );
  }

  // For backward compatibility
  Future<ClientResult> createClient(Client client) async {
    try {
      // Validate client data
      final validationError = Client.validate(client);
      if (validationError != null) {
        return ClientResult.error(validationError);
      }

      final garageId = _getGarageIdOrError();
      if (garageId == null) {
        return ClientResult.error('Garage ID is not available');
      }

      // Check if phone is already registered
      final isRegistered = await isPhoneRegistered(garageId, client.phoneNumber);
      if (isRegistered) {
        return ClientResult.error('Phone number is already registered');
      }

      // Add client to Firestore
      final clientsCollection = _getClientsCollection(garageId);
      final docRef = await clientsCollection.add(client.toFirestore());

      // Get the created client with ID
      final docSnapshot = await docRef.get();
      final createdClient = Client.fromFirestore(docSnapshot);

      return ClientResult.success(
        'Client successfully created',
        client: createdClient,
      );
    } catch (e) {
      debugPrint('Error creating client: $e');
      return ClientResult.error('Failed to create client: ${e.toString()}');
    }
  }

  Future<ClientResult> updateClient(Client client) async {
    try {
      if (client.id == null) {
        return ClientResult.error('Client ID is missing');
      }

      // Validate client data
      final validationError = Client.validate(client);
      if (validationError != null) {
        return ClientResult.error(validationError);
      }

      final garageId = _getGarageIdOrError();
      if (garageId == null) {
        return ClientResult.error('Garage ID is not available');
      }

      // Update client in Firestore
      final clientsCollection = _getClientsCollection(garageId);
      await clientsCollection.doc(client.id).update(client.toFirestore());

      return ClientResult.success(
        'Client successfully updated',
        client: client,
      );
    } catch (e) {
      debugPrint('Error updating client: $e');
      return ClientResult.error('Failed to update client: ${e.toString()}');
    }
  }

  Future<ClientResult> deleteClient(String clientId) async {
    try {
      final garageId = _getGarageIdOrError();
      if (garageId == null) {
        return ClientResult.error('Garage ID is not available');
      }

      // Delete client from Firestore
      final clientsCollection = _getClientsCollection(garageId);
      await clientsCollection.doc(clientId).delete();

      return ClientResult.success('Client successfully deleted');
    } catch (e) {
      debugPrint('Error deleting client: $e');
      return ClientResult.error('Failed to delete client: ${e.toString()}');
    }
  }

  Future<ClientResult> getClient(String clientId) async {
    try {
      final garageId = _getGarageIdOrError();
      if (garageId == null) {
        return ClientResult.error('Garage ID is not available');
      }

      // Get client from Firestore
      final clientsCollection = _getClientsCollection(garageId);
      final docSnapshot = await clientsCollection.doc(clientId).get();

      if (!docSnapshot.exists) {
        return ClientResult.error('Client not found');
      }

      final client = Client.fromFirestore(docSnapshot);
      return ClientResult.success(
        'Client successfully retrieved',
        client: client,
      );
    } catch (e) {
      debugPrint('Error getting client: $e');
      return ClientResult.error('Failed to get client: ${e.toString()}');
    }
  }

  Future<List<Client>> listClients() async {
    try {
      final garageId = _getGarageIdOrError();
      if (garageId == null) {
        return [];
      }

      // List clients from Firestore
      final clientsCollection = _getClientsCollection(garageId);
      final querySnapshot =
          await clientsCollection.orderBy('createdAt', descending: true).get();

      return querySnapshot.docs
          .map((doc) => Client.fromFirestore(doc))
          .toList();
    } catch (e) {
      debugPrint('Error listing clients: $e');
      return [];
    }
  }

  Future<bool> isPhoneRegistered(String garageId, String phoneNumber) async {
    try {
      if (phoneNumber.isEmpty) {
        return false;
      }

      final clientsCollection = _getClientsCollection(garageId);
      final query =
          await clientsCollection
              .where('phone', isEqualTo: phoneNumber)
              .limit(1)
              .get();

      return query.docs.isNotEmpty;
    } catch (e) {
      debugPrint('Error checking phone registration: $e');
      return false;
    }
  }
}
