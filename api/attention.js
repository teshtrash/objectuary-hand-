import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    // GET: Return all counts
    if (req.method === 'GET') {
      let data = await kv.hgetall('attention_data');
      if (!data) data = {};
      return res.status(200).json(data);
    }
    
    // POST: Increment count and return updated
    if (req.method === 'POST') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      
      // Increment the view target by 1
      await kv.hincrby('attention_data', id, 1);
      
      // Fetch latest global counts
      let data = await kv.hgetall('attention_data');
      if (!data) data = {};
      return res.status(200).json(data);
    }
    
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Database Error' });
  }
}
