import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data simulating a D1 query response
  // In a real implementation, this would involve:
  // 1. SELECT SUM(size) as used, 5368709120 as limit FROM files WHERE owner_id = ?
  // 2. SELECT mime_type, SUM(size) as bytes, COUNT(*) as count FROM files WHERE owner_id = ? AND status='active' GROUP BY SUBSTR(mime_type, 1, INSTR(mime_type, '/')-1)

  const mockData = {
    used: 2478934528, // ~2.3 GB
    limit: 5368709120, // 5 GB
    breakdown: [
      { type: 'images', bytes: 1073741824, count: 120 }, // 1 GB
      { type: 'videos', bytes: 1288490188, count: 15 },  // ~1.2 GB
      { type: 'documents', bytes: 1166802516, count: 450 }, // ~1.1 GB
      { type: 'other', bytes: 0, count: 0 }
    ]
  };

  return NextResponse.json(mockData);
}
