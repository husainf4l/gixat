import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';
import '../../models/session.dart';
import '../../services/client_notes_service.dart';
import 'client_notes_details_screen.dart';

class SessionDetailsScreen extends StatelessWidget {
  final Session session;

  const SessionDetailsScreen({Key? key, required this.session})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.primaryColor;

    // Extract car details
    final carMake = session.car['make'] ?? '';
    final carModel = session.car['model'] ?? '';
    final plateNumber = session.car['plateNumber'] ?? '';
    final carTitle =
        '$carMake $carModel ${plateNumber.isNotEmpty ? '• $plateNumber' : ''}';

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Elegant header with car details
            Container(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 20),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Back button with minimal design
                      GestureDetector(
                        onTap: () => Navigator.of(context).pop(),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.black12,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.arrow_back_ios_new_rounded,
                            size: 18,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      // Session status indicator
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: _getStatusColor(
                            session.status,
                          ).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _formatStatus(session.status),
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: _getStatusColor(session.status),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Car details display
                  Text(
                    carTitle,
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 0.4,
                    ),
                  ),
                  // Client name
                  Text(
                    'Client: ${session.client['name'] ?? 'Unknown'}',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[400],
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Session Activities',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _SessionBox(
                          icon: Icons.sticky_note_2_outlined,
                          title: 'Client Notes',
                          color: primaryColor,
                          onTap: () {
                            // Navigate to the client notes details screen
                            final clientNotesId = session.clientNoteId;
                            final carMake = session.car['make'] ?? '';
                            final carModel = session.car['model'] ?? '';
                            final plateNumber =
                                session.car['plateNumber'] ?? '';
                            final carDetails =
                                '$carMake $carModel ${plateNumber.isNotEmpty ? '• $plateNumber' : ''}';

                            Get.to(
                              () => ClientNotesDetailsScreen(
                                session: session,
                                clientNotesId: clientNotesId,
                                clientName: session.client['name'] ?? 'Unknown',
                                carDetails: carDetails,
                              ),
                              transition: Transition.rightToLeft,
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _SessionBox(
                          icon: Icons.search,
                          title: 'Inspection',
                          color: primaryColor,
                          onTap: () {},
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _SessionBox(
                          icon: Icons.directions_car,
                          title: 'Test Drive',
                          color: primaryColor,
                          onTap: () {},
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _SessionBox(
                          icon: Icons.assignment,
                          title: 'Job Order',
                          color: primaryColor,
                          onTap: () {},
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Activity history section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Text(
                'Activity History',
                style: theme.textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Activity feed
            Expanded(
              child: StreamBuilder(
                stream:
                    FirebaseFirestore.instance
                        .collection('activity')
                        .where('sessionId', isEqualTo: session.id)
                        .orderBy('timestamp', descending: true)
                        .snapshots(),
                builder: (context, AsyncSnapshot<QuerySnapshot> snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
                        strokeWidth: 2,
                      ),
                    );
                  }

                  if (snapshot.hasError) {
                    return Center(
                      child: Text(
                        'Error loading activities',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: Colors.red[400],
                        ),
                      ),
                    );
                  }

                  if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.history,
                            size: 48,
                            color: Colors.grey[600],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'No activity recorded yet',
                            style: theme.textTheme.bodyLarge?.copyWith(
                              color: Colors.grey[500],
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  final activities = snapshot.data!.docs;

                  return ListView.builder(
                    itemCount: activities.length,
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    physics: const BouncingScrollPhysics(),
                    itemBuilder: (context, index) {
                      final activity =
                          activities[index].data() as Map<String, dynamic>;
                      // Print each activity to help diagnose issues
                      return _ActivityItem(
                        activity: activity,
                        color: primaryColor,
                        formatTimestamp: _formatTimestamp,
                        getActivityIcon: _getActivityIcon,
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper method to format timestamps in a more elegant way
  String _formatTimestamp(dynamic timestamp) {
    if (timestamp == null) return '';

    if (timestamp is Timestamp) {
      final dateTime = timestamp.toDate();
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final activityDate = DateTime(
        dateTime.year,
        dateTime.month,
        dateTime.day,
      );

      final time =
          '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';

      if (activityDate == today) {
        return 'Today at $time';
      } else if (activityDate == today.subtract(const Duration(days: 1))) {
        return 'Yesterday at $time';
      } else {
        return '${dateTime.day}/${dateTime.month}/${dateTime.year} at $time';
      }
    }

    return '';
  }

  // Helper method to format status text
  String _formatStatus(String status) {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return 'Open';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'WAITING_FOR_APPROVAL':
        return 'Awaiting Approval';
      case 'COMPLETED':
        return 'Completed';
      case 'CLOSED':
        return 'Closed';
      default:
        return status;
    }
  }

  // Helper method to get status color
  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return Colors.amber;
      case 'IN_PROGRESS':
        return Colors.blue;
      case 'WAITING_FOR_APPROVAL':
        return Colors.purple;
      case 'COMPLETED':
        return Colors.green;
      case 'CLOSED':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  // Helper method to get contextual icons for activities
  IconData _getActivityIcon(String type) {
    switch (type.toLowerCase()) {
      case 'note':
        return Icons.note_alt_rounded;
      case 'inspection':
        return Icons.search_rounded;
      case 'test_drive':
        return Icons.directions_car_rounded;
      case 'job_order':
        return Icons.assignment_rounded;
      case 'status_change':
        return Icons.sync_rounded;
      default:
        return Icons.event_note_rounded;
    }
  }
}

// Refined session box with consistent styling
class _SessionBox extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final Color color;

  const _SessionBox({
    required this.icon,
    required this.title,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 100,
        decoration: BoxDecoration(
          color: Colors.black12,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2), width: 1),
        ),
        child: Stack(
          children: [
            // Very subtle gradient overlay for depth
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [color.withOpacity(0.03), Colors.transparent],
                ),
              ),
            ),
            // Content
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, size: 24, color: color),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Activity item component
class _ActivityItem extends StatelessWidget {
  final Map<String, dynamic> activity;
  final Color color;
  final String Function(dynamic) formatTimestamp;
  final IconData Function(String) getActivityIcon;

  const _ActivityItem({
    required this.activity,
    required this.color,
    required this.formatTimestamp,
    required this.getActivityIcon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.black12,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1), width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Activity icon
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                getActivityIcon(activity['type'] ?? 'default'),
                color: color,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            // Activity content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    activity['title'] ?? 'Activity',
                    style: theme.textTheme.titleSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    formatTimestamp(activity['timestamp']),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
