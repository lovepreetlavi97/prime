import 'dotenv/config';

async function main() {
  const port = process.env.PORT || 4000;
  const url = `http://localhost:${port}/api/v1/signals/test`;

  console.log(`Sending post request to ${url}...`);

  const strike = 24000 + Math.floor(Math.random() * 20) * 50;
  const payload = {
    text: `NIFTY ${strike} CE BUY ABOVE ${100 + Math.floor(Math.random() * 50)} TGT 180/200 SL 80`,
    source: 'TELEGRAM'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Signal triggered successfully:', data);
    } else {
      console.error('❌ Failed to trigger signal:', res.status, await res.text());
    }
  } catch (err) {
    console.error('❌ Error triggering signal:', err.message);
  }
}

main();
