import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Clock, Gavel, Eye, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Auction {
  id: number;
  productId: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  startingPrice: number;
  reservePrice: number;
  currentBid: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
  status: "draft" | "active" | "ended" | "cancelled";
  totalBids: number;
  isAutoExtend: boolean;
  autoExtendMinutes: number;
  createdAt: string;
  productTitle: string;
  productTitleAr: string;
  productPrice: number;
  productImage: string;
}

function formatTimeLeft(endTime: string) {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const timeLeft = end - now;

  if (timeLeft <= 0) {
    return "انتهت";
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} يوم و ${hours} ساعة`;
  } else if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  } else {
    return `${minutes} دقيقة`;
  }
}

function AuctionCard({ auction }: { auction: Auction }) {
  const timeLeft = formatTimeLeft(auction.endTime);
  const isEnding = new Date().getTime() > new Date(auction.endTime).getTime() - 60 * 60 * 1000; // Less than 1 hour

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={auction.productImage || "/placeholder.jpg"}
          alt={auction.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={auction.status === "active" ? "default" : "secondary"}>
            {auction.status === "active" ? "نشط" : 
             auction.status === "ended" ? "منتهي" : 
             auction.status === "draft" ? "مسودة" : "ملغي"}
          </Badge>
        </div>
        {isEnding && auction.status === "active" && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="animate-pulse">
              ينتهي قريباً
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">
          {auction.titleAr || auction.title}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{timeLeft}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">السعر الحالي</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(auction.currentBid || auction.startingPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">عدد المزايدات</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <Gavel className="w-4 h-4" />
              {auction.totalBids}
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">الزيادة التالية: </span>
            <span className="font-semibold">
              {formatCurrency((auction.currentBid || auction.startingPrice) + auction.bidIncrement)}
            </span>
          </div>
          <Link href={`/auctions/${auction.id}`}>
            <Button size="sm">
              <Eye className="w-4 h-4 mr-2" />
              عرض التفاصيل
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuctionsPage() {
  const { data: auctions, isLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions"],
  });

  const { data: endingAuctions } = useQuery<Auction[]>({
    queryKey: ["/api/auctions", { status: "active", ending: "soon" }],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted"></div>
              <CardContent className="space-y-4 pt-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeAuctions = auctions?.filter(a => a.status === "active") || [];
  const endedAuctions = auctions?.filter(a => a.status === "ended") || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          مزادات جابركو
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          شارك في مزاداتنا الحصرية واحصل على أفضل الصفقات على منتجات Amazon المُعادة
        </p>
      </div>

      {/* Ending Soon Section */}
      {endingAuctions && endingAuctions.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold">ينتهي قريباً</h2>
            <Badge variant="destructive" className="animate-pulse">
              عجل!
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endingAuctions.slice(0, 3).map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="active">المزادات النشطة ({activeAuctions.length})</TabsTrigger>
          <TabsTrigger value="ended">المزادات المنتهية ({endedAuctions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-8">
          {activeAuctions.length === 0 ? (
            <div className="text-center py-12">
              <Gavel className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد مزادات نشطة حالياً</h3>
              <p className="text-muted-foreground">
                تابعنا للحصول على آخر المزادات الجديدة
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ended" className="space-y-8">
          {endedAuctions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد مزادات منتهية</h3>
              <p className="text-muted-foreground">
                المزادات المنتهية ستظهر هنا
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* How It Works Section */}
      <div className="mt-16 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">كيف تعمل المزادات؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">سجل واستكشف</h3>
            <p className="text-sm text-muted-foreground">
              تصفح المزادات النشطة واختر المنتجات التي تهمك
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">ضع مزايدتك</h3>
            <p className="text-sm text-muted-foreground">
              ضع مزايدتك بسعر أعلى من المزايدة الحالية
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">اربح واحصل على المنتج</h3>
            <p className="text-sm text-muted-foreground">
              إذا كنت الأعلى مزايدة عند انتهاء الوقت، فالمنتج لك!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}