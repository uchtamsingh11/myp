import { NextResponse } from 'next/server';
import { generateAuthUrl } from '../../../../src/utils/fyers';

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { appId } = body;
    
    if (!appId) {
      return NextResponse.json(
        { error: 'Missing required parameter: appId' },
        { status: 400 }
      );
    }
    
    // Generate the authorization URL using the updated method
    try {
      // For API routes that need to use the Fyers API directly
      // This URL pattern approach is more reliable for Next.js builds
      const authUrl = `https://api.fyers.in/api/v2/generate-authcode?client_id=${appId}&redirect_uri=${process.env.NEXT_PUBLIC_FYERS_REDIRECT_URI}&response_type=code`;
      
      return NextResponse.json({ authUrl });
    } catch (error) {
      console.error('Error generating Fyers auth URL:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to generate authorization URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
