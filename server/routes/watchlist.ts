import express from "express";

const router = express.Router();

// Get user's watchlist
router.get("/", async (req, res) => {
  try {
    console.log("Watchlist request received for user:", req.user);
    
    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Please login to view watchlist" });
    }

    // Mock watchlist data for now - in real app would query database
    const mockWatchlist = [
      {
        id: 1,
        title: "Amazon Return Pallet - Electronics Mix",
        currentBid: 125000,
        startingPrice: 100000,
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: "active",
        productImage: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320123/jaberco_ecommerce/products/image_1733320123052.jpg",
        totalBids: 15,
        isWatching: true
      },
      {
        id: 2,
        title: "Brand New Clothing Lot - Designer Items",
        currentBid: 85000,
        startingPrice: 75000,
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        status: "active",
        productImage: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320123/jaberco_ecommerce/products/image_1733320123052.jpg",
        totalBids: 8,
        isWatching: true
      }
    ];

    res.json(mockWatchlist);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// Add auction to watchlist
router.post("/:auctionId", async (req, res) => {
  try {
    console.log("Add to watchlist request:", req.params.auctionId, "User:", req.user);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Please login to add to watchlist" });
    }

    const auctionId = parseInt(req.params.auctionId);
    // In real app would add to database
    
    res.json({ 
      success: true,
      watching: true,
      message: "Added to watchlist" 
    });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    res.status(500).json({ error: "Failed to add to watchlist" });
  }
});

// Remove auction from watchlist
router.delete("/:auctionId", async (req, res) => {
  try {
    console.log("Remove from watchlist request:", req.params.auctionId, "User:", req.user);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Please login to remove from watchlist" });
    }

    const auctionId = parseInt(req.params.auctionId);
    // In real app would remove from database
    
    res.json({ 
      success: true,
      watching: false,
      message: "Removed from watchlist" 
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    res.status(500).json({ error: "Failed to remove from watchlist" });
  }
});

export default router;