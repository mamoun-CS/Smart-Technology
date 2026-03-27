# Pricing and Shipping Logic Implementation Guide

## Overview
This implementation adds location-based pricing and shipping logic with large quantity handling to the Smart Technology e-commerce platform.

## Features Implemented

### 1. Location Selection
- Users must select a city before checkout
- Users must select a delivery method:
  - **Shipping**: Delivered to user's address
  - **In-Store Pickup**: Free shipping (pickup from store)

### 2. Pricing and Shipping
- Final price is NOT displayed until city and delivery method are selected
- Shipping cost is calculated based on selected city
- In-Store Pickup = $0 shipping cost
- Total price = Products + Shipping

### 3. Large Quantity Handling
- Maximum limit for large orders (default: 50 items)
- If limit is exceeded:
  - Automatic pricing is NOT completed
  - Message displayed: "We will contact you after confirming your address."
  - Order saved as "Under Review" status

### 4. Payment Process
- **Step 1**: Products + Quantity
- **Step 2**: Select City + Delivery Method
- **Step 3**:
  - Regular orders → Display total and allow payment
  - Large orders → Disable direct payment, mark as "Under Review"

### 5. Database Changes
New fields added to `orders` table:
- `city` (VARCHAR 100) - City selected by user
- `delivery_method` (VARCHAR 20) - 'shipping' or 'pickup'
- `shipping_cost` (DECIMAL 10,2) - Calculated shipping cost
- `is_large_order` (BOOLEAN) - Flag for large orders

New table `system_config`:
- Stores configuration like large order threshold

### 6. User Interface
Clear messages displayed for:
- Shipping cost not yet calculated
- Large quantity requires manual follow-up

## Database Migration

Run the migration file to add new fields:

```sql
-- Execute the migration file
psql -U your_username -d your_database -f database/migration_shipping_location.sql
```

Or manually run the SQL commands in `database/migration_shipping_location.sql`.

## Backend Changes

### Models Updated

#### `backend/models/orderModel.js`
- Added `getConfigValue()` - Get system configuration
- Added `isLargeOrder()` - Check if order exceeds threshold
- Added `calculateShippingCost()` - Calculate shipping based on city
- Updated `createOrder()` - Handle new fields and logic
- Updated `getAllOrders()` - Include new fields in response

#### `backend/models/shippingModel.js`
- Added `getShippingCostByCity()` - Get shipping cost by city name

### Controllers Updated

#### `backend/controllers/orderController.js`
- Updated `createOrder()` - Validate city and delivery method
- Added `calculateShipping()` - API endpoint for shipping calculation
- Added `checkLargeOrder()` - API endpoint for large order check
- Updated `updateOrderStatus()` - Handle new statuses

#### `backend/controllers/cartController.js`
- Added `getCartSummary()` - Get cart with shipping calculation
- Updated all responses to include `total_quantity`

### Routes Updated

#### `backend/routes/orders.js`
- Added `GET /calculate/shipping` - Calculate shipping cost
- Added `GET /check/large-order` - Check if order is large
- Updated validation for `POST /` - Require city and delivery method

#### `backend/routes/cart.js`
- Added `GET /summary` - Get cart summary with shipping

## Frontend Changes

### New Pages

#### `frontend/app/[locale]/checkout/page.js`
- Complete checkout flow with location selection
- Displays shipping cost calculation
- Shows large order warnings
- Handles payment method selection

### Updated Pages

#### `frontend/app/[locale]/cart/page.js`
- Added city selection dropdown
- Added delivery method selection (Shipping/Pickup)
- Real-time shipping cost calculation
- Large order warning display
- Conditional checkout button (disabled until location selected)

#### `frontend/app/[locale]/orders/page.js`
- Displays city and delivery method for each order
- Shows shipping cost breakdown
- Large order indicator

#### `frontend/app/[locale]/admin/orders/page.js`
- Added city column to orders table
- Added delivery method column
- Shows shipping cost in order details
- Large order indicator in status badges
- New statuses: 'confirmed', 'contacted', 'under_review'

## API Endpoints

### New Endpoints

```
GET /api/orders/calculate/shipping
Query Parameters:
  - city (required): City name
  - delivery_method (required): 'shipping' or 'pickup'
Response:
  {
    "success": true,
    "shipping_cost": 15.00,
    "delivery_method": "shipping",
    "city": "Ramallah"
  }

GET /api/orders/check/large-order
Query Parameters:
  - total_quantity (required): Total items in cart
Response:
  {
    "success": true,
    "is_large_order": false,
    "total_quantity": 5
  }

GET /api/cart/summary
Query Parameters:
  - city (optional): City name
  - delivery_method (optional): 'shipping' or 'pickup'
Response:
  {
    "success": true,
    "cart": {...},
    "items": [...],
    "subtotal": 150.00,
    "total_quantity": 5,
    "shipping_cost": 15.00,
    "is_large_order": false,
    "total": 165.00,
    "requires_location": false
  }
```

### Updated Endpoints

```
POST /api/orders
Body:
  {
    "shipping_address": "123 Main St",
    "payment_method": "credit_card",
    "city": "Ramallah",
    "delivery_method": "shipping"
  }
```

## Configuration

### Large Order Threshold
Default: 50 items

To change, update the `system_config` table:
```sql
UPDATE system_config 
SET config_value = '100' 
WHERE config_key = 'large_order_threshold';
```

### Shipping Areas
Shipping costs are stored in the `shipping_areas` table:
```sql
INSERT INTO shipping_areas (name_en, name_ar, price, estimated_days, active) VALUES
('Ramallah', 'رام الله', 10.00, 1, TRUE),
('Nablus', 'نابلس', 15.00, 2, TRUE),
('Hebron', 'الخليل', 20.00, 3, TRUE),
('Gaza Strip', 'قطاع غزة', 25.00, 4, TRUE),
('Jerusalem', 'القدس', 12.00, 1, TRUE);
```

## Order Statuses

New statuses added:
- `pending` - Order placed, awaiting processing
- `confirmed` - Order confirmed by admin
- `contacted` - Customer contacted for large order
- `processing` - Order being processed
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled
- `under_review` - Large order under manual review

## Testing

### Test Scenarios

1. **Regular Order Flow**
   - Add items to cart
   - Select city and delivery method
   - Verify shipping cost calculation
   - Complete checkout
   - Verify order status is 'pending'

2. **Large Order Flow**
   - Add more than 50 items to cart
   - Verify large order warning appears
   - Select city and delivery method
   - Verify payment is disabled
   - Submit order
   - Verify order status is 'under_review'

3. **In-Store Pickup**
   - Add items to cart
   - Select any city
   - Select "In-Store Pickup"
   - Verify shipping cost is $0
   - Complete checkout

4. **Shipping Cost Calculation**
   - Select different cities
   - Verify shipping costs match database
   - Select "In-Store Pickup"
   - Verify shipping cost is always $0

## Notes

- The implementation uses the existing `shipping_areas` table for city-based shipping costs
- Large order threshold is configurable via `system_config` table
- All monetary values are in the currency configured in the system
- The frontend validates location selection before allowing checkout
- Admin can manually update order status from 'under_review' to 'confirmed' or 'contacted'
