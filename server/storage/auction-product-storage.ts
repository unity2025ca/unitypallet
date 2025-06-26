// Auction Product Storage - separate from regular products
import { SelectAuctionProduct, InsertAuctionProduct, SelectAuctionProductImage, InsertAuctionProductImage } from '@shared/schema';

class AuctionProductStorage {
  private auctionProducts = new Map<number, SelectAuctionProduct>();
  private auctionProductImages = new Map<number, SelectAuctionProductImage>();
  private nextAuctionProductId = 1;
  private nextImageId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Amazon Return Pallet - Electronics
    const electronicsProduct: SelectAuctionProduct = {
      id: 1,
      title: "Amazon Return Pallet - Electronics Mix",
      titleAr: "طرد عوائد أمازون - خليط إلكترونيات",
      description: "High-value electronics return pallet containing laptops, smartphones, tablets, and accessories. Items may have minor cosmetic defects but are fully functional.",
      descriptionAr: "طرد عوائد إلكترونيات عالي القيمة يحتوي على أجهزة لابتوب وهواتف ذكية وأجهزة لوحية وإكسسوارات. قد تحتوي على عيوب تجميلية طفيفة لكنها تعمل بشكل كامل.",
      category: "Electronics",
      categoryAr: "إلكترونيات",
      condition: "good",
      estimatedValue: 120000, // $1,200.00
      weight: 15000, // 15kg
      dimensions: "80x60x40 cm",
      location: "Toronto Warehouse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Brand New Close Box Items
    const clothingProduct: SelectAuctionProduct = {
      id: 2,
      title: "Brand New Close Box Items - Clothing & Accessories",
      titleAr: "منتجات جديدة في صناديق مغلقة - ملابس وإكسسوارات",
      description: "Unopened boxes containing brand new clothing items, shoes, and fashion accessories from major retailers. All items are new with tags.",
      descriptionAr: "صناديق غير مفتوحة تحتوي على ملابس جديدة وأحذية وإكسسوارات أزياء من متاجر كبرى. جميع المنتجات جديدة مع العلامات.",
      category: "Fashion",
      categoryAr: "أزياء",
      condition: "new",
      estimatedValue: 80000, // $800.00
      weight: 10000, // 10kg
      dimensions: "70x50x30 cm",
      location: "Montreal Warehouse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Home & Kitchen Items
    const homeProduct: SelectAuctionProduct = {
      id: 3,
      title: "Home & Kitchen Return Pallet",
      titleAr: "طرد عوائد المنزل والمطبخ",
      description: "Mixed home and kitchen appliances, cookware, and decorative items. Perfect for resellers or home use.",
      descriptionAr: "خليط من أجهزة المنزل والمطبخ وأدوات الطبخ والمنتجات الزخرفية. مثالي لتجار التجزئة أو الاستخدام المنزلي.",
      category: "Home & Garden",
      categoryAr: "المنزل والحديقة",
      condition: "like_new",
      estimatedValue: 60000, // $600.00
      weight: 20000, // 20kg
      dimensions: "90x70x50 cm",
      location: "Vancouver Warehouse",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.auctionProducts.set(1, electronicsProduct);
    this.auctionProducts.set(2, clothingProduct);
    this.auctionProducts.set(3, homeProduct);
    this.nextAuctionProductId = 4;

    // Add images for auction products
    const images: SelectAuctionProductImage[] = [
      {
        id: 1,
        auctionProductId: 1,
        imageUrl: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320123/jaberco_ecommerce/products/image_1733320123052.jpg",
        isMain: true,
        altText: "Electronics Return Pallet",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        auctionProductId: 2,
        imageUrl: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320184/jaberco_ecommerce/products/image_1733320184199.jpg",
        isMain: true,
        altText: "Clothing Close Box Items",
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        auctionProductId: 3,
        imageUrl: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg",
        isMain: true,
        altText: "Home & Kitchen Items",
        createdAt: new Date().toISOString(),
      },
    ];

    images.forEach(image => {
      this.auctionProductImages.set(image.id, image);
    });
    this.nextImageId = 4;
  }

  // Auction Product methods
  getAllAuctionProducts() {
    return Array.from(this.auctionProducts.values());
  }

  getAuctionProductById(id: number) {
    return this.auctionProducts.get(id) || null;
  }

  createAuctionProduct(productData: Omit<SelectAuctionProduct, 'id' | 'createdAt' | 'updatedAt'>) {
    const product: SelectAuctionProduct = {
      ...productData,
      id: this.nextAuctionProductId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.auctionProducts.set(product.id, product);
    return product;
  }

  updateAuctionProduct(id: number, productData: Partial<Omit<SelectAuctionProduct, 'id' | 'createdAt'>>) {
    const existingProduct = this.auctionProducts.get(id);
    if (!existingProduct) return null;

    const updatedProduct: SelectAuctionProduct = {
      ...existingProduct,
      ...productData,
      updatedAt: new Date().toISOString(),
    };
    this.auctionProducts.set(id, updatedProduct);
    return updatedProduct;
  }

  deleteAuctionProduct(id: number) {
    const deleted = this.auctionProducts.delete(id);
    // Also delete associated images
    for (const [imageId, image] of this.auctionProductImages.entries()) {
      if (image.auctionProductId === id) {
        this.auctionProductImages.delete(imageId);
      }
    }
    return deleted;
  }

  // Image methods
  getImagesByAuctionProductId(auctionProductId: number) {
    return Array.from(this.auctionProductImages.values())
      .filter(image => image.auctionProductId === auctionProductId);
  }

  getMainImageByAuctionProductId(auctionProductId: number) {
    return Array.from(this.auctionProductImages.values())
      .find(image => image.auctionProductId === auctionProductId && image.isMain) || null;
  }

  addImageToAuctionProduct(imageData: Omit<SelectAuctionProductImage, 'id' | 'createdAt'>) {
    const image: SelectAuctionProductImage = {
      ...imageData,
      id: this.nextImageId++,
      createdAt: new Date().toISOString(),
    };
    this.auctionProductImages.set(image.id, image);
    return image;
  }

  deleteAuctionProductImage(imageId: number) {
    return this.auctionProductImages.delete(imageId);
  }

  setMainImage(auctionProductId: number, imageId: number) {
    // First, unset all main images for this product
    for (const [id, image] of this.auctionProductImages.entries()) {
      if (image.auctionProductId === auctionProductId && image.isMain) {
        this.auctionProductImages.set(id, { ...image, isMain: false });
      }
    }

    // Then set the new main image
    const targetImage = this.auctionProductImages.get(imageId);
    if (targetImage && targetImage.auctionProductId === auctionProductId) {
      this.auctionProductImages.set(imageId, { ...targetImage, isMain: true });
      return true;
    }
    return false;
  }
}

export const auctionProductStorage = new AuctionProductStorage();