import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, ChevronLeft, ShoppingBag, X, MinusCircle, PlusCircle, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useSettings } from "@/hooks/use-settings";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    titleAr?: string | null;
    price: number;
    imageUrl: string;
    status: string;
  };
}

interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const CartPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { customer } = useCustomerAuth();
  const { isMaintenanceMode } = useSettings();

  // Fetch cart data
  const { data: cart, isLoading, isError } = useQuery<CartResponse>({
    queryKey: ['/api/cart'],
    staleTime: 1000 * 30, // 30 seconds
  });

  // Update item quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number, quantity: number }) => {
      const res = await apiRequest('PATCH', `/api/cart/items/${itemId}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating quantity",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest('DELETE', `/api/cart/items/${itemId}`);
      if (!res.ok) {
        throw new Error("Failed to remove item");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Empty cart mutation
  const emptyCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/cart/items');
      if (!res.ok) {
        throw new Error("Failed to empty cart");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart emptied",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error emptying cart",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle quantity update
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  // Handle remove item
  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(itemId);
  };

  // Handle empty cart
  const handleEmptyCart = () => {
    emptyCartMutation.mutate();
  };

  // Handle checkout
  const handleCheckout = () => {
    if (customer) {
      setLocation("/checkout");
    } else {
      toast({
        title: "Login required",
        description: "Please login or register to proceed with checkout.",
      });
      setLocation("/auth?redirect=/checkout");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Cart</h2>
          <p className="text-red-600 mb-4">We couldn't load your cart. Please try again later.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/cart'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Check for maintenance mode
  if (isMaintenanceMode) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <Alert className="border-amber-200 bg-amber-50 mb-6">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Ordering Temporarily Unavailable</AlertTitle>
          <AlertDescription className="text-amber-700">
            Our website is currently undergoing maintenance. Purchasing features are temporarily unavailable.
            Please check back later or contact us for assistance.
          </AlertDescription>
        </Alert>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
          <div className="text-gray-400 mb-4">
            <ShoppingBag className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-gray-500 mb-8">Purchasing functionality is temporarily disabled while we're performing maintenance.</p>
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
          <div className="text-gray-400 mb-4">
            <ShoppingBag className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Browse our products and add something to your cart.</p>
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="outline" asChild>
          <Link href="/products">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {/* Cart Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Product</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Quantity</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Price</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Subtotal</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-20 w-20 flex-shrink-0 rounded-md border border-gray-200 overflow-hidden">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Image+Not+Available";
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-base font-medium text-gray-900">
                          <Link href={`/products/${item.product.id}`}>
                            {item.product.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.product.status === 'soldout' && (
                            <span className="text-red-500 font-medium">Out of stock</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Quantity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button 
                        className="text-gray-500 hover:text-primary"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                      <span className="mx-3 w-8 text-center">{item.quantity}</span>
                      <button 
                        className="text-gray-500 hover:text-primary"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updateQuantityMutation.isPending}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                  
                  {/* Price */}
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    C${(item.product.price).toFixed(2)}
                  </td>
                  
                  {/* Subtotal */}
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    C${(item.product.price * item.quantity).toFixed(2)}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeItemMutation.isPending}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Cart Actions */}
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={handleEmptyCart}
            disabled={emptyCartMutation.isPending}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Empty Cart
          </Button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
            <p>Subtotal</p>
            <p>C${(cart.total).toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <p>Shipping & taxes calculated at checkout</p>
          </div>
          <Button 
            size="lg" 
            className="w-full text-base py-6 bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </Button>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Need help? <Link href="/contact" className="text-primary hover:underline">Contact us</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;