import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import translations from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const CTA = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const subscribe = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/subscribe", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الاشتراك بنجاح",
        description: "سنبقيك على اطلاع بأحدث العروض والبالات",
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "فشل الاشتراك",
        description: "يرجى التحقق من بريدك الإلكتروني والمحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribe.mutate(email);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-r from-primary to-blue-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold font-tajawal mb-6">
          {translations.cta.title}
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          {translations.cta.subtitle}
        </p>
        
        <div className="max-w-md mx-auto">
          <form 
            className="flex flex-col md:flex-row"
            onSubmit={handleSubscribe}
          >
            <Input
              type="email"
              placeholder={translations.cta.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full md:flex-1 px-4 py-3 rounded-r-lg md:rounded-r-none rounded-l-lg mb-2 md:mb-0 border-0 focus:ring-2 focus:ring-amber-300"
              dir="rtl"
            />
            <Button
              type="submit"
              className="bg-[#F59E0B] hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-l-lg md:rounded-l-none rounded-r-lg md:rounded-r-none"
              disabled={subscribe.isPending}
            >
              {subscribe.isPending ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  جارٍ...
                </span>
              ) : (
                translations.cta.button
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CTA;
