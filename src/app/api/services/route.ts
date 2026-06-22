import { NextResponse } from 'next/server'

export async function GET() {
  const categories = [
    { id: '1', name: 'Plumbing', slug: 'plumbing', description: 'Fixing leaks, pipes, and water systems', sort_order: 1 },
    { id: '2', name: 'Electrical', slug: 'electrical', description: 'Wiring, switches, and electrical repairs', sort_order: 2 },
    { id: '3', name: 'AC Services', slug: 'ac-services', description: 'Installation, repair, and servicing', sort_order: 3 },
    { id: '4', name: 'Generator & Inverter', slug: 'generator-inverter', description: 'Repair and maintenance', sort_order: 4 },
    { id: '5', name: 'Painting', slug: 'painting', description: 'Interior and exterior painting', sort_order: 5 },
    { id: '6', name: 'Deep Cleaning', slug: 'deep-cleaning', description: 'Professional home & office cleaning', sort_order: 6 },
    { id: '7', name: 'Carpentry', slug: 'carpentry', description: 'Furniture, shelves, and woodwork', sort_order: 7 },
  ]

  return NextResponse.json({ success: true, data: categories })
}
