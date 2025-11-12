"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { storage } from "@/lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

interface Offer {
  id: string;
  offerNumber: string;
  title: string;
  description?: string;
  clientId?: string;
  carId?: string;
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
  notes?: string;
  createdAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

interface EditForm {
  title: string;
  description: string;
  clientId: string;
  carId: string;
  laborCost: string;
  partsCost: string;
  discountPercentage: string;
  validUntil: string;
  status: string;
  notes: string;
}

export default function OfferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;
  const user = storage.getUser();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState<EditForm>({
    title: "",
    description: "",
    clientId: "",
    carId: "",
    laborCost: "0",
    partsCost: "0",
    discountPercentage: "0",
    validUntil: "",
    status: "PENDING",
    notes: "",
  });

  useEffect(() => {
    const fetchOffer = () => {
      try {
        const savedOffers = localStorage.getItem("offers");
        if (savedOffers) {
          const offers = JSON.parse(savedOffers);
          const found = offers.find((o: Offer) => o.id === offerId);
          
          if (found) {
            setOffer(found);
            setFormData({
              title: found.title,
              description: found.description || "",
              clientId: found.clientId || "",
              carId: found.carId || "",
              laborCost: String(found.laborCost || 0),
              partsCost: String(found.partsCost || 0),
              discountPercentage: String(found.discountPercentage || 0),
              validUntil: found.validUntil || "",
              status: found.status,
              notes: found.notes || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching offer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotalCost = (labor?: string, parts?: string, discount?: string) => {
    const laborVal = parseFloat(labor || formData.laborCost) || 0;
    const partsVal = parseFloat(parts || formData.partsCost) || 0;
    const subtotal = laborVal + partsVal;
    const discountVal = parseFloat(discount || formData.discountPercentage) || 0;
    const discountAmount = (subtotal * discountVal) / 100 || 0;
    return (subtotal - discountAmount).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      ACCEPTED: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const savedOffers = localStorage.getItem("offers");
      if (savedOffers) {
        const offers = JSON.parse(savedOffers);
        const index = offers.findIndex((o: Offer) => o.id === offerId);
        
        if (index !== -1) {
          const labor = parseFloat(formData.laborCost) || 0;
          const parts = parseFloat(formData.partsCost) || 0;
          const subtotal = labor + parts;
          const discount = (subtotal * parseFloat(formData.discountPercentage)) / 100 || 0;
          const finalAmount = subtotal - discount;

          offers[index] = {
            ...offers[index],
            title: formData.title,
            description: formData.description,
            clientId: formData.clientId,
            carId: formData.carId,
            laborCost: labor,
            partsCost: parts,
            totalCost: subtotal,
            discountPercentage: parseFloat(formData.discountPercentage),
            discountAmount: discount,
            finalAmount: finalAmount,
            validUntil: formData.validUntil,
            status: formData.status,
            notes: formData.notes,
          };
          
          localStorage.setItem("offers", JSON.stringify(offers));
          setOffer(offers[index]);
          setIsEditing(false);
          alert("Quote updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error saving offer:", error);
      alert("Failed to save quote");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this quote?")) {
      try {
        const savedOffers = localStorage.getItem("offers");
        if (savedOffers) {
          const offers = JSON.parse(savedOffers);
          const filtered = offers.filter((o: Offer) => o.id !== offerId);
          localStorage.setItem("offers", JSON.stringify(filtered));
          alert("Quote deleted successfully!");
          router.push("/dashboard/offers");
        }
      } catch (error) {
        console.error("Error deleting offer:", error);
        alert("Failed to delete quote");
      }
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-700">Quote not found</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole="owner"
      userType={user?.type || "BUSINESS"}
      userName={user?.name || "User"}
      onLogout={() => {
        storage.clearAuth();
        router.push("/auth/login");
      }}
      title="Quote Details"
      subtitle={`${offer.offerNumber} - ${offer.title}`}
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{offer.title}</h1>
            <p className="text-gray-600 mt-2">{offer.offerNumber}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition font-medium border border-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 transition font-medium border border-red-200"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition font-medium"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Details/Edit Form */}
        {isEditing ? (
          <form className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-6">
            {/* Row 1: Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quote Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Row 2: Client and Car */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car ID
                </label>
                <input
                  type="text"
                  name="carId"
                  value={formData.carId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Row 3: Labor and Parts Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labor Cost ($)
                </label>
                <input
                  type="number"
                  name="laborCost"
                  value={formData.laborCost}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parts Cost ($)
                </label>
                <input
                  type="number"
                  name="partsCost"
                  value={formData.partsCost}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Row 4: Discount and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ACCEPTED">Accepted</option>
                </select>
              </div>
            </div>

            {/* Row 5: Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Valid Until
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Row 6: Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Total Cost Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Amount
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-bold">
                ${calculateTotalCost(formData.laborCost, formData.partsCost, formData.discountPercentage)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-1 px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
              >
                {saveLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Status</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                      {offer.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Client ID</p>
                  <p className="text-lg text-gray-900 mt-1">{offer.clientId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Car ID</p>
                  <p className="text-lg text-gray-900 mt-1">{offer.carId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Labor Cost</p>
                  <p className="text-lg text-gray-900 mt-1">${(offer.laborCost || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Parts Cost</p>
                  <p className="text-lg text-gray-900 mt-1">${(offer.partsCost || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Discount</p>
                  <p className="text-lg text-gray-900 mt-1">
                    {offer.discountPercentage || 0}% ({offer.discountAmount ? `$${offer.discountAmount.toFixed(2)}` : "$0.00"})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Cost</p>
                  <p className="text-lg text-gray-900 mt-1">${(offer.totalCost || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Final Amount</p>
                  <p className="text-lg font-bold text-blue-600 mt-1">${(offer.finalAmount || offer.totalCost || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
              <div>
                <p className="text-sm text-gray-600 font-medium">Description</p>
                <p className="text-gray-900 mt-2">{offer.description || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Valid Until</p>
                <p className="text-gray-900 mt-2">{offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : "N/A"}</p>
              </div>
              {offer.notes && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Notes</p>
                  <p className="text-gray-900 mt-2 whitespace-pre-wrap">{offer.notes}</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t border-gray-200 space-y-2">
              <p className="text-xs text-gray-500">
                Created: {offer.createdAt ? new Date(offer.createdAt).toLocaleString() : "N/A"}
              </p>
              {offer.approvedAt && (
                <p className="text-xs text-gray-500">
                  Approved: {new Date(offer.approvedAt).toLocaleString()}
                </p>
              )}
              {offer.rejectedAt && (
                <p className="text-xs text-gray-500">
                  Rejected: {new Date(offer.rejectedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
