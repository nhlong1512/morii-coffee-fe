Here's the prompt in English:

---

**Feature: Order / Cart for Morii Coffee**

Morii Coffee exclusively serves **delivery orders** — there is no dine-in option.

**Cart Page**
When a customer taps on an item and adds it to the cart, the cart page should display:
- Item details (name, size, quantity)
- A **price summary panel on the right** including:
  - Subtotal
  - Tax fee
  - Shipping fee (if applicable)
  - Discount/promotion (if applicable)
- A **Checkout button** that navigates to the order/delivery details page

**Order / Delivery Details Page**
This page contains:
- A **delivery information form** with the following fields:
  - Full name
  - Phone number
  - Address
- A **payment method form** below the delivery form, with 3 options as radio buttons:
  - COD *(default)*
  - MoMo
  - PayPal
- The **right side** retains the same price summary panel from the cart page, but the button is now labeled **"Place Order"**

**Order Submission Flow**
When the customer clicks **"Place Order"**:
1. The system calls the **place order API**
2. Upon success, redirect to the **order history page**

**Scope for This Phase**
- Build the **UI only** — mock data is acceptable where needed
- The **MoMo and PayPal payment integrations can be skipped** for now — they will be integrated in a later phase
- COD flow should be considered the primary happy path

---

**Additional Request**

Please also **analyze the requirements above** and **suggest improvements** regarding:
- UI/UX enhancements
- Business logic edge cases or missing flows worth considering