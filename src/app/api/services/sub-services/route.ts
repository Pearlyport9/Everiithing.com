import { NextResponse } from 'next/server'
import { CALL_OUT_FEE } from '@/lib/constants'

const subServices = [
  { id: '101', category_id: '1', name: 'Leaky Pipe Repair', description: 'Fix leaking pipes under sinks, walls, or ceilings', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '102', category_id: '1', name: 'Drain Unblocking', description: 'Clear blocked kitchen, bathroom, or floor drains', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '103', category_id: '1', name: 'Toilet Repair', description: 'Fix running toilets, flush mechanism, or leaks', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },
  { id: '104', category_id: '1', name: 'Water Heater Installation', description: 'Install or replace electric water heaters', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },
  { id: '105', category_id: '1', name: 'Pipe Replacement', description: 'Replace old or burst pipes with new ones', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },

  { id: '201', category_id: '2', name: 'Socket & Switch Repair', description: 'Fix or replace faulty sockets and switches', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '202', category_id: '2', name: 'Light Fixture Installation', description: 'Install new ceiling lights, chandeliers, or wall sconces', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '203', category_id: '2', name: 'Wiring Repair', description: 'Troubleshoot and repair faulty electrical wiring', base_price_ngn: CALL_OUT_FEE, duration_hours: 3, is_active: true },
  { id: '204', category_id: '2', name: 'Circuit Breaker Replacement', description: 'Replace old or tripping circuit breakers', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },
  { id: '205', category_id: '2', name: 'Ceiling Fan Installation', description: 'Install and balance ceiling fans with remote', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },

  { id: '301', category_id: '3', name: 'AC Installation', description: 'Install split AC units including bracket and piping', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },
  { id: '302', category_id: '3', name: 'AC Repair & Troubleshooting', description: 'Diagnose and fix AC cooling issues', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },
  { id: '303', category_id: '3', name: 'AC Deep Servicing', description: 'Thorough cleaning of filters, coils, and drainage', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '304', category_id: '3', name: 'AC Gas Refill', description: 'Refill refrigerant gas to restore cooling performance', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '305', category_id: '3', name: 'AC Thermostat Replacement', description: 'Replace faulty thermostats and temperature sensors', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },

  { id: '401', category_id: '4', name: 'Generator Repair', description: 'Diagnose and fix generator starting or running issues', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },
  { id: '402', category_id: '4', name: 'Inverter Installation', description: 'Install and configure inverter with battery bank', base_price_ngn: CALL_OUT_FEE, duration_hours: 4, is_active: true },
  { id: '403', category_id: '4', name: 'Battery Replacement', description: 'Replace inverter batteries with new deep-cycle ones', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },
  { id: '404', category_id: '4', name: 'Generator Servicing', description: 'Routine maintenance — oil change, filter cleaning, spark plugs', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '405', category_id: '4', name: 'Inverter Troubleshooting', description: 'Diagnose inverter faults and error codes', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },

  { id: '501', category_id: '5', name: 'Interior Painting', description: 'Paint interior walls, ceilings, and trims per room', base_price_ngn: CALL_OUT_FEE, duration_hours: 3, is_active: true },
  { id: '502', category_id: '5', name: 'Exterior Painting', description: 'Paint exterior walls and surfaces with weather-resistant paint', base_price_ngn: CALL_OUT_FEE, duration_hours: 4, is_active: true },
  { id: '503', category_id: '5', name: 'Touch-up Painting', description: 'Fix scuffs, stains, and small areas needing a refresh', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '504', category_id: '5', name: 'Wallpaper Installation', description: 'Install wallpaper on prepared walls', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },
  { id: '505', category_id: '5', name: 'Ceiling Painting', description: 'Paint ceilings including POP and textured surfaces', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },

  { id: '601', category_id: '6', name: 'Full House Cleaning', description: 'Comprehensive cleaning of all rooms and surfaces', base_price_ngn: CALL_OUT_FEE, duration_hours: 3, is_active: true },
  { id: '602', category_id: '6', name: 'Kitchen Deep Clean', description: 'Degrease cabinets, scrub tiles, clean appliances inside out', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },
  { id: '603', category_id: '6', name: 'Bathroom Deep Clean', description: 'Remove mould, scrub grout, descale fixtures and glass', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },
  { id: '604', category_id: '6', name: 'Move-in & Move-out Cleaning', description: 'Deep clean entire property before moving in or out', base_price_ngn: CALL_OUT_FEE, duration_hours: 4, is_active: true },
  { id: '605', category_id: '6', name: 'Sofa & Carpet Cleaning', description: 'Shampoo and deep clean upholstery and carpets', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },

  { id: '701', category_id: '7', name: 'Furniture Assembly', description: 'Assemble flat-pack furniture — beds, tables, shelves, cabinets', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },
  { id: '702', category_id: '7', name: 'Cabinet Repair', description: 'Fix broken hinges, drawers, doors, and cabinet frames', base_price_ngn: CALL_OUT_FEE, duration_hours: 1.5, is_active: true },
  { id: '703', category_id: '7', name: 'Custom Shelving', description: 'Build and install custom shelves and storage units', base_price_ngn: CALL_OUT_FEE, duration_hours: 2, is_active: true },
  { id: '704', category_id: '7', name: 'Door Repair & Replacement', description: 'Fix sticking doors, replace hinges, handles, or entire doors', base_price_ngn: CALL_OUT_FEE, duration_hours: 1, is_active: true },
  { id: '705', category_id: '7', name: 'Wardrobe Installation', description: 'Install fitted wardrobes with shelves and hanging rails', base_price_ngn: CALL_OUT_FEE, duration_hours: 3, is_active: true },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('category_id')

  if (!categoryId) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'category_id is required' } },
      { status: 400 },
    )
  }

  const filtered = subServices.filter((s) => s.category_id === categoryId)

  return NextResponse.json({ success: true, data: filtered })
}
