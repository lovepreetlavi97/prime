import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', fontSize: 100, color: 'white', backgroundColor: 'black', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        TEST
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
