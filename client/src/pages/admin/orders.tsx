import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import translations from "@/lib/i18n";
import Sidebar from "@/components/admin/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Contact } from "@shared/schema";

const AdminOrders = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  // Fetch contacts/messages
  const { data: contacts, isLoading: isLoadingContacts } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    enabled: isAuthenticated,
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8 mr-64">
          <div className="flex justify-center items-center h-full">
            <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    navigate("/admin/login");
    return null;
  }
  
  // Format date function
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPpp", { locale: ar });
    } catch (error) {
      return "تاريخ غير صالح";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 mr-64">
        <h1 className="text-3xl font-bold mb-6 font-tajawal">
          {translations.admin.orders.title}
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-tajawal">رسائل التواصل</CardTitle>
            <CardDescription>
              عرض جميع رسائل التواصل الواردة من العملاء
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingContacts ? (
              <div className="flex justify-center py-8">
                <div className="w-12 h-12 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : contacts && contacts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>رقم الجوال</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الرسالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell dir="ltr">{contact.email}</TableCell>
                        <TableCell dir="ltr">{contact.phone}</TableCell>
                        <TableCell>{formatDate(contact.createdAt)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="link" className="p-0 h-auto">
                                عرض الرسالة
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-tajawal">رسالة من {contact.name}</DialogTitle>
                                <DialogDescription dir="ltr">
                                  {contact.email} | {contact.phone}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                                {contact.message}
                              </div>
                              <div className="text-sm text-gray-500 text-left" dir="ltr">
                                {formatDate(contact.createdAt)}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-envelope-open text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">{translations.admin.orders.noOrders}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Subscribers Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-tajawal">المشتركين في القائمة البريدية</CardTitle>
              <CardDescription>
                عرض جميع المشتركين في القائمة البريدية
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingContacts ? (
                <div className="flex justify-center py-8">
                  <div className="w-12 h-12 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <SubscribersList />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Subscribers list component
const SubscribersList = () => {
  const { data: subscribers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/subscribers"],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-12 h-12 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  if (!subscribers || subscribers.length === 0) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">لا يوجد مشتركين في القائمة البريدية حالياً</p>
      </div>
    );
  }
  
  // Format date for subscribers
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPpp", { locale: ar });
    } catch (error) {
      return "تاريخ غير صالح";
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>تاريخ الاشتراك</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((subscriber, index) => (
            <TableRow key={subscriber.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell dir="ltr">{subscriber.email}</TableCell>
              <TableCell>{formatDate(subscriber.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminOrders;
