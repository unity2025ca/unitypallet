import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import LoadingScreen from "@/components/layout/LoadingScreen";

interface AuctionProtectedRouteProps {
  children: React.ReactNode;
}

export function AuctionProtectedRoute({ children }: AuctionProtectedRouteProps) {
  const [location, setLocation] = useLocation();

  const { data: auctionsStatus, isLoading } = useQuery({
    queryKey: ['/api/auctions-settings/enabled'],
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // If auctions are disabled, redirect to home
    if (!isLoading && auctionsStatus?.enabled === false) {
      setLocation("/");
    }
  }, [auctionsStatus, isLoading, setLocation]);

  if (isLoading) {
    return <LoadingScreen message="Checking auction availability..." />;
  }

  // If auctions are disabled, show not found
  if (auctionsStatus?.enabled === false) {
    return <NotFound />;
  }

  return <>{children}</>;
}