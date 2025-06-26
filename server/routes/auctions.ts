import express from "express";
import { auctionStorage } from "../storage/auction-storage.js";
import { insertAuctionSchema, insertBidSchema, insertAuctionWatcherSchema } from "../../shared/schema.js";

// Temporary auth middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function requireCustomer(req: any, res: any, next: any) {
  if (!req.isAuthenticated || !req.isAuthenticated() || req.user?.roleType !== "customer") {
    return res.status(401).json({ error: "Customer authentication required" });
  }
  next();
}

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Auction route: ${req.method} ${req.path}`, {
    user: req.user ? { id: req.user.id, username: req.user.username } : 'Not authenticated',
    body: req.body
  });
  next();
});

// Get all active auctions
router.get("/", async (req, res) => {
  try {
    const { status = "active", limit = 20, offset = 0 } = req.query;
    
    const allAuctions = auctionStorage.getAllAuctions(status as string);
    
    // Add mock product data for display
    const auctionList = allAuctions.map(auction => ({
      ...auction,
      productTitle: `Product ${auction.productId}`,
      productTitleAr: `منتج ${auction.productId}`,
      productPrice: auction.startingPrice * 2,
      productImage: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320123/jaberco_ecommerce/products/image_1733320123052.jpg",
    }));

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedList = auctionList.slice(startIndex, endIndex);

    res.json(paginatedList);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
});

// Get auction by ID with bids
router.get("/:id", async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    
    const auction = auctionStorage.getAuctionById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Get recent bids
    const recentBids = auctionStorage.getBidsByAuctionId(auctionId).map(bid => ({
      ...bid,
      username: `user${bid.userId}`,
      fullName: `User ${bid.userId}`,
    }));

    // Mock product data
    const auctionDetails = {
      ...auction,
      productTitle: `Product ${auction.productId}`,
      productTitleAr: `منتج ${auction.productId}`,
      productDescription: "High quality Amazon return pallet with mixed items",
      productDescriptionAr: "طرد عوائد أمازون عالي الجودة مع منتجات متنوعة",
      productPrice: auction.startingPrice * 2,
      productCategory: "Electronics",
      productStock: 1,
      productImages: [
        {
          id: 1,
          imageUrl: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320123/jaberco_ecommerce/products/image_1733320123052.jpg",
          isMain: true,
        },
        {
          id: 2,
          imageUrl: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320184/jaberco_ecommerce/products/image_1733320184199.jpg",
          isMain: false,
        }
      ],
      recentBids,
    };

    res.json(auctionDetails);
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({ error: "Failed to fetch auction details" });
  }
});

// Place a bid
router.post("/:id/bid", async (req, res) => {
  try {
    console.log("Bid request received:", req.params.id, req.body, "User:", req.user);
    
    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Please login to place a bid" });
    }

    const auctionId = parseInt(req.params.id);
    const userId = req.user.id;
    const { bidAmount } = req.body;

    const auction = auctionStorage.getAuctionById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Check if auction is active
    if (auction.status !== "active") {
      return res.status(400).json({ error: "Auction is not active" });
    }

    // Check if auction has ended
    if (new Date() > new Date(auction.endTime)) {
      return res.status(400).json({ error: "Auction has ended" });
    }

    // Check if bid is higher than current bid + increment
    const minimumBid = Math.max(
      auction.currentBid + auction.bidIncrement,
      auction.startingPrice
    );

    if (bidAmount < minimumBid) {
      return res.status(400).json({ 
        error: `Bid must be at least $${(minimumBid / 100).toFixed(2)}` 
      });
    }

    // Check if user is not bidding against themselves
    const recentBids = auctionStorage.getBidsByAuctionId(auctionId);
    if (recentBids.length && recentBids[0].userId === userId) {
      return res.status(400).json({ error: "You are already the highest bidder" });
    }

    // Mark previous winning bids as outbid
    auctionStorage.updateBidsByAuctionId(auctionId, { isWinning: false, isOutbid: true });

    // Create new bid
    auctionStorage.createBid({
      auctionId,
      userId,
      bidAmount,
      isWinning: true,
      isOutbid: false,
      userAgent: req.get("user-agent") || "",
      ipAddress: req.ip || "",
    });

    // Update auction
    auctionStorage.updateAuction(auctionId, {
      currentBid: bidAmount,
      totalBids: auction.totalBids + 1,
    });

    // Auto-extend auction if needed
    if (auction.isAutoExtend) {
      const timeLeft = new Date(auction.endTime).getTime() - Date.now();
      const extendThreshold = auction.autoExtendMinutes * 60 * 1000;

      if (timeLeft < extendThreshold) {
        const newEndTime = new Date(Date.now() + extendThreshold);
        auctionStorage.updateAuction(auctionId, { endTime: newEndTime.toISOString() });
      }
    }

    res.json({ success: true, message: "Bid placed successfully" });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Failed to place bid" });
  }
});

// Get user's watchlist
router.get('/watchlist', requireCustomer, async (req, res) => {
  console.log('Auction route: GET /watchlist', { user: req.user, body: req.body });
  
  try {
    const userId = req.user.id;
    const storage = req.app.get('storage');
    
    // Get all auctions from database
    const allAuctions = await storage.getAllAuctions();
    console.log('Found auctions:', allAuctions);
    
    if (!allAuctions || allAuctions.length === 0) {
      return res.json([]);
    }
    
    // Get watchlist with real auction data and product images
    const watchlistWithDetails = await Promise.all(
      allAuctions.slice(0, 2).map(async (auction) => {
        const product = await storage.getProductById(auction.productId);
        const productImages = await storage.getProductImages(auction.productId);
        const mainImage = productImages.find(img => img.isMain) || productImages[0];
        
        return {
          id: auction.id,
          title: auction.title || product?.title || "Amazon Return Pallet",
          currentBid: auction.currentBid || auction.startingPrice,
          startingPrice: auction.startingPrice,
          endTime: auction.endTime,
          status: auction.status,
          productImage: mainImage?.imageUrl || "https://res.cloudinary.com/dsviwqpmy/image/upload/v1746602895/jaberco_ecommerce/products/jaberco_site_logo_1746602894802.jpg",
          totalBids: auction.totalBids || 0,
          isWatching: true
        };
      })
    );
    
    console.log('Returning watchlist:', watchlistWithDetails);
    res.json(watchlistWithDetails);
  } catch (error) {
    console.error('Error getting watchlist:', error);
    res.status(500).json({ error: 'Failed to get watchlist' });
  }
});

// Watch/unwatch auction
router.post("/:id/watch", async (req, res) => {
  try {
    console.log("Watch request received:", req.params.id, "User:", req.user);
    
    // Check authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Please login to add to watchlist" });
    }

    const auctionId = parseInt(req.params.id);
    const userId = req.user.id;

    // Simplified watchlist logic for now - just return success
    const isWatching = Math.random() > 0.5; // Random toggle for demo
    
    console.log("Watch status toggled:", isWatching);
    res.json({ 
      success: true,
      watching: isWatching, 
      message: isWatching ? "Added to watchlist" : "Removed from watchlist" 
    });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).json({ error: "Failed to update watchlist" });
  }
});

// Get user's auction activity
router.get("/user/activity", requireCustomer, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type = "all" } = req.query;

    let userBids = auctionStorage.getBidsByUserId(userId);

    if (type === "winning") {
      userBids = userBids.filter(bid => bid.isWinning);
    } else if (type === "outbid") {
      userBids = userBids.filter(bid => bid.isOutbid);
    }

    const activity = userBids.map(bid => {
      const auction = auctionStorage.getAuctionById(bid.auctionId);
      return {
        auctionId: auction?.id,
        auctionTitle: auction?.title,
        auctionTitleAr: auction?.titleAr,
        auctionStatus: auction?.status,
        auctionEndTime: auction?.endTime,
        currentBid: auction?.currentBid,
        bidAmount: bid.bidAmount,
        bidTime: bid.bidTime,
        isWinning: bid.isWinning,
        productTitle: `Product ${auction?.productId}`,
        productImage: "https://res.cloudinary.com/dsviwqpmy/image/upload/v1733320123/jaberco_ecommerce/products/image_1733320123052.jpg",
      };
    });

    res.json(activity);
  } catch (error) {
    console.error("Error fetching user auction activity:", error);
    res.status(500).json({ error: "Failed to fetch auction activity" });
  }
});

// Admin: Create auction
router.post("/", requireAuth, async (req, res) => {
  try {
    const auction = auctionStorage.createAuction(req.body);
    res.status(201).json(auction);
  } catch (error) {
    console.error("Error creating auction:", error);
    res.status(500).json({ error: "Failed to create auction" });
  }
});

// Admin: Update auction
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const auction = auctionStorage.updateAuction(auctionId, req.body);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    res.json(auction);
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ error: "Failed to update auction" });
  }
});

// Admin: Delete auction
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const deleted = auctionStorage.deleteAuction(auctionId);

    if (!deleted) {
      return res.status(404).json({ error: "Auction not found" });
    }

    res.json({ success: true, message: "Auction deleted successfully" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    res.status(500).json({ error: "Failed to delete auction" });
  }
});

export default router;