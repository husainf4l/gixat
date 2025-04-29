import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:gixatapp/screens/add_client_screen.dart';
import 'package:gixatapp/screens/sessions/session_details_screen.dart';
import '../../controllers/auth_controller.dart';
import '../../services/database_service.dart';
import '../../models/session.dart';

class SessionsScreen extends StatelessWidget {
  const SessionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final AuthController authController = Get.find<AuthController>();
    final DatabaseService databaseService = Get.find<DatabaseService>();
    final theme = Theme.of(context);
    final TextEditingController searchController = TextEditingController();
    final RxString searchQuery = ''.obs;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Sessions',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () {
                    Get.to(AddClientScreen());
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            CupertinoFormSection.insetGrouped(
              backgroundColor: Colors.transparent,
              margin: EdgeInsets.zero,
              children: [
                CupertinoFormRow(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 0,
                    vertical: 0,
                  ),
                  child: CupertinoSearchTextField(
                    controller: searchController,
                    onChanged: (value) {
                      searchQuery.value = value.trim().toLowerCase();
                    },
                    placeholder: 'Search by client, car, or plate',
                    placeholderStyle: const TextStyle(
                      color: CupertinoColors.systemGrey2,
                    ),
                    style: const TextStyle(color: CupertinoColors.label),
                    borderRadius: BorderRadius.circular(10),
                    backgroundColor: CupertinoColors.systemGrey6,
                    prefixInsets: const EdgeInsets.only(left: 8, right: 8),
                    suffixInsets: const EdgeInsets.only(right: 8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Obx(() {
                final currentUser = authController.currentUser;
                if (currentUser != null) {
                  return StreamBuilder<QuerySnapshot>(
                    stream: databaseService.queryCollection('sessions', [
                      ['garageId', authController.garageId],
                    ]),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.feed_outlined,
                                size: 64,
                                color: Colors.grey[400],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No active sessions found',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 18,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Start a new session to see it here',
                                style: TextStyle(color: Colors.grey[500]),
                              ),
                            ],
                          ),
                        );
                      }

                      final sessions =
                          snapshot.data!.docs
                              .map(
                                (doc) => Session.fromMap(
                                  doc.data() as Map<String, dynamic>,
                                  doc.id,
                                ),
                              )
                              .where((session) => session.status != 'CLOSED')
                              .toList();

                      final query = searchQuery.value;
                      final filteredSessions =
                          sessions.where((session) {
                            if (query.isEmpty) return true;
                            final clientName =
                                (session.client['name'] ?? '')
                                    .toString()
                                    .toLowerCase();
                            final carMake =
                                (session.car['make'] ?? '')
                                    .toString()
                                    .toLowerCase();
                            final carModel =
                                (session.car['model'] ?? '')
                                    .toString()
                                    .toLowerCase();
                            final plate =
                                (session.car['plateNumber'] ?? '')
                                    .toString()
                                    .toLowerCase();
                            return clientName.contains(query) ||
                                carMake.contains(query) ||
                                carModel.contains(query) ||
                                plate.contains(query);
                          }).toList();

                      if (filteredSessions.isEmpty) {
                        return Center(
                          child: Text(
                            'No sessions match your search',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        );
                      }

                      return ListView.builder(
                        itemCount: filteredSessions.length,
                        itemBuilder: (context, index) {
                          final session = filteredSessions[index];
                          final car = session.car;
                          final client = session.client;

                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            elevation: 4,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor:
                                    session.status == 'OPEN'
                                        ? Colors.green
                                        : session.status == 'IN_PROGRESS'
                                        ? Colors.orange
                                        : Colors.red,
                                child: Icon(
                                  session.status == 'OPEN'
                                      ? Icons.check_circle
                                      : session.status == 'IN_PROGRESS'
                                      ? Icons.timelapse
                                      : Icons.cancel,
                                  color: Colors.white,
                                ),
                              ),
                              title: Text(
                                '${car['make']} ${car['model']} ',
                                style: theme.textTheme.titleMedium,
                              ),
                              subtitle: Text(
                                'Client: ${client['name']} (${car['plateNumber']})',
                                style: theme.textTheme.bodySmall,
                              ),
                              onTap: () {
                                // Navigate to session details page
                                Get.to(
                                  () => SessionDetailsScreen(session: session),
                                );
                              },
                            ),
                          );
                        },
                      );
                    },
                  );
                } else {
                  return const Center(
                    child: Text('Please log in to view your sessions'),
                  );
                }
              }),
            ),
          ],
        ),
      ),
    );
  }
}
