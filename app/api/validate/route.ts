import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, rows, mapping } = body;

    if (!category || !rows || !mapping) {
      return NextResponse.json(
        { error: 'Missing required fields: category, rows, mapping' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      processedRows: rows.length,
      category,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed', details: String(error) },
      { status: 500 }
    );
  }
}
