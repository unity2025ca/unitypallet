import { Router } from 'express';
import { auctionProductStorage } from '../storage/auction-product-storage.js';

const router = Router();

// Get all auction products
router.get('/', (req, res) => {
  try {
    const auctionProducts = auctionProductStorage.getAllAuctionProducts();
    
    // Add main images to each product
    const productsWithImages = auctionProducts.map(product => {
      const mainImage = auctionProductStorage.getMainImageByAuctionProductId(product.id);
      return {
        ...product,
        mainImage: mainImage?.imageUrl || null,
        images: auctionProductStorage.getImagesByAuctionProductId(product.id),
      };
    });
    
    res.json(productsWithImages);
  } catch (error) {
    console.error('Error fetching auction products:', error);
    res.status(500).json({ error: 'Failed to fetch auction products' });
  }
});

// Get auction product by ID
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = auctionProductStorage.getAuctionProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Auction product not found' });
    }
    
    const images = auctionProductStorage.getImagesByAuctionProductId(id);
    const mainImage = auctionProductStorage.getMainImageByAuctionProductId(id);
    
    res.json({
      ...product,
      images,
      mainImage: mainImage?.imageUrl || null,
    });
  } catch (error) {
    console.error('Error fetching auction product:', error);
    res.status(500).json({ error: 'Failed to fetch auction product' });
  }
});

// Create new auction product (admin only)
router.post('/', (req, res) => {
  try {
    const productData = req.body;
    const newProduct = auctionProductStorage.createAuctionProduct(productData);
    
    // If imageUrl is provided, add it as the main image
    if (productData.imageUrl) {
      auctionProductStorage.addImageToAuctionProduct({
        auctionProductId: newProduct.id,
        imageUrl: productData.imageUrl,
        altText: productData.title,
        isMain: true,
      });
    }
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating auction product:', error);
    res.status(500).json({ error: 'Failed to create auction product' });
  }
});

// Update auction product (admin only)
router.patch('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedProduct = auctionProductStorage.updateAuctionProduct(id, updates);
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Auction product not found' });
    }
    
    // If imageUrl is provided and different, update the main image
    if (updates.imageUrl) {
      const existingMainImage = auctionProductStorage.getMainImageByAuctionProductId(id);
      
      if (!existingMainImage || existingMainImage.imageUrl !== updates.imageUrl) {
        // Remove existing main image if any
        if (existingMainImage) {
          auctionProductStorage.deleteAuctionProductImage(existingMainImage.id);
        }
        
        // Add new main image
        auctionProductStorage.addImageToAuctionProduct({
          auctionProductId: id,
          imageUrl: updates.imageUrl,
          altText: updatedProduct.title,
          isMain: true,
        });
      }
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating auction product:', error);
    res.status(500).json({ error: 'Failed to update auction product' });
  }
});

// Delete auction product (admin only)
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = auctionProductStorage.deleteAuctionProduct(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Auction product not found' });
    }
    
    res.json({ success: true, message: 'Auction product deleted successfully' });
  } catch (error) {
    console.error('Error deleting auction product:', error);
    res.status(500).json({ error: 'Failed to delete auction product' });
  }
});

// Get images for auction product
router.get('/:id/images', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const images = auctionProductStorage.getImagesByAuctionProductId(id);
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching auction product images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Add image to auction product
router.post('/:id/images', (req, res) => {
  try {
    const auctionProductId = parseInt(req.params.id);
    const { imageUrl, altText, isMain } = req.body;
    
    const newImage = auctionProductStorage.addImageToAuctionProduct({
      auctionProductId,
      imageUrl,
      altText,
      isMain: isMain || false,
    });
    
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error adding auction product image:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Set main image for auction product
router.patch('/:productId/images/:imageId/set-main', (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const imageId = parseInt(req.params.imageId);
    
    const success = auctionProductStorage.setMainImage(productId, imageId);
    
    if (!success) {
      return res.status(404).json({ error: 'Image or product not found' });
    }
    
    res.json({ success: true, message: 'Main image updated successfully' });
  } catch (error) {
    console.error('Error setting main image:', error);
    res.status(500).json({ error: 'Failed to set main image' });
  }
});

// Delete auction product image
router.delete('/images/:imageId', (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    const deleted = auctionProductStorage.deleteAuctionProductImage(imageId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting auction product image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;