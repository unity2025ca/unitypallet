import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Advertisement } from "@shared/schema";

interface AdvertisementBannerProps {
  position?: string;
  className?: string;
}

export default function AdvertisementBanner({ position = "homepage", className = "" }: AdvertisementBannerProps) {
  const { data: advertisements = [], isLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements", position],
    queryFn: () => fetch(`/api/advertisements?position=${position}`).then(res => res.json()),
  });

  const activeAds = advertisements.filter(ad => ad.isActive);

  if (isLoading || activeAds.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {activeAds.map((ad) => (
        <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              {ad.imageUrl && (
                <div className="md:w-1/3 relative">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                </div>
              )}
              
              {/* Content Section */}
              <div className={`${ad.imageUrl ? 'md:w-2/3' : 'w-full'} p-6 flex flex-col justify-center`}>
                <div className="mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {ad.title}
                  </h2>
                  {ad.content && (
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {ad.content}
                    </p>
                  )}
                </div>
                
                {ad.linkUrl && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {ad.linkUrl.startsWith('http') ? (
                        <a 
                          href={ad.linkUrl}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <Button 
                            size="lg" 
                            className="group"
                            style={{ backgroundColor: '#dc2626' }}
                          >
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </a>
                      ) : (
                        <Link href={ad.linkUrl}>
                          <Button 
                            size="lg" 
                            className="group"
                            style={{ backgroundColor: '#dc2626' }}
                          >
                            Shop Now
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )
                    }
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}