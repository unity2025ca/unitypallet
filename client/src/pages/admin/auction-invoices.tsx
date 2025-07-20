import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Download, Eye, CreditCard, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface AuctionInvoice {
  id: number;
  invoiceNumber: string;
  auctionTitle: string;
  winnerName: string;
  winningBidAmount: number;
  buyerPremiumAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
  dueDate: string;
  paidAt?: string;
}

export default function AuctionInvoicesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch auction invoices
  const { data: invoices, isLoading } = useQuery<AuctionInvoice[]>({
    queryKey: ['/api/admin/auction-invoices'],
  });

  // Update payment status mutation
  const updatePaymentMutation = useMutation({
    mutationFn: ({ invoiceId, paymentStatus, paymentMethod }: { 
      invoiceId: number; 
      paymentStatus: string; 
      paymentMethod?: string 
    }) => {
      return apiRequest(`/api/admin/auction-invoices/${invoiceId}/payment`, 'PATCH', {
        paymentStatus,
        paymentMethod
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/auction-invoices'] });
      toast({
        title: "Payment Updated",
        description: "Invoice payment status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "Pending" },
      paid: { variant: "default" as const, label: "Paid" },
      failed: { variant: "destructive" as const, label: "Failed" },
      refunded: { variant: "secondary" as const, label: "Refunded" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.auctionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.winnerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleDownloadInvoice = (invoice: AuctionInvoice) => {
    // Generate and download invoice PDF
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      auctionTitle: invoice.auctionTitle,
      winnerName: invoice.winnerName,
      winningBid: formatCurrency(invoice.winningBidAmount),
      buyerPremium: formatCurrency(invoice.buyerPremiumAmount),
      tax: formatCurrency(invoice.taxAmount),
      shipping: formatCurrency(invoice.shippingCost),
      total: formatCurrency(invoice.totalAmount),
      createdAt: new Date(invoice.createdAt).toLocaleDateString(),
      dueDate: new Date(invoice.dueDate).toLocaleDateString(),
      paymentStatus: invoice.paymentStatus
    };

    // Create and download a simple invoice text file
    const invoiceContent = `
JABERCO AUCTION INVOICE
=======================

Invoice Number: ${invoiceData.invoiceNumber}
Date: ${invoiceData.createdAt}
Due Date: ${invoiceData.dueDate}

AUCTION DETAILS
---------------
Auction: ${invoiceData.auctionTitle}
Winner: ${invoiceData.winnerName}

CHARGES
-------
Winning Bid: ${invoiceData.winningBid}
Buyer Premium: ${invoiceData.buyerPremium}
Tax: ${invoiceData.tax}
Shipping: ${invoiceData.shipping}
---------
Total: ${invoiceData.total}

Payment Status: ${invoiceData.paymentStatus.toUpperCase()}
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Auction Invoices</h1>
        </div>
        <div className="text-center py-8">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Auction Invoices</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number, auction, or winner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Auction</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead>Winning Bid</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.auctionTitle}</TableCell>
                  <TableCell>{invoice.winnerName}</TableCell>
                  <TableCell>{formatCurrency(invoice.winningBidAmount)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.paymentStatus)}</TableCell>
                  <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.paymentStatus === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updatePaymentMutation.mutate({
                            invoiceId: invoice.id,
                            paymentStatus: 'paid',
                            paymentMethod: 'manual'
                          })}
                          disabled={updatePaymentMutation.isPending}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No invoices found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}