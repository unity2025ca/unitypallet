import express from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = express.Router();

// Get auto-bidding statistics
router.get("/auto-bidding/stats", async (req, res) => {
  try {
    const stats = await storage.getAutoBiddingStats();
    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch auto-bidding stats:", error);
    res.status(500).json({ message: "Failed to fetch auto-bidding statistics" });
  }
});

// Get all auto bids
router.get("/auto-bidding", async (req, res) => {
  try {
    const autoBids = await storage.getAllAutoBids();
    res.json(autoBids);
  } catch (error) {
    console.error("Failed to fetch auto bids:", error);
    res.status(500).json({ message: "Failed to fetch auto bids" });
  }
});

// Create auto bid
router.post("/auto-bidding", async (req, res) => {
  try {
    const { auctionId, userId, maxBidAmount } = req.body;
    
    if (!auctionId || !userId || !maxBidAmount) {
      return res.status(400).json({ message: "Auction ID, User ID, and Max Bid Amount are required" });
    }

    const autoBid = await storage.createAutoBid({
      auctionId: parseInt(auctionId),
      userId: parseInt(userId),
      maxBidAmount: parseInt(maxBidAmount),
      currentBidAmount: 0,
      isActive: true
    });

    res.status(201).json(autoBid);
  } catch (error) {
    console.error("Failed to create auto bid:", error);
    res.status(500).json({ message: "Failed to create auto bid" });
  }
});

// Toggle auto bid status
router.patch("/auto-bidding/:id/toggle", async (req, res) => {
  try {
    const autoBidId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "isActive must be a boolean" });
    }

    const autoBid = await storage.updateAutoBidStatus(autoBidId, isActive);
    
    if (!autoBid) {
      return res.status(404).json({ message: "Auto bid not found" });
    }

    res.json(autoBid);
  } catch (error) {
    console.error("Failed to toggle auto bid status:", error);
    res.status(500).json({ message: "Failed to toggle auto bid status" });
  }
});

// Delete auto bid
router.delete("/auto-bidding/:id", async (req, res) => {
  try {
    const autoBidId = parseInt(req.params.id);
    
    const success = await storage.deleteAutoBid(autoBidId);
    
    if (!success) {
      return res.status(404).json({ message: "Auto bid not found" });
    }

    res.json({ message: "Auto bid deleted successfully" });
  } catch (error) {
    console.error("Failed to delete auto bid:", error);
    res.status(500).json({ message: "Failed to delete auto bid" });
  }
});

// Get auto bid by ID
router.get("/auto-bidding/:id", async (req, res) => {
  try {
    const autoBidId = parseInt(req.params.id);
    const autoBid = await storage.getAutoBidById(autoBidId);
    
    if (!autoBid) {
      return res.status(404).json({ message: "Auto bid not found" });
    }

    res.json(autoBid);
  } catch (error) {
    console.error("Failed to fetch auto bid:", error);
    res.status(500).json({ message: "Failed to fetch auto bid" });
  }
});

// Update auto bid max amount
router.patch("/auto-bidding/:id", async (req, res) => {
  try {
    const autoBidId = parseInt(req.params.id);
    const { maxBidAmount } = req.body;
    
    if (!maxBidAmount) {
      return res.status(400).json({ message: "Max bid amount is required" });
    }

    const autoBid = await storage.updateAutoBidMaxAmount(autoBidId, parseInt(maxBidAmount));
    
    if (!autoBid) {
      return res.status(404).json({ message: "Auto bid not found" });
    }

    res.json(autoBid);
  } catch (error) {
    console.error("Failed to update auto bid:", error);
    res.status(500).json({ message: "Failed to update auto bid" });
  }
});

export default router;