import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCustomerAuth } from "@/hooks/use-customer-auth";
import { customerRegistrationSchema, loginSchema } from "@shared/schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [location, setLocation] = useLocation();
  const { customer, loginMutation, registerMutation } = useCustomerAuth();
  
  // Redirect to home if already logged in
  if (customer) {
    setLocation("/");
    return null;
  }
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Registration form
  const registerForm = useForm<z.infer<typeof customerRegistrationSchema>>({
    resolver: zodResolver(customerRegistrationSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      phone: "",
    } as z.infer<typeof customerRegistrationSchema>,
  });
  
  // Handle login form submission
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };
  
  // Handle registration form submission
  const onRegisterSubmit = (data: z.infer<typeof customerRegistrationSchema>) => {
    registerMutation.mutate(data);
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Auth Forms */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              {activeTab === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "مرحبًا بعودتك! يرجى إدخال بيانات تسجيل الدخول للوصول إلى حسابك."
                : "نحن سعداء لانضمامك إلينا! أنشئ حسابك الآن للاستمتاع بتجربة تسوق مميزة."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register">حساب جديد</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل اسم المستخدم" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جارِ تسجيل الدخول...
                        </>
                      ) : "تسجيل الدخول"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Registration Form */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل اسم المستخدم" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل الاسم الكامل" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input placeholder="+123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="أعد إدخال كلمة المرور" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جارِ إنشاء الحساب...
                        </>
                      ) : "إنشاء حساب"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Right Column: Hero/Information */}
        <div className="flex flex-col space-y-6 justify-center text-center md:text-right">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            وحدة للكترونيات والمنتجات
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl max-w-[600px] mx-auto md:mx-0">
            أنشئ حسابك الآن واستمتع بالوصول إلى جميع المنتجات المتميزة والعروض الحصرية.
            تسوق بسهولة وأمان من خلال منصتنا المتطورة.
          </p>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-center md:justify-start">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                1
              </div>
              <p className="mr-4 text-lg font-medium">سهولة التسوق والطلب مباشرة عبر الموقع</p>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                2
              </div>
              <p className="mr-4 text-lg font-medium">متابعة حالة الطلبات بسهولة وأمان</p>
            </div>
            <div className="flex items-center justify-center md:justify-start">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                3
              </div>
              <p className="mr-4 text-lg font-medium">الدفع الآمن والسريع عبر بوابة دفع متكاملة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}