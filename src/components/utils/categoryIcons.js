import {
  WalletCards,
  Laptop,
  BriefcaseBusiness,
  Gift,
  CircleDollarSign,
  Utensils,
  CarFront,
  House,
  ReceiptText,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Gamepad2,
  MoreHorizontal,
  Circle,
} from 'lucide-react';

const ICONS = {
  WalletCards,
  Laptop,
  BriefcaseBusiness,
  Gift,
  CircleDollarSign,
  Utensils,
  CarFront,
  House,
  ReceiptText,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Gamepad2,
  MoreHorizontal,
  Circle,
};

export function getCategoryIcon(name) {
  return ICONS[name] || Circle;
}