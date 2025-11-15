"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { User } from "@/lib/auth.types";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";
import { GET_BUSINESS_OFFERS_QUERY, GET_OFFER_STATISTICS_QUERY } from "@/lib/dashboard.queries";

interface Offer {
  id: string;
  offerNumber: string;
  title: string;
  description?: string;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  discountPercentage?: number;
  discountAmount?: number;
  finalAmount?: number;
  validUntil?: string;
  status: string;
  isApproved?: boolean;
  isRejected?: boolean;
  isExpired?: boolean;
  createdAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface OfferStats {
  total?: number;
  approved?: number;
  rejected?: number;
  pending?: number;
  totalValue?: number;
  approvedValue?: number;
}

export default function OffersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<OfferStats>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  useEffect(() => {
    const storedUser = storage.getUser();
    const token = storage.getAccessToken();
    
    if (!storedUser || !token) {
      router.push("/auth/login");
      return;
    }
    
    setUser(storedUser);
    fetchData(token);
  }, [router]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleCreateQuote = () => {
    router.push("/dashboard/offers/create");
  };

  const fetchData = async (token: string) => {
    try {
      const user = storage.getUser();
      
      if (!user) return;

      // Try to fetch from localStorage first (for development/testing)
      const savedOffers = localStorage.getItem("offers");
      let allOffers: Offer[] = [];

      if (savedOffers) {
        allOffers = JSON.parse(savedOffers);
      } else {
        // Try GraphQL as fallback
        try {
          const response = await graphqlRequest<{ offers: Offer[] }>(
            GET_BUSINESS_OFFERS_QUERY,
            { businessId: user.id || user.businessId },
            token
          );

          if (response.data?.offers) {
            allOffers = response.data.offers;
          }
        } catch (gqlError) {
          console.warn("GraphQL fetch failed, using localStorage only:", gqlError);
        }
      }

      let filtered = allOffers;

      if (filters.status) {
        filtered = filtered.filter((offer) => offer.status === filters.status);
      }
      if (filters.search) {
        filtered = filtered.filter((offer) =>
          offer.offerNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
          offer.title.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setOffers(filtered);

      // Calculate stats from filtered offers
      const stats: OfferStats = {
        total: allOffers.length,
        approved: allOffers.filter(o => o.status === "APPROVED").length,
        rejected: allOffers.filter(o => o.status === "REJECTED").length,
        pending: allOffers.filter(o => o.status === "PENDING").length,
        approvedValue: allOffers
          .filter(o => o.status === "APPROVED")
          .reduce((sum, o) => sum + (o.finalAmount || o.totalCost || 0), 0),
        totalValue: allOffers.reduce((sum, o) => sum + (o.finalAmount || o.totalCost || 0), 0),
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const token = storage.getAccessToken();
      if (token) {
        fetchData(token);
      }
    }
  }, [filters]);

  const getStatusColor = (status: string, isExpired?: boolean) => {
    if (isExpired) return "bg-gray-100 text-gray-800";
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      ACCEPTED: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "$0.00";
    return `$${amount.toFixed(2)}`;
  };

  const isExpiringSoon = (validUntil?: string) => {
    if (!validUntil) return false;
    const expiry = new Date(validUntil);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Quotes & Offers"
      subtitle="Manage repair quotes"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotes & Offers</h1>
            <p className="text-gray-600 mt-2">
              {offers.length > 0 ? `${offers.length} quote(s)` : "Create and manage repair quotes for customers"}
            </p>
          </div>
          <button onClick={handleCreateQuote} className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium border border-gray-200">
            New Quote
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Total</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Approved ✓</p>
            <p className="text-3xl font-bold text-green-600">{loading ? "..." : stats.approved || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{loading ? "..." : stats.pending || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Rejected ✗</p>
            <p className="text-3xl font-bold text-red-600">{loading ? "..." : stats.rejected || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Value</p>
            <p className="text-3xl font-bold text-blue-600">
              {loading ? "..." : formatCurrency(stats.approvedValue)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by quote # or title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ACCEPTED">Accepted</option>
            </select>
            <button className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium border border-gray-200">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {offers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon=""
                title="No Quotes"
                description="You haven't created any quotes yet. Click 'New Quote' to generate repair estimates for customers."
                buttonLabel="Create First Quote"
                onButtonClick={handleCreateQuote}
              />
            </div>
          ) : (
            <>
              <table className="w-full">
                <TableHeader columns={["Quote #", "Title", "Labor", "Parts", "Total", "Status", "Valid Until"]} />
                <tbody className="divide-y divide-gray-200">
                  {offers.map((offer) => (
                    <tr 
                      key={offer.id} 
                      className={`hover:bg-gray-50 cursor-pointer transition ${isExpiringSoon(offer.validUntil) ? "bg-orange-50" : ""}`}
                      onClick={() => router.push(`/dashboard/offers/${offer.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{offer.offerNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{offer.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(offer.laborCost)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(offer.partsCost)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {formatCurrency(offer.finalAmount || offer.totalCost)}
                        {offer.discountPercentage && offer.discountPercentage > 0 && (
                          <span className="text-xs text-green-600 ml-2">-{offer.discountPercentage}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status, offer.isExpired)}`}>
                          {offer.isExpired ? "Expired" : offer.status}
                          {isExpiringSoon(offer.validUntil) && !offer.isExpired && " "}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(offer.validUntil)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
