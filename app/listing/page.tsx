"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { Property } from "~~/types/property";
import {
  BuildingOfficeIcon,
  HomeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

const PropertyListing: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Property>>({});
  const [createFormData, setCreateFormData] = useState<Partial<Property>>({
    propertyType: 'Residential',
    status: 'active',
    tags: [],
    amenities: []
  });

  // Fetch properties from API
  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/properties');
      const result = await response.json();

      if (result.success) {
        setProperties(result.data);
        setFilteredProperties(result.data);
      } else {
        setError(result.error || 'Failed to fetch properties');
      }
    } catch (err) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to properties
  const applyFilters = () => {
    let filtered = properties;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchLower) ||
        property.location?.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower) ||
        property.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (selectedPropertyType !== "all") {
      filtered = filtered.filter(property => property.propertyType === selectedPropertyType);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(property => property.status === selectedStatus);
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter(property => property.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    setFilteredProperties(filtered);
  };

  // Delete property (owner only)
  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${connectedAddress}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        await fetchProperties();
      } else {
        setError(result.error || 'Failed to delete property');
      }
    } catch (err) {
      setError('Failed to delete property');
      console.error('Error deleting property:', err);
    }
  };

  // Update property status (admin function)
  const updatePropertyStatus = async (propertyId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connectedAddress}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();

      if (result.success) {
        await fetchProperties();
      } else {
        setError(result.error || 'Failed to update property status');
      }
    } catch (err) {
      setError('Failed to update property status');
      console.error('Error updating property status:', err);
    }
  };

  // View property details
  const viewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  // Edit property
  const editProperty = (property: Property) => {
    setSelectedProperty(property);
    setEditFormData(property);
    setIsEditModalOpen(true);
  };

  // Save property changes
  const savePropertyChanges = async () => {
    if (!selectedProperty) return;

    try {
      const response = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connectedAddress}`,
        },
        body: JSON.stringify(editFormData),
      });
      const result = await response.json();

      if (result.success) {
        await fetchProperties();
        setIsEditModalOpen(false);
        setSelectedProperty(null);
        setEditFormData({});
      } else {
        setError(result.error || 'Failed to update property');
      }
    } catch (err) {
      setError('Failed to update property');
      console.error('Error updating property:', err);
    }
  };

  // Create new property
  const createProperty = async () => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connectedAddress}`,
        },
        body: JSON.stringify(createFormData),
      });
      const result = await response.json();

      if (result.success) {
        await fetchProperties();
        setIsCreateModalOpen(false);
        setCreateFormData({
          propertyType: 'Residential',
          status: 'active',
          tags: [],
          amenities: []
        });
      } else {
        setError(result.error || 'Failed to create property');
      }
    } catch (err) {
      setError('Failed to create property');
      console.error('Error creating property:', err);
    }
  };

  // Get unique locations for filter dropdown
  const getUniqueLocations = () => {
    const locations = properties.map(p => p.location).filter(Boolean);
    return [...new Set(locations)];
  };

  // Calculate stats
  const calculateStats = () => {
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.status === 'active').length;
    const totalValue = properties.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0);
    const averageROI = properties.length > 0
      ? (properties.reduce((sum, p) => sum + parseFloat(p.roi || '0'), 0) / properties.length).toFixed(1)
      : '0';

    const propertiesByType = properties.reduce((acc, p) => {
      acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProperties,
      activeProperties,
      totalValue: totalValue.toFixed(2),
      averageROI,
      propertiesByType
    };
  };

  const stats = calculateStats();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, searchTerm, selectedPropertyType, selectedStatus, selectedLocation]);

  if (!connectedAddress) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-base-content mb-4">Connect Your Wallet</h2>
          <p className="text-base-content/60">Please connect your wallet to access property management</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-base-content mb-2 flex items-center gap-3">
                <BuildingOfficeIcon className="h-10 w-10 text-primary" />
                Property Management
              </h1>
              <p className="text-base-content/70">Admin access: View, edit, delete, and manage all platform properties</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PlusIcon className="h-5 w-5" />
              Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 shadow border border-base-300 rounded-lg">
            <div className="stat-figure text-primary">
              <BuildingOfficeIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Total Properties</div>
            <div className="stat-value text-primary">{stats.totalProperties}</div>
          </div>
          <div className="stat bg-base-100 shadow border border-base-300 rounded-lg">
            <div className="stat-figure text-success">
              <CheckIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Active Listings</div>
            <div className="stat-value text-success">{stats.activeProperties}</div>
          </div>
          <div className="stat bg-base-100 shadow border border-base-300 rounded-lg">
            <div className="stat-figure text-secondary">
              <CurrencyDollarIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Total Value</div>
            <div className="stat-value text-secondary">{stats.totalValue} USD</div>
          </div>
          <div className="stat bg-base-100 shadow border border-base-300 rounded-lg">
            <div className="stat-figure text-accent">
              <ChartBarIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Avg ROI</div>
            <div className="stat-value text-accent">{stats.averageROI}%</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card bg-base-100 shadow-lg border border-base-300 mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Search Properties</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title, location, or tags..."
                    className="input input-bordered w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-base-content/40" />
                </div>
              </div>

              {/* Property Type Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Property Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Retail">Retail</option>
                  <option value="Office">Office</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {getUniqueLocations().map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <ExclamationTriangleIcon className="h-6 w-6" />
            <span>{error}</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setError(null)}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-base-content/60">
                  <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No properties found</p>
                </div>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <div key={property.id} className="card bg-base-100 shadow-lg border border-base-300">
                  <figure className="px-6 pt-6">
                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.title}
                        className="rounded-xl h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl h-48 w-full flex items-center justify-center">
                        <HomeIcon className="h-16 w-16 text-base-content/40" />
                      </div>
                    )}
                  </figure>

                  <div className="card-body">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="card-title text-lg">{property.title}</h3>
                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className={`badge cursor-pointer ${
                            property.status === 'active' ? 'badge-success' :
                            property.status === 'pending' ? 'badge-warning' :
                            property.status === 'sold' ? 'badge-info' :
                            'badge-ghost'
                          }`}
                        >
                          {property.status}
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                          <li><a onClick={() => updatePropertyStatus(property.id, 'active')}>Mark as Active</a></li>
                          <li><a onClick={() => updatePropertyStatus(property.id, 'pending')}>Mark as Pending</a></li>
                          <li><a onClick={() => updatePropertyStatus(property.id, 'sold')}>Mark as Sold</a></li>
                          <li><a onClick={() => updatePropertyStatus(property.id, 'draft')}>Mark as Draft</a></li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-base-content/60 mb-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{property.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-base-content/60">Price</p>
                        <p className="font-semibold">{property.price} USD</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60">ROI</p>
                        <p className="font-semibold text-success">{property.roi}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60">Total Shares</p>
                        <p className="font-semibold">{property.shares}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60">Available</p>
                        <p className="font-semibold">{property.availableShares}</p>
                      </div>
                    </div>

                    {/* Property Type Badge */}
                    <div className="mb-4">
                      <div className={`badge ${
                        property.propertyType === 'Residential' ? 'badge-primary' :
                        property.propertyType === 'Commercial' ? 'badge-secondary' :
                        property.propertyType === 'Luxury' ? 'badge-accent' :
                        'badge-neutral'
                      }`}>
                        {property.propertyType}
                      </div>
                    </div>

                    {/* Tags */}
                    {property.tags && property.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {property.tags.slice(0, 3).map((tag, index) => (
                          <div key={index} className="badge badge-outline badge-sm">
                            {tag}
                          </div>
                        ))}
                        {property.tags.length > 3 && (
                          <div className="badge badge-outline badge-sm">
                            +{property.tags.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Owner Address */}
                    <div className="text-xs text-base-content/60 mb-4">
                      <span>Owner: </span>
                      <Address address={property.ownerAddress} size="xs" />
                      {property.ownerAddress.toLowerCase() === connectedAddress?.toLowerCase() && (
                        <span className="badge badge-primary badge-xs ml-2">You</span>
                      )}
                    </div>

                    {/* Admin Actions */}
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => viewProperty(property)}
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => editProperty(property)}
                        title="Edit Property"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => deleteProperty(property.id)}
                        title="Delete Property"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* View Property Modal */}
      {isViewModalOpen && selectedProperty && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Property Details</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setIsViewModalOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Image */}
              <div>
                {selectedProperty.image ? (
                  <img
                    src={selectedProperty.image}
                    alt={selectedProperty.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <HomeIcon className="h-16 w-16 text-base-content/40" />
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold">{selectedProperty.title}</h4>
                  <p className="text-base-content/70 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    {selectedProperty.location}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-sm">Price</div>
                    <div className="stat-value text-lg">{selectedProperty.price} USD</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-sm">ROI</div>
                    <div className="stat-value text-lg text-success">{selectedProperty.roi}%</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-sm">Total Shares</div>
                    <div className="stat-value text-lg">{selectedProperty.shares}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-4">
                    <div className="stat-title text-sm">Available</div>
                    <div className="stat-value text-lg">{selectedProperty.availableShares}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p><strong>Type:</strong> {selectedProperty.propertyType}</p>
                  <p><strong>Status:</strong>
                    <span className={`badge ml-2 ${
                      selectedProperty.status === 'active' ? 'badge-success' :
                      selectedProperty.status === 'pending' ? 'badge-warning' :
                      selectedProperty.status === 'sold' ? 'badge-info' :
                      'badge-ghost'
                    }`}>
                      {selectedProperty.status}
                    </span>
                  </p>
                  <p><strong>Monthly Income:</strong> {selectedProperty.monthlyIncome} USD</p>
                  {selectedProperty.totalArea && <p><strong>Area:</strong> {selectedProperty.totalArea} sq ft</p>}
                  {selectedProperty.bedrooms && <p><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</p>}
                  {selectedProperty.bathrooms && <p><strong>Bathrooms:</strong> {selectedProperty.bathrooms}</p>}
                  {selectedProperty.yearBuilt && <p><strong>Year Built:</strong> {selectedProperty.yearBuilt}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedProperty.description && (
              <div className="mt-6">
                <h5 className="font-semibold mb-2">Description</h5>
                <p className="text-base-content/80">{selectedProperty.description}</p>
              </div>
            )}

            {/* Amenities */}
            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
              <div className="mt-6">
                <h5 className="font-semibold mb-2">Amenities</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.amenities.map((amenity, index) => (
                    <div key={index} className="badge badge-outline">
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedProperty.tags && selectedProperty.tags.length > 0 && (
              <div className="mt-6">
                <h5 className="font-semibold mb-2">Tags</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.tags.map((tag, index) => (
                    <div key={index} className="badge badge-primary">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner */}
            <div className="mt-6">
              <h5 className="font-semibold mb-2">Owner</h5>
              <Address address={selectedProperty.ownerAddress} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {isEditModalOpen && selectedProperty && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Edit Property</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setIsEditModalOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                />
              </div>

              {/* Location */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editFormData.location || ''}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                />
              </div>

              {/* Price */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Price (USD)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editFormData.price || ''}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                />
              </div>

              {/* ROI */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">ROI (%)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editFormData.roi || ''}
                  onChange={(e) => setEditFormData({...editFormData, roi: e.target.value})}
                />
              </div>

              {/* Shares */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Total Shares</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={editFormData.shares || ''}
                  onChange={(e) => setEditFormData({...editFormData, shares: parseInt(e.target.value)})}
                />
              </div>

              {/* Available Shares */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Available Shares</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={editFormData.availableShares || ''}
                  onChange={(e) => setEditFormData({...editFormData, availableShares: parseInt(e.target.value)})}
                />
              </div>

              {/* Property Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Property Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={editFormData.propertyType || ''}
                  onChange={(e) => setEditFormData({...editFormData, propertyType: e.target.value as any})}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Retail">Retail</option>
                  <option value="Office">Office</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              {/* Monthly Income */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Monthly Income (USD)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editFormData.monthlyIncome || ''}
                  onChange={(e) => setEditFormData({...editFormData, monthlyIncome: e.target.value})}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={savePropertyChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Property Modal */}
      {isCreateModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Create New Property</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={createFormData.title || ''}
                  onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                  placeholder="Enter property title"
                />
              </div>

              {/* Location */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={createFormData.location || ''}
                  onChange={(e) => setCreateFormData({...createFormData, location: e.target.value})}
                  placeholder="Enter property location"
                />
              </div>

              {/* Price */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Price (USD) *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={createFormData.price || ''}
                  onChange={(e) => setCreateFormData({...createFormData, price: e.target.value})}
                  placeholder="0.0"
                />
              </div>

              {/* ROI */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">ROI (%)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={createFormData.roi || ''}
                  onChange={(e) => setCreateFormData({...createFormData, roi: e.target.value})}
                  placeholder="0.0"
                />
              </div>

              {/* Shares */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Total Shares *</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={createFormData.shares || ''}
                  onChange={(e) => setCreateFormData({...createFormData, shares: parseInt(e.target.value) || 0})}
                  placeholder="1000"
                />
              </div>

              {/* Property Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Property Type</span>
                </label>
                <select
                  className="select select-bordered"
                  value={createFormData.propertyType || 'Residential'}
                  onChange={(e) => setCreateFormData({...createFormData, propertyType: e.target.value as any})}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Retail">Retail</option>
                  <option value="Office">Office</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>

              {/* Monthly Income */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Monthly Income (USD)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={createFormData.monthlyIncome || ''}
                  onChange={(e) => setCreateFormData({...createFormData, monthlyIncome: e.target.value})}
                  placeholder="0.0"
                />
              </div>

              {/* Total Area */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Total Area (sq ft)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={createFormData.totalArea || ''}
                  onChange={(e) => setCreateFormData({...createFormData, totalArea: parseInt(e.target.value) || undefined})}
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={createFormData.description || ''}
                onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                placeholder="Enter property description..."
              ></textarea>
            </div>

            {/* Tags */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Tags (comma-separated)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={createFormData.tags?.join(', ') || ''}
                onChange={(e) => setCreateFormData({
                  ...createFormData,
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                })}
                placeholder="Modern, Downtown, Luxury"
              />
            </div>

            {/* Action Buttons */}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={createProperty}
                disabled={!createFormData.title || !createFormData.location || !createFormData.price || !createFormData.shares}
              >
                Create Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyListing;