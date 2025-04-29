import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../models/client.dart';
import '../services/client_service.dart';
import '../controllers/auth_controller.dart';

class ClientsScreen extends StatelessWidget {
  const ClientsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ClientService _clientService = ClientService();
    final AuthController authController = Get.find<AuthController>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Clients'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Navigate to add client screen
              Get.toNamed('/clients/add');
            },
          ),
        ],
      ),
      body: Obx(() {
        // Get the garage ID from the app user, not the Firebase user
        final garageId = authController.currentUser?.garageId ?? '';

        if (garageId.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.orange),
                const SizedBox(height: 16),
                Text(
                  'No garage assigned',
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please contact your administrator to assign you to a garage.',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        }

        return StreamBuilder<List<Client>>(
          stream: _clientService.getClientsForGarage(garageId),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return Center(
                child: Text(
                  'Error loading clients: ${snapshot.error}',
                  style: TextStyle(color: Colors.red),
                ),
              );
            }

            final clients = snapshot.data ?? [];

            if (clients.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.people_outline,
                      size: 64,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No clients found',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.add),
                      label: const Text('Add New Client'),
                      onPressed: () {
                        Get.toNamed('/clients/add');
                      },
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              itemCount: clients.length,
              itemBuilder: (context, index) {
                final client = clients[index];
                return Card(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: ListTile(
                    title: Text(client.name),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(client.phone),
                        if (client.address.city != null ||
                            client.address.country != null)
                          Text(
                            [
                              client.address.city,
                              client.address.country,
                            ].where((e) => e != null).join(', '),
                          ),
                      ],
                    ),
                    trailing: Text('Cars: ${client.carsId.length}'),
                    onTap: () {
                      // Navigate to client detail screen
                      Get.toNamed('/clients/detail/${client.id}');
                    },
                  ),
                );
              },
            );
          },
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Get.toNamed('/clients/add');
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
