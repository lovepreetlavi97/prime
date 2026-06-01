import 'package:flutter/widgets.dart';

class NavigationItem {
  final IconData filledIcon;
  final IconData outlinedIcon;
  final String label;

  const NavigationItem({
    required this.filledIcon,
    required this.outlinedIcon,
    required this.label,
  });
}
