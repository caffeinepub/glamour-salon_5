# Glamour Salon Booking App

## Current State
New project -- no existing code.

## Requested Changes (Diff)

### Add
- Full customer-facing booking flow: browse services with smart curated filters (Trending, Seasonal, Popular), select stylist, pick time slot, pay 10% advance via Stripe
- Stylist profiles with Before/After photo gallery (via Blob Storage)
- Admin Dashboard with:
  - Today's earnings displayed via Bar chart and Pie chart
  - Inventory management with Low Stock Alerts (blinking red icon when stock < threshold)
  - Booking management (view, confirm, cancel)
  - Service and stylist management
  - Staff management
- Role-based access: Admin vs Customer
- Inventory tracking for salon products (Shampoo, Hair Color, etc.)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Actors for bookings, services, stylists, inventory, payments (Stripe advance), users (authorization)
2. Inventory: Each item has name, quantity, threshold; low stock = quantity <= threshold
3. Earnings: Bookings have payment amounts; today's earnings aggregated by service category
4. Admin Dashboard: Charts for earnings, blinking red alerts for low stock items
5. Customer flow: Service browse with filter tags, stylist selection with portfolio, Stripe 10% advance
6. Blob Storage: Stylist Before/After photo upload and display
