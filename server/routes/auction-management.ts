import express from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = express.Router();

// Get auction statistics
router.get("/auction-stats", async (req, res) => {
  try {
    const stats = await storage.getAuctionStatistics();
    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch auction stats:", error);
    res.status(500).json({ message: "Failed to fetch auction statistics" });
  }
});

// Get recent auctions
router.get("/auctions/recent", async (req, res) => {
  try {
    const auctions = await storage.getRecentAuctions(10);
    res.json(auctions);
  } catch (error) {
    console.error("Failed to fetch recent auctions:", error);
    res.status(500).json({ message: "Failed to fetch recent auctions" });
  }
});

// Get auction invoices
router.get("/auction-invoices", async (req, res) => {
  try {
    const invoices = await storage.getAuctionInvoices();
    res.json(invoices);
  } catch (error) {
    console.error("Failed to fetch auction invoices:", error);
    res.status(500).json({ message: "Failed to fetch auction invoices" });
  }
});

// Get auction settings
router.get("/auction-settings", async (req, res) => {
  try {
    const settings = await storage.getAuctionSettings();
    res.json(settings);
  } catch (error) {
    console.error("Failed to fetch auction settings:", error);
    res.status(500).json({ message: "Failed to fetch auction settings" });
  }
});

// Update auction setting
router.put("/auction-settings", async (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ message: "Key and value are required" });
    }

    const setting = await storage.updateAuctionSetting(key, value);
    
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.json(setting);
  } catch (error) {
    console.error("Failed to update auction setting:", error);
    res.status(500).json({ message: "Failed to update auction setting" });
  }
});

// Create auction invoice
router.post("/auction-invoices", async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Validate required fields
    const requiredFields = ['auctionId', 'winnerId', 'winningBidAmount', 'totalAmount'];
    for (const field of requiredFields) {
      if (!invoiceData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const invoice = await storage.createAuctionInvoice(invoiceData);
    res.status(201).json(invoice);
  } catch (error) {
    console.error("Failed to create auction invoice:", error);
    res.status(500).json({ message: "Failed to create auction invoice" });
  }
});

// Update auction invoice payment status
router.patch("/auction-invoices/:id/payment", async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const { paymentStatus, paymentMethod, stripePaymentIntentId } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({ message: "Payment status is required" });
    }

    const invoice = await storage.updateAuctionInvoicePayment(invoiceId, {
      paymentStatus,
      paymentMethod,
      stripePaymentIntentId,
      paidAt: paymentStatus === 'paid' ? new Date() : null
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    console.error("Failed to update invoice payment:", error);
    res.status(500).json({ message: "Failed to update invoice payment" });
  }
});

// Get auction bidding history
router.get("/auctions/:id/bids", async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const bids = await storage.getAuctionBids(auctionId);
    res.json(bids);
  } catch (error) {
    console.error("Failed to fetch auction bids:", error);
    res.status(500).json({ message: "Failed to fetch auction bids" });
  }
});

// Get auction watchers
router.get("/auctions/:id/watchers", async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const watchers = await storage.getAuctionWatchers(auctionId);
    res.json(watchers);
  } catch (error) {
    console.error("Failed to fetch auction watchers:", error);
    res.status(500).json({ message: "Failed to fetch auction watchers" });
  }
});

// Generate auction reports
router.get("/reports/revenue", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await storage.getAuctionRevenueReport(
      startDate as string,
      endDate as string
    );
    res.json(report);
  } catch (error) {
    console.error("Failed to generate revenue report:", error);
    res.status(500).json({ message: "Failed to generate revenue report" });
  }
});

// End auction manually
router.post("/auctions/:id/end", async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const auction = await storage.endAuction(auctionId);
    
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.json({ message: "Auction ended successfully", auction });
  } catch (error) {
    console.error("Failed to end auction:", error);
    res.status(500).json({ message: "Failed to end auction" });
  }
});

// Cancel auction
router.post("/auctions/:id/cancel", async (req, res) => {
  try {
    const auctionId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const auction = await storage.cancelAuction(auctionId, reason);
    
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.json({ message: "Auction cancelled successfully", auction });
  } catch (error) {
    console.error("Failed to cancel auction:", error);
    res.status(500).json({ message: "Failed to cancel auction" });
  }
});

export default router;