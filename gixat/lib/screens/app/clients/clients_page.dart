import 'package:flutter/cupertino.dart' show CupertinoIcons;
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:gixat/controllers/clients_controller.dart';
import 'package:gixat/widgets/app/client_card.dart';
import 'package:gixat/widgets/app/custom_app_bar.dart';

class ClientsPage extends StatelessWidget {
  const ClientsPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize and register the controller with GetX
    final ClientsController controller = Get.put(ClientsController());

    return SafeArea(
      child: Scaffold(
        appBar: CustomAppBar(
          title: 'Clients',
          actions: [
            IconButton(
              icon: const Icon(CupertinoIcons.person_add),
              onPressed: () {
                Get.toNamed('/add-client');
              },
            ),
          ],
        ),
        body: Column(
          children: [
            // Search bar
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search by name or phone',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surfaceVariant,
                ),
                onChanged: controller.search,
              ),
            ),

            // Content area
            Expanded(
              child: Obx(() {
                // Show loading indicator
                if (controller.isLoading.value) {
                  return const Center(child: CircularProgressIndicator());
                }

                // Show error message if any
                if (controller.error.value.isNotEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 48,
                          color: Theme.of(context).colorScheme.error,
                        ),
                        const SizedBox(height: 16),
                        Text(controller.error.value),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: controller.fetchClients,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                // Show empty state if no clients
                final filteredClients = controller.filteredClients;
                if (filteredClients.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          controller.searchQuery.value.isEmpty
                              ? Icons.people_outline
                              : Icons.search_off,
                          size: 48,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          controller.searchQuery.value.isEmpty
                              ? 'No clients found'
                              : 'No clients match your search',
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(color: Colors.grey[600]),
                        ),
                        if (controller.searchQuery.value.isEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            'Add a new client to get started',
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(color: Colors.grey[500]),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: () => Get.toNamed('/add-client'),
                            icon: const Icon(Icons.add),
                            label: const Text('Add Client'),
                          ),
                        ],
                      ],
                    ),
                  );
                }

                // Show list of clients
                return RefreshIndicator(
                  onRefresh: controller.fetchClients,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: filteredClients.length,
                    itemBuilder: (context, index) {
                      final client = filteredClients[index];
                      return ClientCard(
                        client: client,
                        onTap:
                            () => Get.toNamed(
                              '/client-details',
                              arguments: {'clientId': client.id},
                            ),
                      );
                    },
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
