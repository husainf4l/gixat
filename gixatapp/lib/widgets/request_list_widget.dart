import 'package:flutter/material.dart';

class RequestListWidget extends StatelessWidget {
  final List<String> requests;
  final bool isEditing;
  final Function(String)? onRemoveRequest;
  final Function()? onAddRequest;

  const RequestListWidget({
    Key? key,
    required this.requests,
    this.isEditing = false,
    this.onRemoveRequest,
    this.onAddRequest,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (requests.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.withOpacity(0.2)),
        ),
        child: Center(
          child: Text(
            'No service requests added',
            style: TextStyle(
              color: Colors.grey[500],
              fontStyle: FontStyle.italic,
            ),
          ),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: requests.length,
      itemBuilder: (context, index) {
        final request = requests[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            leading: Icon(
              _getIconForRequest(request),
              color: theme.primaryColor,
            ),
            title: Text(request),
            trailing:
                isEditing && onRemoveRequest != null
                    ? IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => onRemoveRequest!(request),
                    )
                    : null,
          ),
        );
      },
    );
  }

  static void showAddRequestDialog(
    BuildContext context, {
    required Function(String) onAddRequest,
  }) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder:
          (dialogContext) => AlertDialog(
            title: const Text('Add New Request'),
            content: TextField(
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'Enter service request',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.build_circle),
              ),
              textCapitalization: TextCapitalization.sentences,
              onSubmitted: (value) {
                if (value.trim().isNotEmpty) {
                  onAddRequest(value.trim());
                  Navigator.of(dialogContext).pop();
                }
              },
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(),
                child: const Text('CANCEL'),
              ),
              ElevatedButton(
                onPressed: () {
                  final controller =
                      ModalRoute.of(dialogContext)?.settings.arguments
                          as TextEditingController? ??
                      TextEditingController();
                  final request = controller.text.trim();
                  if (request.isNotEmpty) {
                    onAddRequest(request);
                    Navigator.of(dialogContext).pop();
                  }
                },
                child: const Text('ADD'),
              ),
            ],
          ),
    );
  }

  static IconData _getIconForRequest(String request) {
    switch (request.toLowerCase()) {
      case 'oil change':
        return Icons.oil_barrel;
      case 'tire rotation':
        return Icons.tire_repair;
      case 'engine diagnostics':
        return Icons.settings;
      case 'ac service':
        return Icons.ac_unit;
      case 'battery replacement':
        return Icons.battery_full;
      default:
        return Icons.build;
    }
  }
}
