import express from 'express';
import { storage } from '../storage';
// import { requireAuth } from '../auth';

const router = express.Router();

// When auction ends, automatically create order for winner
export async function processAuctionCompletion(auctionId: number) {
  try {
    const auction = await storage.getAuctionById(auctionId);
    if (!auction || !auction.winnerId) {
      console.log(`No winner found for auction ${auctionId}`);
      return;
    }

    // Check if order already exists
    const existingOrder = await storage.getAuctionOrderByAuctionId(auctionId);
    if (existingOrder) {
      console.log(`Order already exists for auction ${auctionId}`);
      return existingOrder;
    }

    // Create auction order
    const orderData = {
      auctionId: auctionId,
      userId: auction.winnerId,
      winningBid: auction.currentBid,
      paymentStatus: 'pending',
      invoiceStatus: 'pending',
      shippingStatus: 'pending'
    };

    const auctionOrder = await storage.createAuctionOrder(orderData);

    // Generate invoice
    await generateAuctionInvoice(auctionOrder.id);

    // Send winner notification email
    await sendWinnerNotification(auction.winnerId, auctionId);

    console.log(`Auction completion processed for auction ${auctionId}, order ${auctionOrder.id}`);
    return auctionOrder;

  } catch (error) {
    console.error(`Error processing auction completion for ${auctionId}:`, error);
    throw error;
  }
}

// Generate invoice for auction winner
async function generateAuctionInvoice(auctionOrderId: number) {
  try {
    // Here you would generate PDF invoice and save to storage
    // For now, we'll mark as generated and create a URL
    const invoiceUrl = `/api/auctions/orders/${auctionOrderId}/invoice`;
    
    await storage.updateAuctionOrder(auctionOrderId, {
      invoiceStatus: 'generated',
      invoiceUrl: invoiceUrl
    });

    console.log(`Invoice generated for auction order ${auctionOrderId}`);
  } catch (error) {
    console.error(`Error generating invoice for order ${auctionOrderId}:`, error);
  }
}

// Send notification to auction winner
async function sendWinnerNotification(userId: number, auctionId: number) {
  try {
    const user = await storage.getUser(userId);
    const auction = await storage.getAuctionById(auctionId);
    
    if (!user || !auction) return;

    // Create notification in database
    await storage.createNotification({
      userId: userId,
      title: `🏆 Congratulations! You won the auction`,
      message: `You have won the auction "${auction.title}" with a bid of $${(auction.currentBid / 100).toFixed(2)}. Please complete payment within 3 days.`,
      type: 'auction_win',
      isRead: false,
      actionUrl: `/auction-winner-process`
    });

    // TODO: Send email notification
    console.log(`Winner notification sent to user ${userId} for auction ${auctionId}`);
  } catch (error) {
    console.error(`Error sending winner notification:`, error);
  }
}

// API Routes

// Get auction wins for current user
router.get('/customer/auction-wins', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auctionWins = await storage.getAuctionWinsByUserId(userId);
    res.json(auctionWins);
  } catch (error) {
    console.error('Error fetching auction wins:', error);
    res.status(500).json({ error: 'Failed to fetch auction wins' });
  }
});

// Process payment for auction win
router.post('/auctions/:auctionId/payment', async (req, res) => {
  try {
    const userId = req.user?.id;
    const auctionId = parseInt(req.params.auctionId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auctionOrder = await storage.getAuctionOrderByAuctionId(auctionId);
    if (!auctionOrder || auctionOrder.userId !== userId) {
      return res.status(404).json({ error: 'Auction order not found' });
    }

    if (auctionOrder.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Payment already completed' });
    }

    // TODO: Integrate with Stripe for payment processing
    // For now, simulate payment processing
    
    const paymentIntentId = `pi_auction_${auctionId}_${Date.now()}`;
    
    await storage.updateAuctionOrder(auctionOrder.id, {
      paymentStatus: 'paid',
      paymentIntentId: paymentIntentId,
      invoiceStatus: 'sent',
      shippingStatus: 'processing'
    });

    res.json({ 
      success: true, 
      message: 'Payment processed successfully',
      paymentIntentId 
    });
  } catch (error) {
    console.error('Error processing auction payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Download invoice
router.get('/auctions/:auctionId/invoice', async (req, res) => {
  try {
    const userId = req.user?.id;
    const auctionId = parseInt(req.params.auctionId);
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auctionOrder = await storage.getAuctionOrderByAuctionId(auctionId);
    if (!auctionOrder || auctionOrder.userId !== userId) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // TODO: Generate and return PDF invoice
    // For now, return a simple text response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="auction-invoice-${auctionId}.pdf"`);
    res.send(`Invoice for Auction ${auctionId} - Amount: $${(auctionOrder.winningBid / 100).toFixed(2)}`);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

// Update shipping status (admin only)
router.patch('/admin/auction-orders/:orderId/shipping', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { shippingStatus, trackingNumber } = req.body;

    const updateData: any = { shippingStatus };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    await storage.updateAuctionOrder(orderId, updateData);

    res.json({ success: true, message: 'Shipping status updated' });
  } catch (error) {
    console.error('Error updating shipping status:', error);
    res.status(500).json({ error: 'Failed to update shipping status' });
  }
});

export default router;