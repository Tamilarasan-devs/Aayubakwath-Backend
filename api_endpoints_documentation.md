# Aayubakwath API Documentation

This document lists all backend API endpoints for the Aayubakwath 2.0 platform. All routes are prefixed with `/api/v1`.

## Base URL
- Production: `https://aayubakwath-backend-production.up.railway.app/api/v1`
- Local: `http://localhost:5001/api/v1`

---

## 1. Authentication (`/auth`)
Endpoints for user registration, login, and profile management.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Register a new user and send OTP | Public |
| POST | `/auth/verify-otp` | Verify OTP for account activation | Public |
| POST | `/auth/resend-otp` | Resend activation OTP | Public |
| POST | `/auth/login` | User login (returns JWT tokens) | Public |
| POST | `/auth/refresh-token` | Refresh expired access tokens | Public |
| GET | `/auth/profile` | Get currently logged-in user profile | Authenticated |

---

## 2. Products (`/products`)
Management of product catalog.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| GET | `/products` | List all products (supports pagination/query) | Public |
| GET | `/products/search` | Search products | Authenticated |
| GET | `/products/:id` | Get details of a single product | Public |
| POST | `/products` | Create a new product (with image upload) | Admin/Moderator |
| PUT | `/products/:id` | Update an existing product | Admin/Moderator |
| DELETE | `/products/:id` | Delete a product | Admin |

---

## 3. Cart (`/cart`)
Shopping cart management.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| GET | `/cart` | Get current user's cart | Authenticated |
| GET | `/cart/count` | Get total item count in cart | Authenticated |
| POST | `/cart` | Add a product to cart | Authenticated |
| PUT | `/cart/:productId` | Update item quantity in cart | Authenticated |
| DELETE | `/cart/:productId` | Remove an item from cart | Authenticated |
| DELETE | `/cart` | Clear entire cart | Authenticated |

---

## 4. Orders (`/orders`)
Order processing and tracking.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| POST | `/orders` | Place a new order | Authenticated |
| GET | `/orders` | List user's orders | Authenticated |
| GET | `/orders/:id` | Get order details by ID | Authenticated |
| PATCH | `/orders/:id/status` | Update order status | Admin/Moderator |
| GET | `/orders/admin/all` | List all orders across platform | Admin/Moderator |

---

## 5. Wishlist (`/wishlist`)
User product wishlist.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| GET | `/wishlist` | Get user's wishlist | Authenticated |
| POST | `/wishlist` | Add product to wishlist | Authenticated |
| DELETE | `/wishlist/:productId` | Remove product from wishlist | Authenticated |

---

## 6. Categories (`/categories`)
Product category management.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| GET | `/categories` | List all categories | Public |
| GET | `/categories/:id` | Get category details | Public |
| POST | `/categories` | Create a new category | Admin/Moderator |
| PUT | `/categories/:id` | Update a category | Admin/Moderator |
| DELETE | `/categories/:id` | Delete a category | Admin |

---

## 7. Announcements (`/announcements`)
Site-wide announcements management.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| GET | `/announcements` | List all announcements | Public |
| GET | `/announcements/:id` | Get announcement details | Public |
| POST | `/announcements` | Create an announcement | Admin/Moderator |
| PUT | `/announcements/:id` | Update an announcement | Admin/Moderator |
| DELETE | `/announcements/:id` | Delete an announcement | Admin |

---

## 8. Banners (`/home-banners`, `/offer-banners`, `/category-banners`)
Promotional banner management.

| Method | Group | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- | :--- |
| GET | All | `/` | List all banners in group | Public |
| GET | All | `/:id` | Get banner by ID | Public |
| POST | All | `/` | Create banner (with image) | Admin/Moderator |
| PUT | All | `/:id` | Update banner | Admin/Moderator |
| DELETE | All | `/:id` | Delete banner | Admin |

---

## 9. Offer Bars (`/offer-bars`)
Top bar offer messages.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| GET | `/offer-bars` | List all offer bars | Public |
| GET | `/offer-bars/:id` | Get offer bar details | Public |
| POST | `/offer-bars` | Create an offer bar | Admin/Moderator |
| PUT | `/offer-bars/:id` | Update an offer bar | Admin/Moderator |
| DELETE | `/offer-bars/:id` | Delete an offer bar | Admin |

---

## 10. Product Content (`/product-contents`)
Rich text or additional content for products.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| GET | `/:productId` | Get content for a product | Public |
| POST | `/` | Create product content | Admin/Moderator |
| PUT | `/:productId` | Update product content | Admin/Moderator |
| DELETE | `/:productId` | Delete product content | Admin |

---

## 11. Users & Addresses (`/users`)
User address management and admin user list.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| GET | `/users/admin/all` | List all users | Admin/Moderator |
| GET | `/users/addresses` | Get user's addresses | Authenticated |
| POST | `/users/addresses` | Add a new address | Authenticated |
| PATCH | `/users/addresses/:id` | Update an address | Authenticated |
| DELETE | `/users/addresses/:id` | Delete an address | Authenticated |
| PATCH | `/users/addresses/:id/default`| Set address as default | Authenticated |

---

## 12. Analytics (`/analytics`)
Platform-wide data and KPIs (Admin Only).

| Method | Endpoint | Usage |
| :--- | :--- | :--- |
| GET | `/analytics/kpis` | Core platform metrics |
| GET | `/analytics/revenue-over-time` | Financial growth charts |
| GET | `/analytics/top-products` | Best selling items |
| GET | `/analytics/order-status` | Order fulfillment breakdown |
| GET | `/analytics/user-growth` | New user registrations over time |
| GET | `/analytics/recent-activity` | Latest events on platform |

---

## 13. Reviews (`/reviews`)
Product reviews and ratings.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| POST | `/reviews` | Submit a product review | Authenticated |
| GET | `/reviews/product/:productId` | Get reviews for a product | Public |
| GET | `/reviews/product/:productId/aggregate`| Get average rating/counts | Public |
| DELETE| `/reviews/:id` | Delete a review | Authenticated |

---

## 14. Inquiries (`/inquiries`)
Contact forms and bulk order requests.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| POST | `/inquiries/contact` | Submit contact form | Public |
| POST | `/inquiries/bulk-order`| Submit bulk order request | Public |
| GET | `/inquiries/contact` | List contact inquiries | Admin/Moderator |
| GET | `/inquiries/bulk-order`| List bulk order requests | Admin/Moderator |

---

## 15. Coupons (`/coupons`)
Discount coupon management.

| Method | Endpoint | Usage | Access |
| :--- | :--- | :--- | :--- |
| POST | `/coupons/apply` | Apply coupon to current cart | Authenticated |
| GET | `/coupons` | List all coupons | Admin/Moderator |
| POST | `/coupons` | Create a new coupon | Admin/Moderator |
| DELETE| `/coupons/:id` | Delete a coupon | Admin |
