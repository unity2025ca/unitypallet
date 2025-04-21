import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import translations from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ContactPage = () => {
  const { toast } = useToast();
  
  // Contact form
  const form = useForm({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });
  
  // Submit contact form
  const submitContact = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "We will contact you as soon as possible",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Failed to Send Message",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: any) => {
    submitContact.mutate(data);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="md:flex md:space-x-8">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-neutral-dark font-primary mb-6">
              {translations.contact.title}
            </h2>
            <p className="text-gray-600 mb-8">
              {translations.contact.subtitle}
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.contact.form.name}</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>{translations.contact.form.email}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
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
                      <FormLabel>{translations.contact.form.phone}</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" dir="ltr" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.contact.form.message}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitContact.isPending}
                >
                  {submitContact.isPending ? (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </span>
                  ) : (
                    translations.contact.form.submit
                  )}
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="md:w-1/2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-neutral-dark font-primary mb-6">
                  {translations.contact.info.title}
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-primary">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div>
                      <p className="font-medium">{translations.contact.info.address.label}</p>
                      <p className="text-gray-600">{translations.contact.info.address.value}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-primary">
                      <i className="fas fa-phone-alt"></i>
                    </div>
                    <div>
                      <p className="font-medium">{translations.contact.info.phone.label}</p>
                      <p className="text-gray-600">{translations.contact.info.phone.value}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-primary">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div>
                      <p className="font-medium">{translations.contact.info.email.label}</p>
                      <p className="text-gray-600">{translations.contact.info.email.value}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                      <i className="fab fa-whatsapp"></i>
                    </div>
                    <div>
                      <p className="font-medium">{translations.contact.info.whatsapp.label}</p>
                      <p className="text-gray-600">{translations.contact.info.whatsapp.value}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-neutral-dark mb-3">{translations.contact.info.social.label}</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-600 text-white hover:bg-pink-700 transition">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-500 transition">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Map Placeholder */}
              <div className="h-64 bg-gray-200 border-t border-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span className="text-center">
                    <i className="fas fa-map text-4xl mb-2"></i>
                    <p>Location Map</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
