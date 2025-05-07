import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:gixat/models/clients/client.dart';
import 'package:gixat/services/clients/client_service.dart';
import 'package:gixat/widgets/app/custom_app_bar.dart';
import 'package:url_launcher/url_launcher.dart';

class ClientDetailsPage extends StatefulWidget {
  const ClientDetailsPage({super.key});

  @override
  State<ClientDetailsPage> createState() => _ClientDetailsPageState();
}

class _ClientDetailsPageState extends State<ClientDetailsPage> {
  final ClientService _clientService = ClientService();
  bool isLoading = true;
  Client? client;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadClientDetails();
  }

  Future<void> _loadClientDetails() async {
    final String? clientId = Get.arguments?['clientId'];

    if (clientId == null) {
      setState(() {
        isLoading = false;
        error = 'Client ID is missing';
      });
      return;
    }

    try {
      final result = await _clientService.getClient(clientId);

      if (result.success && result.client != null) {
        setState(() {
          client = result.client;
          isLoading = false;
        });
      } else {
        setState(() {
          error = result.message;
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = 'Failed to load client details: $e';
        isLoading = false;
      });
    }
  }

  Future<void> _launchWhatsApp() async {
    if (client?.phoneNumber == null || client!.phoneNumber.isEmpty) return;

    String phone = client!.phoneNumber.replaceAll(RegExp(r'[^0-9+]'), '');

    if (!phone.startsWith('+')) {
      phone = '+971$phone';
    }

    final whatsappUrl = 'https://wa.me/$phone';

    try {
      await launchUrl(
        Uri.parse(whatsappUrl),
        mode: LaunchMode.externalApplication,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not launch WhatsApp')),
      );
    }
  }

  void _navigateToAddVehicle() {
    if (client?.id == null) return;

    Get.toNamed(
      '/add-vehicle',
      arguments: {'clientId': client!.id, 'clientName': client!.name},
    );
  }

  void _navigateToAddSession() {
    if (client?.id == null) return;

    Get.toNamed(
      '/create-session',
      arguments: {'clientId': client!.id, 'clientName': client!.name},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Client Details',
        actions: [
          IconButton(icon: const Icon(CupertinoIcons.pencil), onPressed: () {}),
        ],
        showBackButton: true,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (error != null) {
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
            Text(error!),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadClientDetails,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (client == null) {
      return const Center(child: Text('Client not found'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceVariant,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: Text(
                        client!.name.isNotEmpty
                            ? client!.name[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            client!.name,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            client!.isCompany
                                ? 'Business Account'
                                : 'Individual Account',
                            style: Theme.of(
                              context,
                            ).textTheme.bodyMedium?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          _buildSectionCard(
            context: context,
            title: 'Contact Information',
            icon: Icons.contact_phone,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInfoRow(
                  context: context,
                  icon: Icons.phone,
                  label: 'Phone',
                  value: client!.phoneNumber,
                  isPhone: true,
                  extraAction: IconButton(
                    icon: const Icon(
                      Icons.share,
                      size: 20,
                      color: Color(0xFF25D366),
                    ),
                    onPressed: _launchWhatsApp,
                  ),
                ),
                const SizedBox(height: 12),
                _buildInfoRow(
                  context: context,
                  icon: Icons.location_on,
                  label: 'Address',
                  value: '${client!.address.city}, ${client!.address.country}',
                ),
              ],
            ),
          ),

          if (client!.isCompany && client!.company != null)
            Column(
              children: [
                const SizedBox(height: 16),
                _buildSectionCard(
                  context: context,
                  title: 'Company Information',
                  icon: Icons.business,
                  content: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildInfoRow(
                        context: context,
                        icon: Icons.business_center,
                        label: 'Company Name',
                        value: client!.company!.name,
                      ),
                      if (client!.company!.trn.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow(
                          context: context,
                          icon: Icons.numbers,
                          label: 'TRN',
                          value: client!.company!.trn,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),

          const SizedBox(height: 16),

          _buildSectionCard(
            context: context,
            title: 'Vehicles',
            icon: Icons.directions_car,
            actionButton: IconButton(
              icon: const Icon(Icons.add_circle, color: Colors.green),
              onPressed: _navigateToAddVehicle,
              tooltip: 'Add Vehicle',
            ),
            content: const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('No vehicles available'),
              ),
            ),
          ),

          const SizedBox(height: 16),

          _buildSectionCard(
            context: context,
            title: 'Recent Sessions',
            icon: Icons.history,
            actionButton: IconButton(
              icon: const Icon(Icons.add_circle, color: Colors.green),
              onPressed: _navigateToAddSession,
              tooltip: 'Create New Session',
            ),
            content: const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 16),
                child: Text('No recent sessions'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required BuildContext context,
    required String title,
    required IconData icon,
    required Widget content,
    Widget? actionButton,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                if (actionButton != null) actionButton,
              ],
            ),
          ),

          Divider(height: 1, color: Theme.of(context).dividerColor),

          Padding(padding: const EdgeInsets.all(16), child: content),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required BuildContext context,
    required IconData icon,
    required String label,
    required String value,
    bool isPhone = false,
    Widget? extraAction,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 18,
          color: Theme.of(context).colorScheme.onSurfaceVariant.withAlpha(150),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(
                    context,
                  ).colorScheme.onSurfaceVariant.withAlpha(150),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color:
                      isPhone
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
        if (isPhone)
          IconButton(
            icon: const Icon(Icons.call, size: 20),
            color: Theme.of(context).colorScheme.primary,
            onPressed: () {
              final phone = 'tel:${client!.phoneNumber}';
              launchUrl(Uri.parse(phone));
            },
          ),
        if (extraAction != null) extraAction,
      ],
    );
  }
}
