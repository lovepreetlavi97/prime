import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol')?.toUpperCase() || 'NIFTY';
    const currentPrice = searchParams.get('currentPrice') || '50.00';
    const entry = searchParams.get('entry') || '15';
    const targetsParam = searchParams.get('targets') || '25,35,50';
    const targets = targetsParam.split(',').filter(Boolean);
    const growth = searchParams.get('growth') || '233.33';

    const entryNum = parseFloat(entry);
    const currentNum = parseFloat(currentPrice);
    const mainColor = '#22C55E';

    const points = [entryNum, ...targets.map(t => parseFloat(t))];
    const maxVal = Math.max(...points, currentNum) * 1.1;
    const minVal = Math.min(...points, entryNum) * 0.9;

    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#050505', color: 'white', padding: '50px', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', color: '#71717A', fontWeight: '900', letterSpacing: '2px' }}>PERFORMANCE ANALYTICS</span>
              <span style={{ fontSize: '70px', fontWeight: '900', fontStyle: 'italic', lineHeight: 1 }}>{symbol} GROWTH</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '60px', color: mainColor, fontWeight: '900' }}>+{growth}%</span>
              <span style={{ fontSize: '18px', color: '#71717A' }}>TOTAL RETURN</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', position: 'relative', margin: '60px 40px', borderLeft: '2px solid #27272A', borderBottom: '2px solid #27272A' }}>
            {/* Grid Lines */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: '25%', height: '1px', backgroundColor: '#18181B' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: '50%', height: '1px', backgroundColor: '#18181B' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: '75%', height: '1px', backgroundColor: '#18181B' }} />

            {/* Entry Line */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${((entryNum - minVal) / (maxVal - minVal)) * 100}%`, height: '3px', backgroundColor: '#F59E0B' }}>
              <div style={{ position: 'absolute', left: '20px', top: '-30px', color: '#F59E0B', fontSize: '14px', fontWeight: '900' }}>ENTRY LEVEL</div>
            </div>

            {/* Target Lines */}
            {targets.map((t, i) => {
              const val = parseFloat(t);
              const bottom = ((val - minVal) / (maxVal - minVal)) * 100;
              const isHit = currentNum >= val;
              if (bottom < 0 || bottom > 100) return null;
              return (
                <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: `${bottom}%`, height: '1px', borderTop: isHit ? `2px dashed ${mainColor}` : '1px dashed #27272A' }}>
                  <div style={{ position: 'absolute', right: '20px', top: '-25px', color: isHit ? mainColor : '#52525B', fontSize: '12px', fontWeight: '900' }}>T{i + 1} ACHIEVED</div>
                </div>
              );
            })}

            {/* Current Price Marker */}
            <div style={{ position: 'absolute', right: '100px', bottom: `${((currentNum - minVal) / (maxVal - minVal)) * 100}%`, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: mainColor, border: '4px solid white', boxShadow: `0 0 20px ${mainColor}` }} />
              <div style={{ marginLeft: '15px', backgroundColor: 'white', color: 'black', padding: '15px 30px', borderRadius: '15px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '900' }}>CURRENT PRICE</span>
                <span style={{ fontSize: '40px', fontWeight: '900' }}>₹{currentPrice}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '40px', borderRadius: '30px', border: `1px solid ${mainColor}`, justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: '900' }}>DON'T MISS THE NEXT MOVE</span>
              <span style={{ fontSize: '16px', color: '#A1A1AA' }}>Join LVX AI Signals for consistent winning trades.</span>
            </div>
            <div style={{ backgroundColor: 'white', color: 'black', padding: '20px 50px', borderRadius: '99px', fontSize: '20px', fontWeight: '900' }}>SUBSCRIBE</div>
          </div>
        </div>
      ),
      { width: 1080, height: 1080 }
    );
  } catch (e: any) {
    return new Response(`Error`, { status: 500 });
  }
}
