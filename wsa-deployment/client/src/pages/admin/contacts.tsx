import { useQuery, useMutation } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLocation } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, RefreshCw, Trash2, Mail, ExternalLink } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Interface for Contact
interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

const AdminContacts = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch contacts
  const { 
    data: contacts, 
    isLoading: isLoadingContacts,
    refetch: refetchContacts
  } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    enabled: isAuthenticated,
  });

  // Mark contact as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/contacts/${id}/read`, { isRead: true });
      if (!res.ok) {
        throw new Error("Failed to mark contact as read");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث حالة الرسالة",
        description: "تم تحديث حالة القراءة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تحديث حالة الرسالة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/contacts/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete contact");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الرسالة بنجاح",
        description: "تم حذف الرسالة من قاعدة البيانات",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      setIsDeleteDialogOpen(false);
      setSelectedContact(null);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل حذف الرسالة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPpp", { locale: ar });
    } catch (error) {
      return "تاريخ غير صالح";
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts?.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      searchQuery === "" || 
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.phone && contact.phone.includes(searchQuery)) ||
      (contact.subject && contact.subject.toLowerCase().includes(searchLower)) ||
      contact.message.toLowerCase().includes(searchLower)
    );
  });

  // Sort contacts
  const sortedContacts = filteredContacts ? [...filteredContacts].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc" 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "name") {
      return sortOrder === "asc" 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "email") {
      return sortOrder === "asc" 
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    }
    return 0;
  }) : [];

  // Handle view contact
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      markAsReadMutation.mutate(contact.id);
    }
  };

  // Handle delete contact
  const handleDeleteContact = () => {
    if (selectedContact) {
      deleteContactMutation.mutate(selectedContact.id);
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === "asc" ? "desc" : "asc");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-8 mr-64">
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
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

  // Count unread messages
  const unreadCount = contacts?.filter(contact => !contact.isRead).length || 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 mr-64">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold font-tajawal">
              إدارة رسائل الاتصال
            </h1>
            <p className="text-gray-500 mt-1">
              عرض وإدارة رسائل الاتصال من العملاء
            </p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => refetchContacts()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-1">{contacts?.length || 0}</div>
              <div className="text-sm text-gray-500">إجمالي الرسائل</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-1 text-amber-600">{unreadCount}</div>
              <div className="text-sm text-gray-500">رسائل غير مقروءة</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-1 text-green-600">{(contacts?.length || 0) - unreadCount}</div>
              <div className="text-sm text-gray-500">رسائل مقروءة</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Contacts Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-tajawal text-2xl">رسائل الاتصال</CardTitle>
            <CardDescription>
              عرض وإدارة رسائل الاتصال الواردة من الموقع
            </CardDescription>
            
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني أو محتوى الرسالة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">التاريخ</SelectItem>
                    <SelectItem value="name">الاسم</SelectItem>
                    <SelectItem value="email">البريد الإلكتروني</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={toggleSortOrder}>
                  {sortOrder === "asc" ? "تصاعدي" : "تنازلي"}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoadingContacts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedContacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-lg mb-1">لا توجد رسائل</h3>
                <p className="text-gray-500">لم يتم العثور على أي رسائل اتصال</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>المرسل</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>الرسالة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedContacts.map((contact) => (
                      <TableRow 
                        key={contact.id} 
                        className={!contact.isRead ? "bg-amber-50" : undefined}
                      >
                        <TableCell className="font-medium">{contact.id}</TableCell>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{contact.message.substring(0, 50)}{contact.message.length > 50 ? "..." : ""}</TableCell>
                        <TableCell>{formatDate(contact.createdAt)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${contact.isRead 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"}`}>
                            {contact.isRead ? "مقروءة" : "غير مقروءة"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewContact(contact)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              عرض
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedContact(contact);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* View Contact Dialog */}
        {selectedContact && (
          <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>رسالة من {selectedContact.name}</DialogTitle>
                <DialogDescription>
                  تم الاستلام في {formatDate(selectedContact.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">المرسل</p>
                    <p className="text-gray-700">{selectedContact.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">البريد الإلكتروني</p>
                    <p className="text-gray-700">{selectedContact.email}</p>
                  </div>
                </div>
                
                {selectedContact.phone && (
                  <div>
                    <p className="text-sm font-medium mb-1">رقم الهاتف</p>
                    <p className="text-gray-700">{selectedContact.phone}</p>
                  </div>
                )}
                
                {selectedContact.subject && (
                  <div>
                    <p className="text-sm font-medium mb-1">الموضوع</p>
                    <p className="text-gray-700">{selectedContact.subject}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium mb-1">الرسالة</p>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف الرسالة
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedContact.email}`)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    الرد بالبريد
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setSelectedContact(null)}
                >
                  إغلاق
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Delete Contact Dialog */}
        <AlertDialog 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف هذه الرسالة نهائيًا من قاعدة البيانات ولا يمكن استعادتها.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteContact}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleteContactMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جارِ الحذف...
                  </>
                ) : (
                  'نعم، حذف الرسالة'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminContacts;