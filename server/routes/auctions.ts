import express from "express";
import { db } from "../db.js";
import { auctions, bids, auctionWatchers, products, productImages, users } from "../../shared/schema.js";
import { eq, desc, and, sql, gte, lte, or } from "drizzle-orm";
import { requireAuth, requireCustomer } from "../middleware/auth.js";
import { validateSchema } from "../middleware/validation.js";
import { insertAuctionSchema, insertBidSchema, insertAuctionWatcherSchema } from "../../shared/schema.js";

const router = express.Router();

// Get all active auctions
router.get("/", async (req, res) => {
  try {
    const { status = "active", limit = 20, offset = 0 } = req.query;
    
    const auctionList = await db
      .select({
        id: auctions.id,
        productId: auctions.productId,
        title: auctions.title,
        titleAr: auctions.titleAr,
        description: auctions.description,
        descriptionAr: auctions.descriptionAr,
        startingPrice: auctions.startingPrice,
        reservePrice: auctions.reservePrice,
        currentBid: auctions.currentBid,
        bidIncrement: auctions.bidIncrement,
        startTime: auctions.startTime,
        endTime: auctions.endTime,
        status: auctions.status,
        totalBids: auctions.totalBids,
        isAutoExtend: auctions.isAutoExtend,
        autoExtendMinutes: auctions.autoExtendMinutes,
        createdAt: auctions.createdAt,
        productTitle: products.title,
        productTitleAr: products.titleAr,
        productPrice: products.price,
        productImage: productImages.imageUrl,
      })
      .from(auctions)
      .leftJoin(products, eq(auctions.productId, products.id))
      .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isMain, true)))
      .where(status === "all" ? undefined : eq(auctions.status, status as any))
      .orderBy(desc(auctions.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(auctionList);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
});

// Get auction by ID with bids
router.get("/:id", async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    
    // Get auction details
    const auction = await db
      .select({
        id: auctions.id,
        productId: auctions.productId,
        title: auctions.title,
        titleAr: auctions.titleAr,
        description: auctions.description,
        descriptionAr: auctions.descriptionAr,
        startingPrice: auctions.startingPrice,
        reservePrice: auctions.reservePrice,
        currentBid: auctions.currentBid,
        bidIncrement: auctions.bidIncrement,
        startTime: auctions.startTime,
        endTime: auctions.endTime,
        status: auctions.status,
        winnerId: auctions.winnerId,
        totalBids: auctions.totalBids,
        isAutoExtend: auctions.isAutoExtend,
        autoExtendMinutes: auctions.autoExtendMinutes,
        createdAt: auctions.createdAt,
        productTitle: products.title,
        productTitleAr: products.titleAr,
        productDescription: products.description,
        productDescriptionAr: products.descriptionAr,
        productPrice: products.price,
        productCategory: products.category,
        productStock: products.stock,
      })
      .from(auctions)
      .leftJoin(products, eq(auctions.productId, products.id))
      .where(eq(auctions.id, auctionId))
      .limit(1);

    if (!auction.length) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Get product images
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, auction[0].productId))
      .orderBy(desc(productImages.isMain));

    // Get recent bids
    const recentBids = await db
      .select({
        id: bids.id,
        bidAmount: bids.bidAmount,
        bidTime: bids.bidTime,
        isWinning: bids.isWinning,
        username: users.username,
        fullName: users.fullName,
      })
      .from(bids)
      .leftJoin(users, eq(bids.userId, users.id))
      .where(eq(bids.auctionId, auctionId))
      .orderBy(desc(bids.bidTime))
      .limit(10);

    res.json({
      ...auction[0],
      productImages: images,
      recentBids,
    });
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({ error: "Failed to fetch auction details" });
  }
});

// Place a bid
router.post("/:id/bid", requireCustomer, validateSchema(insertBidSchema), async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { bidAmount } = req.body;

    // Get auction details
    const auction = await db
      .select()
      .from(auctions)
      .where(eq(auctions.id, auctionId))
      .limit(1);

    if (!auction.length) {
      return res.status(404).json({ error: "Auction not found" });
    }

    const currentAuction = auction[0];

    // Check if auction is active
    if (currentAuction.status !== "active") {
      return res.status(400).json({ error: "Auction is not active" });
    }

    // Check if auction has ended
    if (new Date() > new Date(currentAuction.endTime)) {
      return res.status(400).json({ error: "Auction has ended" });
    }

    // Check if bid is higher than current bid + increment
    const minimumBid = Math.max(
      currentAuction.currentBid + currentAuction.bidIncrement,
      currentAuction.startingPrice
    );

    if (bidAmount < minimumBid) {
      return res.status(400).json({ 
        error: `Bid must be at least $${(minimumBid / 100).toFixed(2)}` 
      });
    }

    // Check if user is not bidding against themselves
    const lastBid = await db
      .select()
      .from(bids)
      .where(eq(bids.auctionId, auctionId))
      .orderBy(desc(bids.bidTime))
      .limit(1);

    if (lastBid.length && lastBid[0].userId === userId) {
      return res.status(400).json({ error: "You are already the highest bidder" });
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Mark previous winning bids as outbid
      await tx
        .update(bids)
        .set({ isWinning: false, isOutbid: true })
        .where(and(eq(bids.auctionId, auctionId), eq(bids.isWinning, true)));

      // Insert new bid
      await tx.insert(bids).values({
        auctionId,
        userId,
        bidAmount,
        isWinning: true,
        userAgent: req.get("user-agent") || "",
        ipAddress: req.ip || "",
      });

      // Update auction current bid and total bids
      await tx
        .update(auctions)
        .set({
          currentBid: bidAmount,
          totalBids: sql`${auctions.totalBids} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(auctions.id, auctionId));

      // Auto-extend auction if needed
      if (currentAuction.isAutoExtend) {
        const timeLeft = new Date(currentAuction.endTime).getTime() - Date.now();
        const extendThreshold = currentAuction.autoExtendMinutes * 60 * 1000;

        if (timeLeft < extendThreshold) {
          const newEndTime = new Date(Date.now() + extendThreshold);
          await tx
            .update(auctions)
            .set({ endTime: newEndTime })
            .where(eq(auctions.id, auctionId));
        }
      }
    });

    res.json({ success: true, message: "Bid placed successfully" });
  } catch (error) {
    console.error("Error placing bid:", error);
    res.status(500).json({ error: "Failed to place bid" });
  }
});

// Watch/unwatch auction
router.post("/:id/watch", requireCustomer, async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const userId = req.user!.id;

    // Check if already watching
    const existing = await db
      .select()
      .from(auctionWatchers)
      .where(and(eq(auctionWatchers.auctionId, auctionId), eq(auctionWatchers.userId, userId)))
      .limit(1);

    if (existing.length) {
      // Remove from watchlist
      await db
        .delete(auctionWatchers)
        .where(and(eq(auctionWatchers.auctionId, auctionId), eq(auctionWatchers.userId, userId)));
      
      res.json({ watching: false, message: "Removed from watchlist" });
    } else {
      // Add to watchlist
      await db.insert(auctionWatchers).values({
        auctionId,
        userId,
      });
      
      res.json({ watching: true, message: "Added to watchlist" });
    }
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

    let query = db
      .select({
        auctionId: auctions.id,
        auctionTitle: auctions.title,
        auctionTitleAr: auctions.titleAr,
        auctionStatus: auctions.status,
        auctionEndTime: auctions.endTime,
        currentBid: auctions.currentBid,
        bidAmount: bids.bidAmount,
        bidTime: bids.bidTime,
        isWinning: bids.isWinning,
        productTitle: products.title,
        productImage: productImages.imageUrl,
      })
      .from(bids)
      .leftJoin(auctions, eq(bids.auctionId, auctions.id))
      .leftJoin(products, eq(auctions.productId, products.id))
      .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isMain, true)))
      .where(eq(bids.userId, userId));

    if (type === "winning") {
      query = query.where(eq(bids.isWinning, true));
    } else if (type === "outbid") {
      query = query.where(eq(bids.isOutbid, true));
    }

    const activity = await query.orderBy(desc(bids.bidTime));

    res.json(activity);
  } catch (error) {
    console.error("Error fetching user auction activity:", error);
    res.status(500).json({ error: "Failed to fetch auction activity" });
  }
});

// Admin: Create auction
router.post("/", requireAuth, validateSchema(insertAuctionSchema), async (req, res) => {
  try {
    const auction = await db.insert(auctions).values(req.body).returning();
    res.status(201).json(auction[0]);
  } catch (error) {
    console.error("Error creating auction:", error);
    res.status(500).json({ error: "Failed to create auction" });
  }
});

// Admin: Update auction
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const auction = await db
      .update(auctions)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(auctions.id, auctionId))
      .returning();

    if (!auction.length) {
      return res.status(404).json({ error: "Auction not found" });
    }

    res.json(auction[0]);
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ error: "Failed to update auction" });
  }
});

export default router;