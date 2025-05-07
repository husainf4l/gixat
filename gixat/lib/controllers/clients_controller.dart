import 'package:get/get.dart';
import 'package:gixat/models/clients/client.dart';
import 'package:gixat/services/clients/client_service.dart';

class ClientsController extends GetxController {
  final ClientService _clientService = ClientService();

  // Observable variables
  final RxList<Client> clients = <Client>[].obs;
  final RxBool isLoading = false.obs;
  final RxString error = ''.obs;
  final RxString searchQuery = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchClients();
  }

  // Computed list of filtered clients based on search query
  List<Client> get filteredClients {
    final query = searchQuery.value.toLowerCase();
    if (query.isEmpty) return clients;

    return clients.where((client) {
      final nameMatch = client.name.toLowerCase().contains(query);
      final phoneMatch = client.phoneNumber.toLowerCase().contains(query);
      return nameMatch || phoneMatch;
    }).toList();
  }

  // Fetch all clients for the current garage
  Future<void> fetchClients() async {
    isLoading.value = true;
    error.value = '';

    try {
      final clientsList = await _clientService.listClients();
      clients.value = clientsList;
    } catch (e) {
      error.value = 'Failed to load clients: $e';
    } finally {
      isLoading.value = false;
    }
  }

  // Set search query
  void search(String query) {
    searchQuery.value = query;
  }
}
