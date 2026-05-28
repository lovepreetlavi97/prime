import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'card';
    const symbol = (searchParams.get('symbol') || 'NIFTY').toUpperCase();
    const currentPrice = searchParams.get('currentPrice') || '0';
    const growth = searchParams.get('growth') || '0';
    const entry = searchParams.get('entry') || '0';
    const sl = searchParams.get('sl') || '0';
    const strike = searchParams.get('strike') || '0';
    const optionType = (searchParams.get('optionType') || 'CE').toUpperCase();
    const targetsParam = searchParams.get('targets') || '';
    
    const targets = targetsParam.split(',')
      .map(t => parseFloat(t))
      .filter(t => !isNaN(t))
      .sort((a, b) => a - b);
    
    // REFINED INSTITUTIONAL PALETTE
    const gold = '#EAB308'; // Refined Amber Gold
    const emerald = '#10B981'; // Emerald Institutional Green
    const rose = '#F43F5E'; // Sophisticated Rose Red
    const border = '#27272A'; // Zinc Border
    const muted = '#71717A'; // Zinc Muted

    const now = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const fullTimestamp = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    const entryNum = parseFloat(entry) || 0;
    const currentNum = parseFloat(currentPrice) || 0;
    const hitTargets = targets.filter(t => currentNum >= t);
    
    // CHART VIEW (Slide 2)
    if (type === 'chart') {
       const points = [entryNum, ...hitTargets, currentNum];
       const max = Math.max(...points) * 1.1;

       return new ImageResponse(
         (
           <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', color: 'white', padding: '80px', fontFamily: 'sans-serif', backgroundImage: 'radial-gradient(circle at 50% 50%, #09090B 0%, #000000 100%)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '36px', color: gold, fontWeight: '900', letterSpacing: '2px' }}>LV Prime</span>
                  <span style={{ fontSize: '24px', color: muted, fontWeight: '700', marginTop: '10px' }}>MARKET STRUCTURE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                   <span style={{ fontSize: '100px', fontWeight: '900', fontStyle: 'italic', color: gold, letterSpacing: '-4px', lineHeight: 0.8 }}>{symbol}</span>
                </div>
             </div>

             <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '60px', backgroundColor: '#050505', borderRadius: '40px', border: `2px solid ${border}`, marginTop: '40px', gap: '20px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ width: '100%', height: `${(entryNum / max) * 400}px`, backgroundColor: '#18181B', borderRadius: '15px' }} />
                   <span style={{ fontSize: '20px', marginTop: '20px', color: gold, fontWeight: '900' }}>ENTRY</span>
                   <span style={{ fontSize: '32px', fontWeight: '900', marginTop: '5px' }}>₹{entry}</span>
                </div>
                {hitTargets.slice(-6).map((t, i) => (
                   <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: `${(t / max) * 400}px`, backgroundColor: 'rgba(16,185,129,0.08)', borderRadius: '15px', border: `2px solid ${emerald}` }} />
                      <span style={{ fontSize: '18px', marginTop: '20px', color: emerald, fontWeight: '900' }}>T-{hitTargets.length - hitTargets.slice(-6).length + i + 1}</span>
                      <span style={{ fontSize: '28px', fontWeight: '900', marginTop: '5px' }}>₹{t}</span>
                   </div>
                ))}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ width: '100%', height: `${(currentNum / max) * 400}px`, backgroundColor: emerald, borderRadius: '15px', boxShadow: `0 0 50px rgba(16,185,129,0.4)` }} />
                   <span style={{ fontSize: '24px', marginTop: '20px', color: emerald, fontWeight: '900' }}>LIVE</span>
                   <span style={{ fontSize: '42px', fontWeight: '900', marginTop: '5px', color: emerald }}>₹{currentPrice}</span>
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '50px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                   <div style={{ width: '15px', height: '15px', borderRadius: '8px', backgroundColor: emerald }} />
                   <span style={{ fontSize: '32px', fontWeight: '900', color: emerald }}>+{growth}% PROFIT REALIZED</span>
                </div>
                <span style={{ fontSize: '20px', color: '#18181B', fontWeight: '900', letterSpacing: '10px' }}>LV PRECISION</span>
             </div>
           </div>
         ),
         { width: 1080, height: 1080 }
       );
    }

    // CARD VIEW (Slide 1)
    const targetFlow = [entry, ...hitTargets.map(String)];
    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#000000', color: 'white', padding: '80px', fontFamily: 'sans-serif', backgroundImage: 'radial-gradient(circle at 50% 50%, #09090B 0%, #000000 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '36px', color: gold, fontWeight: '900', letterSpacing: '4px' }}>LV Prime</span>
              <span style={{ fontSize: '20px', color: muted, fontWeight: '700', marginTop: '10px' }}>{fullTimestamp}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
               <span style={{ fontSize: '28px', color: '#FFFFFF', fontWeight: '900' }}>NSE INDIA</span>
               <span style={{ fontSize: '24px', color: emerald, fontWeight: '900', marginTop: '10px' }}>+{growth}% GROWTH</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
             <span style={{ fontSize: '110px', fontWeight: '900', fontStyle: 'italic', color: gold, letterSpacing: '-5px' }}>{symbol}</span>
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '40px' }}>
                <div style={{ backgroundColor: emerald, color: 'black', padding: '12px 40px', borderRadius: '12px', fontSize: '32px', fontWeight: '900' }}>BUY</div>
                <span style={{ fontSize: '45px', color: gold, fontWeight: '900' }}>{strike} {optionType}</span>
             </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxHeight: '300px', overflow: 'hidden' }}>
             <span style={{ fontSize: '185px', fontWeight: '900', color: gold, letterSpacing: '-10px', lineHeight: 1 }}>₹{currentPrice}</span>
          </div>

          <div style={{ display: 'flex', gap: '30px', marginTop: '30px' }}>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', backgroundColor: '#050505', borderRadius: '30px', border: `2px solid ${border}` }}>
                <span style={{ fontSize: '20px', color: gold, fontWeight: '900' }}>ENTRY POINT</span>
                <span style={{ fontSize: '45px', fontWeight: '900', marginTop: '8px' }}>₹{entry}</span>
             </div>
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', backgroundColor: '#050505', borderRadius: '30px', border: `2px solid ${border}` }}>
                <span style={{ fontSize: '20px', color: muted, fontWeight: '900' }}>STOP LOSS</span>
                <span style={{ fontSize: '45px', color: rose, fontWeight: '900', marginTop: '8px' }}>₹{sl}</span>
             </div>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', padding: '40px', backgroundColor: '#050505', borderRadius: '35px', border: `2px solid ${border}` }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontSize: '20px', color: emerald, fontWeight: '900', letterSpacing: '4px' }}>PRICE GOES FROM</span>
                <span style={{ fontSize: '20px', color: emerald, fontWeight: '900' }}>SUCCESS PROFIT</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {targetFlow.length > 7 ? (
                  <>
                    <span style={{ fontSize: '32px', fontWeight: '900', color: muted }}>₹{targetFlow[0]}</span>
                    <span style={{ fontSize: '24px', color: emerald, fontWeight: '900' }}>→</span>
                    <span style={{ fontSize: '28px', color: muted }}>...</span>
                    {targetFlow.slice(-6).map((val, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <span style={{ fontSize: '24px', color: emerald, fontWeight: '900' }}>→</span>
                         <span style={{ fontSize: '32px', fontWeight: '900', color: '#FFF' }}>₹{val}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  targetFlow.map((val, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <span style={{ fontSize: '32px', fontWeight: '900', color: i === 0 ? muted : '#FFF' }}>₹{val}</span>
                       {i < targetFlow.length - 1 && (
                          <span style={{ fontSize: '24px', color: emerald, fontWeight: '900' }}>→</span>
                       )}
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      ),
      { width: 1080, height: 1080 }
    );
  } catch (e: any) {
    return new Response(`Error`, { status: 500 });
  }
}
