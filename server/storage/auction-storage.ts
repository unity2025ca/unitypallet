// Temporary in-memory storage for auctions until database is fixed
import { Auction, Bid, AuctionWatcher } from "../../shared/schema.js";

class AuctionStorage {
  private auctions: Map<number, Auction> = new Map();
  private bids: Map<number, Bid> = new Map();
  private watchers: Map<number, AuctionWatcher> = new Map();
  private nextAuctionId = 1;
  private nextBidId = 1;
  private nextWatcherId = 1;

  // Sample auction data
  constructor() {
    this.seedSampleData();
  }

  private seedSampleData() {
    // Add sample auctions for existing products
    const sampleAuctions = [
      {
        id: 1,
        productId: 8,
        title: "Amazon Return Pallet - Electronics Mix",
        titleAr: "Amazon Return Pallet - Electronics Mix",
        description: "Mixed electronics return pallet with various items including laptops, phones, and accessories",
        descriptionAr: "Mixed electronics return pallet with various items including laptops, phones, and accessories",
        startingPrice: 5000, // $50.00
        reservePrice: 8000, // $80.00
        currentBid: 6500, // $65.00
        bidIncrement: 500, // $5.00
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        status: "active" as const,
        winnerId: null,
        totalBids: 3,
        isAutoExtend: true,
        autoExtendMinutes: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        productId: 9,
        title: "Brand New Close Box Items",
        titleAr: "Brand New Close Box Items",
        description: "Brand new items in unopened boxes from Amazon returns",
        descriptionAr: "Brand new items in unopened boxes from Amazon returns",
        startingPrice: 3000, // $30.00
        reservePrice: 5000, // $50.00
        currentBid: 3500, // $35.00
        bidIncrement: 250, // $2.50
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
        status: "active" as const,
        winnerId: null,
        totalBids: 2,
        isAutoExtend: true,
        autoExtendMinutes: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        productId: 10,
        title: "Home & Kitchen Return Pallet",
        titleAr: "Home & Kitchen Return Pallet",
        description: "Mixed home and kitchen items from Amazon returns",
        descriptionAr: "Mixed home and kitchen items from Amazon returns",
        startingPrice: 2500, // $25.00
        reservePrice: 4000, // $40.00
        currentBid: 0,
        bidIncrement: 250, // $2.50
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72 hours from now
        status: "draft" as const,
        winnerId: null,
        totalBids: 0,
        isAutoExtend: true,
        autoExtendMinutes: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    sampleAuctions.forEach(auction => {
      this.auctions.set(auction.id, auction);
    });

    this.nextAuctionId = 4;

    // Add sample bids
    const sampleBids = [
      {
        id: 1,
        auctionId: 1,
        userId: 1,
        bidAmount: 5500,
        isWinning: false,
        isOutbid: true,
        bidTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userAgent: "Sample User Agent",
        ipAddress: "192.168.1.1",
      },
      {
        id: 2,
        auctionId: 1,
        userId: 2,
        bidAmount: 6000,
        isWinning: false,
        isOutbid: true,
        bidTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        userAgent: "Sample User Agent",
        ipAddress: "192.168.1.2",
      },
      {
        id: 3,
        auctionId: 1,
        userId: 3,
        bidAmount: 6500,
        isWinning: true,
        isOutbid: false,
        bidTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        userAgent: "Sample User Agent",
        ipAddress: "192.168.1.3",
      }
    ];

    sampleBids.forEach(bid => {
      this.bids.set(bid.id, bid);
    });

    this.nextBidId = 4;
  }

  // Auction methods
  getAllAuctions(status?: string) {
    const auctionArray = Array.from(this.auctions.values());
    if (status && status !== "all") {
      return auctionArray.filter(auction => auction.status === status);
    }
    return auctionArray;
  }

  getAuctionById(id: number) {
    return this.auctions.get(id) || null;
  }

  createAuction(auctionData: Omit<Auction, 'id' | 'createdAt' | 'updatedAt'>) {
    const auction: Auction = {
      ...auctionData,
      id: this.nextAuctionId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.auctions.set(auction.id, auction);
    return auction;
  }

  updateAuction(id: number, updates: Partial<Auction>) {
    const auction = this.auctions.get(id);
    if (!auction) return null;

    const updatedAuction = {
      ...auction,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.auctions.set(id, updatedAuction);
    return updatedAuction;
  }

  deleteAuction(id: number) {
    return this.auctions.delete(id);
  }

  // Bid methods
  getBidsByAuctionId(auctionId: number) {
    return Array.from(this.bids.values())
      .filter(bid => bid.auctionId === auctionId)
      .sort((a, b) => new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime());
  }

  getBidsByUserId(userId: number) {
    return Array.from(this.bids.values())
      .filter(bid => bid.userId === userId)
      .sort((a, b) => new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime());
  }

  createBid(bidData: Omit<Bid, 'id' | 'bidTime'>) {
    const bid: Bid = {
      ...bidData,
      id: this.nextBidId++,
      bidTime: new Date().toISOString(),
    };
    this.bids.set(bid.id, bid);
    return bid;
  }

  updateBid(id: number, updates: Partial<Bid>) {
    const bid = this.bids.get(id);
    if (!bid) return null;

    const updatedBid = { ...bid, ...updates };
    this.bids.set(id, updatedBid);
    return updatedBid;
  }

  updateBidsByAuctionId(auctionId: number, updates: Partial<Bid>) {
    const bids = this.getBidsByAuctionId(auctionId);
    bids.forEach(bid => {
      this.updateBid(bid.id, updates);
    });
  }

  // Watcher methods
  getWatchersByAuctionId(auctionId: number) {
    return Array.from(this.watchers.values())
      .filter(watcher => watcher.auctionId === auctionId);
  }

  getWatchersByUserId(userId: number) {
    return Array.from(this.watchers.values())
      .filter(watcher => watcher.userId === userId);
  }

  getWatcher(auctionId: number, userId: number) {
    return Array.from(this.watchers.values())
      .find(watcher => watcher.auctionId === auctionId && watcher.userId === userId) || null;
  }

  createWatcher(watcherData: Omit<AuctionWatcher, 'id' | 'createdAt'>) {
    const watcher: AuctionWatcher = {
      ...watcherData,
      id: this.nextWatcherId++,
      createdAt: new Date().toISOString(),
    };
    this.watchers.set(watcher.id, watcher);
    return watcher;
  }

  deleteWatcher(auctionId: number, userId: number) {
    const watcher = this.getWatcher(auctionId, userId);
    if (watcher) {
      return this.watchers.delete(watcher.id);
    }
    return false;
  }
}

export const auctionStorage = new AuctionStorage();