import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:gixatapp/screens/add_client_screen.dart';
import '../controllers/auth_controller.dart';
import '../services/database_service.dart';

class FeedScreen extends StatelessWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final AuthController authController = Get.find<AuthController>();
    final DatabaseService databaseService = Get.find<DatabaseService>();
    final theme = Theme.of(context);

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
                  'Feed',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () {
                    Get.to(AddClientScreen());
                    // Get.snackbar(
                    //   'Refreshing',
                    //   'Updating your feed...',
                    //   snackPosition: SnackPosition.BOTTOM,
                    // );
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Obx(() {
                final currentUser = authController.currentUser;
                if (currentUser != null) {
                  return StreamBuilder<QuerySnapshot>(
                    stream: databaseService.queryCollection('activities', [
                      ['userId', currentUser.uid],
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
                                'Your feed is empty',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 18,
                                ),
                              ),
                              const SizedBox(height: 8),

                              Text(
                                'New activities will appear here',
                                style: TextStyle(color: Colors.grey[500]),
                              ),
                            ],
                          ),
                        );
                      }

                      final activities = snapshot.data!.docs;

                      return ListView.builder(
                        itemCount: activities.length,
                        itemBuilder: (context, index) {
                          final activity =
                              activities[index].data() as Map<String, dynamic>;
                          final activityType =
                              activity['type'] as String? ?? 'Unknown';

                          return _buildFeedCard(
                            context,
                            activity,
                            activityType,
                            theme,
                          );
                        },
                      );
                    },
                  );
                } else {
                  return const Center(
                    child: Text('Please log in to view your feed'),
                  );
                }
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedCard(
    BuildContext context,
    Map<String, dynamic> activity,
    String activityType,
    ThemeData theme,
  ) {
    IconData activityIcon;
    Color iconColor;

    switch (activityType) {
      case 'profile_update':
        activityIcon = Icons.person;
        iconColor = Colors.blue;
        break;
      case 'login':
        activityIcon = Icons.login;
        iconColor = Colors.green;
        break;
      default:
        activityIcon = Icons.notifications;
        iconColor = Colors.orange;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: iconColor.withOpacity(0.2),
                  child: Icon(activityIcon, color: iconColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        activity['title'] as String? ?? 'Activity',
                        style: theme.textTheme.titleMedium,
                      ),
                      Text(
                        _getTimeAgo(activity['timestamp']),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (activity['description'] != null &&
                activity['description'].toString().isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 12.0, left: 48.0),
                child: Text(
                  activity['description'] as String? ?? '',
                  style: theme.textTheme.bodyMedium,
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _getTimeAgo(dynamic timestamp) {
    if (timestamp == null) return 'Unknown';

    DateTime activityTime;
    if (timestamp is Timestamp) {
      activityTime = timestamp.toDate();
    } else if (timestamp is String) {
      activityTime = DateTime.tryParse(timestamp) ?? DateTime.now();
    } else {
      return 'Unknown';
    }

    final duration = DateTime.now().difference(activityTime);

    if (duration.inMinutes < 1) {
      return 'Just now';
    } else if (duration.inHours < 1) {
      return '${duration.inMinutes}m ago';
    } else if (duration.inDays < 1) {
      return '${duration.inHours}h ago';
    } else if (duration.inDays < 30) {
      return '${duration.inDays}d ago';
    } else {
      return '${(duration.inDays / 30).floor()}mo ago';
    }
  }
}
