import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import translations from "@/lib/i18n-temp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const CTA = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const { toast } = useToast();
  
  const subscribe = useMutation({
    mutationFn: async (data: { email: string, phone?: string }) => {
      const res = await apiRequest("POST", "/api/subscribe", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscribed Successfully",
        description: "We'll keep you updated with the latest offers and pallets",
      });
      setEmail("");
      setPhone("");
    },
    onError: () => {
      toast({
        title: "Subscription Failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
    },
  });
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      toast({
        title: "Missing Information",
        description: "Please provide either an email or phone number",
        variant: "destructive",
      });
      return;
    }
    
    if (showPhoneInput) {
      // Phone-based subscription
      if (!phone) {
        toast({
          title: "Phone Number Required",
          description: "Please enter a valid phone number to subscribe",
          variant: "destructive",
        });
        return;
      }
      
      subscribe.mutate({ email: '', phone });
    } else {
      // Email-based subscription
      if (!email) {
        toast({
          title: "Email Required",
          description: "Please enter a valid email address to subscribe",
          variant: "destructive",
        });
        return;
      }
      
      const data: { email: string, phone?: string } = { email };
      if (phone) {
        data.phone = phone;
      }
      
      subscribe.mutate(data);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-r from-primary to-black text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold font-primary mb-6">
          {translations.cta.title}
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          {translations.cta.subtitle}
        </p>
        
        <div className="max-w-md mx-auto">
          <div className="mb-4 flex justify-center">
            <div className="flex gap-4 bg-white bg-opacity-20 p-2 rounded-full">
              <button
                type="button"
                className={`px-4 py-1 rounded-full ${!showPhoneInput ? 'bg-white text-black' : 'text-white'}`}
                onClick={() => setShowPhoneInput(false)}
              >
                Email
              </button>
              <button
                type="button"
                className={`px-4 py-1 rounded-full ${showPhoneInput ? 'bg-white text-black' : 'text-white'}`}
                onClick={() => setShowPhoneInput(true)}
              >
                Phone
              </button>
            </div>
          </div>
          
          <form 
            className="flex flex-col space-y-2"
            onSubmit={handleSubscribe}
          >
            {!showPhoneInput ? (
              <div className="flex flex-col md:flex-row">
                <Input
                  type="email"
                  placeholder={translations.cta.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full md:flex-1 px-4 py-3 rounded-r-lg md:rounded-r-none rounded-lg md:rounded-l-lg mb-2 md:mb-0 border-0 focus:ring-2 focus:ring-amber-300"
                />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-[#650000] text-white font-bold py-3 px-6 rounded-lg md:rounded-l-none md:rounded-r-lg"
                  disabled={subscribe.isPending}
                >
                  {subscribe.isPending ? (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      Subscribing...
                    </span>
                  ) : (
                    translations.cta.button
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <div>
                  <PhoneInput
                    country={'ca'} // Default to Canada
                    value={phone}
                    onChange={(phone) => setPhone("+" + phone)}
                    inputClass="!w-full !h-12 !text-base !rounded-lg"
                    containerClass="!w-full"
                    placeholder="Enter phone number with country code"
                    enableSearch={true}
                    disableSearchIcon={true}
                    searchPlaceholder="Search country..."
                    searchClass="!py-2 !px-3"
                    buttonClass="!px-3 !border-r !rounded-l-lg"
                    inputProps={{
                      required: true,
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-[#650000] text-white font-bold py-3 px-6 rounded-lg w-full"
                  disabled={subscribe.isPending}
                >
                  {subscribe.isPending ? (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      Subscribing...
                    </span>
                  ) : (
                    translations.cta.button
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default CTA;
