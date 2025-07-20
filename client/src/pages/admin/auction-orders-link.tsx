// Temporary admin sidebar link component
import { Trophy } from "lucide-react";

export const AuctionOrdersMenuLink = () => {
  return {
    path: "/admin/auction-orders",
    icon: Trophy,
    label: "Auction Orders",
    description: "Manage auction winner orders, payments, and shipping"
  };
};