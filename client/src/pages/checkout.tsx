import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, CreditCard, CheckCircle2, Truck, ShoppingBag, Loader2, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { useSettings } from "@/hooks/use-settings";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    title: string;
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

// Form schema for checkout
const checkoutSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  deliveryMethod: z.enum(["delivery", "pickup"], {
    required_error: "Please select a delivery method",
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  shippingCost: z.number().optional(),
}).refine((data) => {
  // If delivery method is pickup, shipping fields are not required
  if (data.deliveryMethod === "pickup") {
    return true;
  }
  
  // If delivery method is delivery, shipping fields are required
  if (data.deliveryMethod === "delivery") {
    if (!data.address || data.address.length < 5) return false;
    if (!data.city || data.city.length < 2) return false;
    if (!data.province || data.province.length < 2) return false;
    if (!data.country || data.country.length < 2) return false;
    if (!data.postalCode || data.postalCode.length < 5) return false;
    return true;
  }
  
  return false;
}, {
  message: "Shipping address is required for delivery",
  path: ["address"]
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { customer } = useCustomerAuth();
  const { isMaintenanceMode } = useSettings();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Get cart data
  const { data: cart, isLoading: isLoadingCart } = useQuery<CartResponse>({
    queryKey: ['/api/cart'],
    staleTime: 1000 * 30, // 30 seconds
  });

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: customer?.fullName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      deliveryMethod: "delivery", // Default to delivery
      address: customer?.address || "",
      city: customer?.city || "",
      province: "",
      postalCode: customer?.postalCode || "",
      country: customer?.country || "Canada",
      notes: "",
    },
  });

  // Place order mutation and redirect to Stripe payment
  const placeOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      // First create the order in our system
      const orderRes = await apiRequest('POST', '/api/orders', {
        ...data,
        paymentMethod: "credit_card", // Changed to credit card for Stripe payment
      });
      
      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to place order");
      }
      
      const orderData = await orderRes.json();
      
      console.log("Order data for payment:", orderData);
      // Calculate total amount including shipping for Stripe
      const totalWithShipping = orderData.total + (orderData.shippingCost || 0);
      console.log("Total with shipping:", totalWithShipping);
      
      // Next, create a payment session with Stripe
      const paymentRes = await apiRequest('POST', '/api/stripe/create-payment-intent', {
        amount: totalWithShipping,
        orderId: orderData.id
      });
      
      if (!paymentRes.ok) {
        const errorData = await paymentRes.json();
        throw new Error(errorData.error || "Failed to create payment");
      }
      
      const { url } = await paymentRes.json();
      
      // Redirect to the Stripe checkout URL directly
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received from server");
      }
      
      return orderData;
    },
    onSuccess: () => {
      // We won't reach this code since we're redirecting to Stripe's checkout page
      toast({
        title: "Redirecting to Payment",
        description: "You will be redirected to the secure payment page.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Process Order",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  // State for shipping cost and address
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingAddress, setShippingAddress] = useState<{
    city: string;
    province: string;
    country: string;
    postalCode?: string;
  } | null>(null);
  
  // Remove redundant variable since we're checking shippingCost directly

  // Update shipping address when form fields change
  useEffect(() => {
    const formValues = form.getValues();
    if (formValues.city && formValues.province && formValues.country) {
      setShippingAddress({
        city: formValues.city,
        province: formValues.province,
        country: formValues.country,
        postalCode: formValues.postalCode
      });
    }
  }, [form.watch('city'), form.watch('province'), form.watch('country'), form.watch('postalCode')]);

  // Handle form submission
  const onSubmit = (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    // Skip shipping address validation for pickup
    if (data.deliveryMethod === 'pickup') {
      // Clear shipping fields for pickup orders to avoid sending unnecessary data
      data.address = '';
      data.city = '';
      data.province = '';
      data.postalCode = '';
      data.country = '';
    }

    // Show processing message
    toast({
      title: "Processing Order",
      description: "Preparing your order...",
      duration: 3000,
    });

    // If pickup is selected, skip shipping cost calculation
    if (data.deliveryMethod === 'pickup') {
      console.log('Pickup selected, skipping shipping calculation');
      
      // Use 0 shipping cost for pickup
      placeOrderMutation.mutate({
        ...data,
        shippingCost: 0
      });
      return;
    }
    
    // For delivery, calculate shipping cost
    toast({
      title: "Calculating Shipping",
      description: "We're calculating your shipping cost...",
      duration: 3000,
    });

    // Calculate shipping cost right before submitting
    console.log('Calculating final shipping cost for order:', {
      city: data.city,
      province: data.province,
      country: data.country,
      postalCode: data.postalCode
    });
    
    apiRequest('POST', '/api/shipping/calculate', {
      city: data.city,
      province: data.province,
      country: data.country,
      postalCode: data.postalCode
    })
    .then(response => {
      if (!response.ok) {
        // Try to parse the error response as JSON
        return response.json().then(errorData => {
          if (errorData.error === 'Shipping unavailable') {
            toast({
              title: "Shipping Unavailable",
              description: errorData.details || "Your location is outside our delivery range",
              variant: "destructive",
            });
            throw new Error("Location outside delivery range");
          } else {
            throw new Error(`Shipping calculation failed: ${response.status}`);
          }
        }).catch(e => {
          if (e.message === "Location outside delivery range") {
            throw e;
          }
          throw new Error(`Shipping calculation failed: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(result => {
      console.log('Final shipping calculation result:', result);
      if (result.shippingCost !== undefined) {
        const calculatedShippingCost = result.shippingCost;
        setShippingCost(calculatedShippingCost);
        
        // Check if shipping cost is -1 (outside delivery range)
        if (calculatedShippingCost === -1) {
          toast({
            title: "Cannot Place Order",
            description: "Your location is outside our delivery range. Please choose pickup or try a different address.",
            variant: "destructive",
          });
          return;
        }
        
        // Add shipping cost to the order data
        console.log('Placing order with calculated shipping cost:', calculatedShippingCost);
        placeOrderMutation.mutate({
          ...data,
          shippingCost: calculatedShippingCost
        });
      } else {
        throw new Error("No shipping cost returned from API");
      }
    })
    .catch(error => {
      console.error("Error calculating shipping cost:", error);
      
      // Don't proceed if the error is about location being outside delivery range
      if (error.message === "Location outside delivery range") {
        return;
      }
      
      toast({
        title: "Shipping Calculation Error",
        description: "Could not calculate shipping cost. Using default cost.",
        variant: "destructive",
      });
      
      // Use a default shipping cost if calculation fails
      const defaultShippingCost = 3000; // Default $30.00 in cents
      console.log('Using default shipping cost:', defaultShippingCost);
      placeOrderMutation.mutate({
        ...data,
        shippingCost: defaultShippingCost
      });
    });
  };

  // Handle maintenance mode
  if (isMaintenanceMode) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <Alert className="border-amber-200 bg-amber-50 mb-6">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Ordering Temporarily Unavailable</AlertTitle>
          <AlertDescription className="text-amber-700">
            Our website is currently undergoing maintenance. Purchasing features are temporarily unavailable.
            Please check back later or contact us for assistance.
          </AlertDescription>
        </Alert>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-6">
            We apologize for the inconvenience. Please try again later or contact our customer service team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild>
              <Link href="/products">Continue Browsing</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle authentication issues
  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <div className="text-amber-500 mb-4">
            <CreditCard className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-amber-700 mb-2">Login Required</h2>
          <p className="text-amber-600 mb-4">Please login or create an account to proceed with checkout.</p>
          <Button onClick={() => setLocation("/auth?redirect=/checkout")}>
            Login / Register
          </Button>
        </div>
      </div>
    );
  }

  // Order success screen
  if (orderPlaced && orderId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 pb-8">
            <div className="text-center">
              <div className="text-green-500 mb-4">
                <CheckCircle2 className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your order. Your order number is <strong>#{orderId}</strong>.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="text-lg font-medium mb-3">What happens next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>We'll review your order and contact you shortly to confirm.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>You'll receive an email with your order details.</span>
                  </li>
                  <li className="flex items-start">
                    <Truck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>We'll coordinate with you for delivery or pickup.</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setLocation("/account")} variant="outline">
                  View My Account
                </Button>
                <Button onClick={() => setLocation("/")}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoadingCart) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="h-12 w-48 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // No items in cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
          <div className="text-gray-400 mb-4">
            <ShoppingBag className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add items to your cart before proceeding to checkout.</p>
          <Button asChild size="lg">
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => setLocation("/cart")} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Contact Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Delivery Method</h2>
                
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Select how you'd like to receive your order</FormLabel>
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <label className={`flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${field.value === 'delivery' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input
                            type="radio"
                            value="delivery"
                            className="sr-only"
                            checked={field.value === 'delivery'}
                            onChange={() => field.onChange('delivery')}
                          />
                          <Truck className={`h-5 w-5 mr-3 ${field.value === 'delivery' ? 'text-red-600' : 'text-gray-500'}`} />
                          <div>
                            <span className="font-medium block">Delivery</span>
                            <span className="text-sm text-gray-500">We'll ship to your address</span>
                          </div>
                        </label>

                        <label className={`flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${field.value === 'pickup' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input
                            type="radio"
                            value="pickup"
                            className="sr-only"
                            checked={field.value === 'pickup'}
                            onChange={() => field.onChange('pickup')}
                          />
                          <CheckCircle2 className={`h-5 w-5 mr-3 ${field.value === 'pickup' ? 'text-red-600' : 'text-gray-500'}`} />
                          <div>
                            <span className="font-medium block">Pickup</span>
                            <span className="text-sm text-gray-500">Pick up at our warehouse</span>
                          </div>
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {form.watch('deliveryMethod') === 'delivery' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold border-b pb-2">Shipping Information</h2>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province/State</FormLabel>
                          <FormControl>
                            <Input placeholder="Province/State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal/ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal/ZIP Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">Additional Information</h2>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Special instructions for delivery or any other notes" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="md:hidden">
                <OrderSummary 
                  cart={cart} 
                  shippingCost={shippingCost}
                  onShippingCostCalculated={setShippingCost}
                  deliveryMethod={form.watch('deliveryMethod')}
                  shippingAddress={
                    form.watch('deliveryMethod') === 'delivery' ? {
                      city: form.watch('city') || "",
                      province: form.watch('province') || "",
                      country: form.watch('country') || "",
                      postalCode: form.watch('postalCode')
                    } : null
                  }
                />
              </div>
              
              <div className="pt-4">
                {/* Show warning when shipping is unavailable for delivery */}
                {shippingCost === -1 && form.watch('deliveryMethod') === 'delivery' && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">
                    <p className="font-medium">Shipping Unavailable for This Address</p>
                    <p>Please choose pickup or try a different address that is within our delivery range.</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full py-6 text-xl bg-red-600 hover:bg-red-700" 
                  disabled={placeOrderMutation.isPending || (form.watch('deliveryMethod') === 'delivery' && shippingCost === -1)}
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <div className="h-5 w-5 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Processing...
                    </>
                  ) : form.watch('deliveryMethod') === 'delivery' && shippingCost === -1 ? (
                    "Shipping Unavailable"
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        {/* Order Summary */}
        <div className="hidden md:block">
          <OrderSummary 
            cart={cart} 
            shippingCost={shippingCost}
            onShippingCostCalculated={setShippingCost}
            deliveryMethod={form.watch('deliveryMethod')}
            shippingAddress={
              form.watch('deliveryMethod') === 'delivery' ? {
                city: form.watch('city') || "",
                province: form.watch('province') || "",
                country: form.watch('country') || "",
                postalCode: form.watch('postalCode')
              } : null
            }
          />
        </div>
      </div>
    </div>
  );
};

// Order Summary Component
const OrderSummary = ({ 
  cart, 
  shippingCost = 0, 
  shippingAddress = null,
  onShippingCostCalculated,
  deliveryMethod = 'delivery'
}: { 
  cart: CartResponse; 
  shippingCost?: number;
  onShippingCostCalculated?: (cost: number) => void;
  shippingAddress?: {
    city: string;
    province: string;
    country: string;
    postalCode?: string;
  } | null;
  deliveryMethod?: string;
}) => {
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [calculatedShippingCost, setCalculatedShippingCost] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Calculate shipping when address changes and delivery method is 'delivery'
  useEffect(() => {
    // Only calculate if delivery method is 'delivery' and we have a shipping address
    if (deliveryMethod === 'delivery' && shippingAddress && 
        shippingAddress.city && shippingAddress.province && shippingAddress.country) {
      // Reset state from previous calculations
      if (onShippingCostCalculated) {
        onShippingCostCalculated(0); // Reset to neutral state
      }
      setCalculatingShipping(true);
      
      console.log('Calculating shipping for address:', {
        city: shippingAddress.city,
        province: shippingAddress.province,
        country: shippingAddress.country,
        postalCode: shippingAddress.postalCode || ''
      });
      
      // Call the shipping calculation API
      apiRequest('POST', '/api/shipping/calculate', {
        city: shippingAddress.city,
        province: shippingAddress.province,
        country: shippingAddress.country,
        postalCode: shippingAddress.postalCode || ''
      })
      .then(response => {
        if (!response.ok) {
          // If response not successful, see if there's a structured error message
          return response.json().then(errorData => {
            console.error('Shipping calculation error response:', errorData);
            throw new Error(errorData.details || `Shipping calculation failed: ${response.status}`);
          }).catch(e => {
            // If can't parse as JSON, use status code
            throw new Error(`Shipping calculation failed: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Shipping calculation response:', data);
        if (data.shippingCost !== undefined) {
          const cost = data.shippingCost;
          setCalculatedShippingCost(cost);
          // Notify parent component about the calculated cost
          if (onShippingCostCalculated) {
            onShippingCostCalculated(cost);
          }
        } else if (data.error && data.error === 'Shipping unavailable') {
          // Handle shipping unavailable error (outside delivery range)
          toast({
            title: "Shipping Unavailable",
            description: data.details || "Your location is outside our delivery range",
            variant: "destructive",
          });
          setCalculatedShippingCost(null);
          // Set shipping cost to -1 to indicate it's not available
          if (onShippingCostCalculated) {
            onShippingCostCalculated(-1);
          }
        } else {
          console.error('Invalid shipping cost response:', data);
          // Use a default cost when the response is invalid
          const defaultCost = 3000; // $30 default
          setCalculatedShippingCost(defaultCost);
          // Notify parent component about the default cost
          if (onShippingCostCalculated) {
            onShippingCostCalculated(defaultCost);
          }
        }
      })
      .catch(error => {
        console.error('Error calculating shipping:', error);
        // Set a default cost on error instead of null
        const defaultCost = 3000; // $30 default
        setCalculatedShippingCost(defaultCost);
        // Notify parent component about the default cost
        if (onShippingCostCalculated) {
          onShippingCostCalculated(defaultCost);
        }
      })
      .finally(() => {
        setCalculatingShipping(false);
      });
    } else if (deliveryMethod === 'pickup') {
      // If pickup is selected, set shipping cost to 0
      setCalculatedShippingCost(0);
      if (onShippingCostCalculated) {
        onShippingCostCalculated(0);
      }
    } else {
      // Clear shipping cost if no address
      setCalculatedShippingCost(null);
    }
  }, [
    deliveryMethod,
    shippingAddress?.city, 
    shippingAddress?.province, 
    shippingAddress?.country, 
    shippingAddress?.postalCode, 
    onShippingCostCalculated
  ]);
  
  // Check if shipping is unavailable (indicated by -1 cost)
  const isShippingUnavailable = (shippingCost === -1 || calculatedShippingCost === -1) && deliveryMethod === 'delivery';
  
  // Use provided shipping cost from parent, or calculated cost
  const finalShippingCost = 
    deliveryMethod === 'pickup' ? 0 : 
    isShippingUnavailable ? 0 : // Don't add shipping cost if unavailable
    (shippingCost || calculatedShippingCost || 0);
  
  // Calculate total
  const total = cart.total + finalShippingCost;

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 sticky top-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-4 mb-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="h-16 w-16 flex-shrink-0 rounded-md border border-gray-200 overflow-hidden">
              <img
                src={item.product.imageUrl}
                alt={item.product.title}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Image+Not+Available";
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">{item.product.title}</h3>
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              <p className="text-sm font-medium">C${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>C${(cart.total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Shipping</span>
          {calculatingShipping ? (
            <span className="flex items-center">
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Calculating...
            </span>
          ) : deliveryMethod === 'pickup' ? (
            <span>Free (Pickup)</span>
          ) : isShippingUnavailable ? (
            <span className="text-red-600 font-medium">Unavailable</span>
          ) : finalShippingCost > 0 ? (
            <span>C${(finalShippingCost).toFixed(2)}</span>
          ) : (
            <span>{shippingAddress ? "Free" : "Enter shipping address"}</span>
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>C${(total).toFixed(2)}</span>
      </div>
      
      {isShippingUnavailable && deliveryMethod === 'delivery' && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          <p className="font-medium mb-1">Location Out of Delivery Range</p>
          <p>Your address is outside our delivery area. Please choose pickup or try a different address.</p>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Secure payment via credit card processed by Stripe.</p>
      </div>
    </div>
  );
};

export default CheckoutPage;