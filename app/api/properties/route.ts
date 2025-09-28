import { NextRequest, NextResponse } from 'next/server';
import { CreatePropertyRequest, PropertiesResponse, PropertyResponse, Property, PropertyFilters } from '~~/types/property';
import supabase from '~~/utils/supabase';

// Helper function to get wallet address from request headers
function getWalletAddress(request: NextRequest): string | null {
  // Try to get address from Authorization header (format: "Bearer 0x...")
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer 0x')) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  // Try to get address from X-Wallet-Address header
  const walletHeader = request.headers.get('x-wallet-address');
  if (walletHeader && walletHeader.startsWith('0x')) {
    return walletHeader;
  }

  return null;
}

// Generate unique ID for new properties
function generatePropertyId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// GET /api/properties - Get all properties with optional filters
export async function GET(request: NextRequest): Promise<NextResponse<PropertiesResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    const filters: PropertyFilters = {
      search: searchParams.get('search') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      location: searchParams.get('location') || undefined,
      status: searchParams.get('status') || 'active', // Default to active properties
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Handle tags parameter (can be comma-separated)
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      filters.tags = tagsParam.split(',');
    }

    // Build Supabase query options
    const queryOptions: any = {
      select: '*',
      count: true
    };

    // Add where conditions for exact matches
    const whereConditions: any = {};
    if (filters.status) {
      whereConditions.status = filters.status;
    }
    if (filters.propertyType) {
      whereConditions.property_type = filters.propertyType;
    }

    if (Object.keys(whereConditions).length > 0) {
      queryOptions.where = whereConditions;
    }

    // Add pagination
    if (filters.limit) {
      queryOptions.limit = filters.limit;
    }
    if (filters.offset) {
      queryOptions.offset = filters.offset;
    }

    // Add ordering (newest first)
    queryOptions.order = 'created_at.desc';

    const result = await supabase.select<any>('integra_properties', queryOptions);

    if (result.error) {
      console.error('Error fetching properties from Supabase:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    let properties = result.data || [];

    // Apply client-side filters for complex searches
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      properties = properties.filter((property: any) =>
        property.title?.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower) ||
        property.location?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.location) {
      properties = properties.filter((property: any) =>
        property.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filter by tags if specified
    if (filters.tags && filters.tags.length > 0) {
      properties = properties.filter((property: any) => {
        const propertyTags = property.tags || [];
        return filters.tags!.some(tag =>
          propertyTags.some((propertyTag: string) =>
            propertyTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
      });
    }

    // Convert database response to API format (snake_case to camelCase)
    const formattedProperties: Property[] = properties.map((property: any) => ({
      id: property.id,
      title: property.title,
      description: property.description,
      location: property.location,
      price: property.price,
      shares: property.total_shares,
      availableShares: property.available_shares,
      image: property.image,
      images: property.images || [],
      tags: property.tags || [],
      roi: property.roi,
      propertyType: property.property_type,
      ownerAddress: property.owner_address,
      status: property.status,
      monthlyIncome: property.monthly_income,
      totalArea: property.total_area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      yearBuilt: property.year_built,
      amenities: property.amenities || [],
      coordinates: property.coordinates,
      createdAt: property.created_at,
      updatedAt: property.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: formattedProperties,
      total: result.count || formattedProperties.length
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property (requires wallet connection)
export async function POST(request: NextRequest): Promise<NextResponse<PropertyResponse>> {
  try {
    const body: CreatePropertyRequest = await request.json();

    // Get wallet address for property owner
    const ownerAddress = getWalletAddress(request);

    if (!ownerAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address not provided. Please include address in Authorization header or X-Wallet-Address header.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property title is required' },
        { status: 400 }
      );
    }

    if (!body.location || body.location.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Property location is required' },
        { status: 400 }
      );
    }

    if (!body.price || parseFloat(body.price) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid property price is required' },
        { status: 400 }
      );
    }

    if (!body.shares || body.shares <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid number of shares is required' },
        { status: 400 }
      );
    }

    // Prepare property data for database (using snake_case for column names)
    const propertyData = {
      id: generatePropertyId(),
      title: body.title.trim(),
      description: body.description?.trim(),
      location: body.location.trim(),
      price: body.price,
      total_shares: body.shares,
      available_shares: body.shares, // Initially all shares are available
      image: body.image,
      images: body.images || [],
      tags: body.tags || [],
      roi: body.roi || "0",
      property_type: body.propertyType,
      owner_address: ownerAddress.toLowerCase(),
      status: 'active',
      monthly_income: body.monthlyIncome,
      total_area: body.totalArea,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      year_built: body.yearBuilt,
      amenities: body.amenities || [],
      coordinates: body.coordinates,
    };

    const result = await supabase.insert<any>('integra_properties', propertyData);

    if (result.error) {
      console.error('Error creating property in Supabase:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    // Convert database response back to camelCase for API response
    const createdProperty = result.data as any;
    if (createdProperty && Array.isArray(createdProperty) && createdProperty.length > 0) {
      const property = createdProperty[0];
      const responseProperty: Property = {
        id: property.id,
        title: property.title,
        description: property.description,
        location: property.location,
        price: property.price,
        shares: property.total_shares,
        availableShares: property.available_shares,
        image: property.image,
        images: property.images || [],
        tags: property.tags || [],
        roi: property.roi,
        propertyType: property.property_type,
        ownerAddress: property.owner_address,
        status: property.status,
        monthlyIncome: property.monthly_income,
        totalArea: property.total_area,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        yearBuilt: property.year_built,
        amenities: property.amenities || [],
        coordinates: property.coordinates,
        createdAt: property.created_at,
        updatedAt: property.updated_at
      };

      return NextResponse.json({ success: true, data: responseProperty });
    }

    return NextResponse.json(
      { success: false, error: 'Property creation failed' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}