import { Link } from "wouter";
import translations from "@/lib/i18n-temp";
import { Product, statusMap } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { isMaintenanceMode } = useSettings();
  
  // Map status to UI components
  const statusColors: Record<string, string> = {
    available: "bg-red-100 text-primary",
    limited: "bg-gray-100 text-black",
    soldout: "bg-black text-white",
  };
  
  const isSoldOut = product.status === "soldout";

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      <img 
        src={product.imageUrl} 
        alt={product.title} 
        className="w-full h-56 object-cover" 
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Available";
        }}
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold font-primary">{product.title}</h3>
          <span className={`${statusColors[product.status || 'available']} text-xs font-bold py-1 px-2 rounded`}>
            {statusMap[product.status || 'available']}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className={`text-lg font-bold ${isSoldOut ? 'text-gray-400' : 'text-primary'}`}>
            C${product.price}
          </span>
          {!isMaintenanceMode ? (
            <Button 
              asChild={!isSoldOut}
              variant={isSoldOut ? "ghost" : "default"}
              className={isSoldOut ? 
                "bg-gray-300 text-gray-600 cursor-not-allowed" : 
                "btn-red"
              }
              disabled={isSoldOut}
            >
              {isSoldOut ? (
                <span>Sold Out</span>
              ) : (
                <Link href={`/products/${product.id}`}>
                  {translations.shop.detailsButton}
                </Link>
              )}
            </Button>
          ) : (
            <Link href={`/products/${product.id}`}>
              <Button variant="default" className="btn-red">
                {translations.shop.detailsButton}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
