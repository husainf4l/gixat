import 'package:flutter/material.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final VoidCallback? onBack;
  final VoidCallback? onNotification;
  final bool showBackButton;
  final List<Widget>? actions;
  final bool showNotification;

  const CustomAppBar({
    super.key,
    required this.title,
    this.onBack,
    this.onNotification,
    this.showBackButton = false,
    this.actions,
    this.showNotification = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Determine if we use a close icon instead of back arrow
    final bool useCloseIcon =
        showBackButton && (ModalRoute.of(context)?.canPop ?? false);
    final double iconButtonWidth = 48.0; // Standard IconButton width

    Widget? leadingWidget =
        showBackButton
            ? IconButton(
              icon: Icon(useCloseIcon ? Icons.close : Icons.arrow_back),
              onPressed: onBack ?? () => Navigator.of(context).maybePop(),
            )
            : null;

    List<Widget> actionWidgets = [];
    if (actions != null && actions!.isNotEmpty) {
      actionWidgets = actions!;
    } else if (showNotification) {
      actionWidgets = [
        IconButton(
          icon: const Icon(Icons.notifications_none),
          onPressed: onNotification,
        ),
      ];
    }

    // Add a SizedBox to balance the Row if there are no actions
    final bool needsBalance = leadingWidget != null && actionWidgets.isEmpty;

    final bool centerTitle = showBackButton;

    return SafeArea(
      child: Container(
        height: kToolbarHeight,
        padding: const EdgeInsets.symmetric(horizontal: 12.0),
        alignment: Alignment.center,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (leadingWidget != null) leadingWidget,
            if (leadingWidget != null) const SizedBox(width: 8),
            if (centerTitle)
              Expanded(
                child: Center(
                  child: Text(
                    title,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              )
            else
              Expanded(
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    title,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            if (actionWidgets.isNotEmpty) ...[
              const SizedBox(width: 8),
              ...actionWidgets.map(
                (w) => Padding(
                  padding: const EdgeInsets.only(left: 4.0),
                  child: w,
                ),
              ),
            ] else if (needsBalance) ...[
              const SizedBox(width: 8),
              SizedBox(width: iconButtonWidth),
            ],
          ],
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
