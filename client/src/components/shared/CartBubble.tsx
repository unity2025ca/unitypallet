import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

interface CartResponse {
  items: any[];
  total: number;
  itemCount: number;
}

const CartBubble = () => {
  const [, setLocation] = useLocation();
  const { getSettingValue } = useSettings();
  const [isVisible, setIsVisible] = useState(true);
  const [animateCount, setAnimateCount] = useState(false);
  const [prevItemCount, setPrevItemCount] = useState(0);

  // Fetch cart data
  const { data: cart } = useQuery<CartResponse>({
    queryKey: ['/api/cart'],
    staleTime: 1000 * 30, // 30 seconds
  });

  // Animate when cart count changes
  useEffect(() => {
    if (!cart) return;
    
    if (prevItemCount !== 0 && prevItemCount !== cart.itemCount) {
      setAnimateCount(true);
      setTimeout(() => setAnimateCount(false), 1000);
    }
    
    setPrevItemCount(cart.itemCount);
  }, [cart?.itemCount, prevItemCount]);

  // Don't show on admin pages
  const [location] = useLocation();
  useEffect(() => {
    setIsVisible(!location.startsWith('/admin') && !location.includes('/cart'));
  }, [location]);

  if (!isVisible || !cart || cart.itemCount === 0) {
    return null;
  }

  const primaryColor = getSettingValue('primary_color', '#ef4444');

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      title="View your cart"
    >
      <Button
        className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center relative"
        style={{ backgroundColor: primaryColor }}
        onClick={() => setLocation('/cart')}
      >
        <ShoppingBag className="h-6 w-6 text-white" />
        {cart.itemCount > 0 && (
          <div 
            className={`absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 ${
              animateCount ? 'animate-bounce' : ''
            }`}
            style={{ borderColor: primaryColor }}
          >
            {cart.itemCount}
          </div>
        )}
      </Button>
    </div>
  );
};

export default CartBubble;