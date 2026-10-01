# QueueClear Data Model Design

This document describes the proposed Phase 1 data model for QueueClear. It is a design reference, not an implementation. Each record has a MongoDB-generated `_id`; relationships below refer to another record's `_id`.

## Shared Design Rules

- Each customer account belongs to one seller. If the same person shops at two stores, each store has its own customer record.
- Each seller uses one currency. Monetary values are stored as integer minor units, such as cents, and interpreted using the seller's currency. An order saves its currency at purchase time.
- Records owned by a seller include `sellerId` when direct tenant filtering is useful. The server must still verify that related records belong to the same seller; a reference alone is not proof of ownership.
- Required fields and uniqueness rules should be enforced by database indexes and server-side validation.
- Passwords are never stored directly. Only password hashes are stored.

## 1. Seller

The seller is the tenant: the store account whose customers, products, orders, tickets, and policies must remain isolated from other stores.

| Field | Type and rules | Purpose |
|---|---|---|
| `name` | String, required | Seller's name |
| `storeName` | String, required | Store's display name |
| `email` | String, required, globally unique, lowercase and trimmed | Seller login identity |
| `passwordHash` | String, required | Hashed seller password; never the plain password |
| `currency` | String, required, ISO currency code such as USD | Currency used for prices and refund limits |
| `autoRefundLimit` | Integer, required, default 0, minimum 0 | Maximum automatic refund amount, in minor units; refunds above the limit require seller approval |
| `createdAt` | Date, required, defaults to creation time | When the seller account was created |

**Relationships:** A seller has many Customers, Products, Orders, Tickets, and Policies.

**Needs `sellerId`?** No. Seller is the ownership root; its `_id` is referenced as `sellerId` by seller-owned records.

**Design decision:** The agreed seller fields are retained, with `currency` added so money amounts have an unambiguous unit. Integer minor units avoid common floating-point rounding problems in refund calculations.

## 2. Customer

| Field | Type and rules | Purpose |
|---|---|---|
| `sellerId` | ObjectId reference to Seller, required | Store that owns this customer account |
| `name` | String, required | Customer's name |
| `email` | String, required, lowercase and trimmed; unique together with `sellerId` | Customer login/contact identity within this store |
| `passwordHash` | String, required when customer login is supported | Hashed customer password |
| `createdAt` | Date, required, defaults to creation time | When the account was created |

**Relationships:** A customer belongs to one Seller and can have many Orders and Tickets.

**Needs `sellerId`?** Yes. It scopes the customer account to a store, helping ensure one seller cannot see another seller's customer records.

**Design decision:** Email uniqueness is scoped to a seller rather than global. That allows two different stores to have customers with the same email, while keeping their store-specific accounts separate.

## 3. Product

| Field | Type and rules | Purpose |
|---|---|---|
| `sellerId` | ObjectId reference to Seller, required | Store that owns the product |
| `name` | String, required | Product name |
| `description` | String, optional | Product details |
| `sku` | String, optional; unique together with `sellerId` when present | Seller's stock-keeping identifier |
| `priceMinor` | Integer, required, minimum 0 | Current catalog price in the seller's currency |
| `status` | Enum: `active`, `archived`; required, defaults to `active` | Whether the product is currently offered |
| `createdAt` | Date, required, defaults to creation time | When the product was created |
| `updatedAt` | Date, required | When the product was last changed |

**Relationships:** A product belongs to one Seller and may be referenced by Order line items.

**Needs `sellerId`?** Yes. It identifies the product's owner and supports direct seller-scoped product queries.

**Design decision:** Product holds the current catalog price, not the historical purchase price. Products should be archived rather than deleted so existing order references and history remain understandable.

## 4. Order

| Field | Type and rules | Purpose |
|---|---|---|
| `sellerId` | ObjectId reference to Seller, required | Seller that owns the order |
| `customerId` | ObjectId reference to Customer, required | Customer who placed the order |
| `orderNumber` | String, required, unique together with `sellerId` | Human-readable order identifier within a seller's store |
| `items` | Array, required; each item has the fields below | Products and purchase-time details |
| `items.productId` | ObjectId reference to Product, required | Product associated with the line item |
| `items.productNameSnapshot` | String, required | Product name at purchase time |
| `items.unitPriceMinor` | Integer, required, minimum 0 | Unit price at purchase time, in minor units |
| `items.quantity` | Integer, required, greater than 0 | Number of units purchased |
| `currency` | String, required | Seller currency saved at purchase time |
| `totalMinor` | Integer, required, minimum 0 | Order total at purchase time, in minor units |
| `refundedMinor` | Integer, required, defaults to 0 | Total amount refunded so far, in minor units |
| `status` | Enum: `pending`, `paid`, `fulfilled`, `cancelled`, `partially_refunded`, `refunded` | Current order state |
| `placedAt` | Date, required, defaults to creation time | When the order was placed |

**Relationships:** An order belongs to one Seller and one Customer; its line items reference Products.

**Needs `sellerId`?** Yes. It permits direct seller-scoped order lookup and provides an ownership check for support and refund workflows.

**Design decision:** The order stores the product name and price as they were at purchase time. A product's catalog details may change later, but the original values are needed to explain what the customer bought and calculate refunds correctly. Refund totals and statuses prepare for refund workflows; a separate detailed refund audit history is not included in this minimal design.

## 5. Ticket

| Field | Type and rules | Purpose |
|---|---|---|
| `sellerId` | ObjectId reference to Seller, required | Seller that owns and handles the ticket |
| `customerId` | ObjectId reference to Customer, required | Customer who opened the ticket |
| `orderId` | ObjectId reference to Order, optional | Related order, when the issue concerns one |
| `subject` | String, required | Short description of the support issue |
| `status` | Enum: `open`, `waiting_on_customer`, `waiting_on_seller`, `closed`; required, defaults to `open` | Current support state |
| `createdAt` | Date, required, defaults to creation time | When the ticket was opened |
| `updatedAt` | Date, required | When the ticket was last changed |

**Relationships:** A ticket belongs to one Seller and one Customer, may relate to one Order, and has many Messages.

**Needs `sellerId`?** Yes. Sellers need to retrieve only their own tickets. Storing the seller reference directly makes that filter straightforward instead of following multiple relationships for every query.

**Design decision:** `orderId` is optional because a customer may need support without an existing order. The server must verify that the referenced customer and order belong to the same seller as the ticket.

## 6. Message

| Field | Type and rules | Purpose |
|---|---|---|
| `ticketId` | ObjectId reference to Ticket, required | Conversation this message belongs to |
| `senderType` | Enum: `customer`, `seller`, `ai`; required | Kind of participant who sent the message |
| `senderId` | ObjectId reference to Customer or Seller; required for human senders and absent for an AI sender | Identifies the human author |
| `body` | String, required | Message text |
| `createdAt` | Date, required, defaults to creation time | When the message was sent |

**Relationships:** A message belongs to one Ticket. For human authors, `senderId` refers to the Customer or Seller identified by `senderType`.

**Needs `sellerId`?** No. Its parent Ticket identifies the seller. The server must verify ticket ownership before returning or adding messages.

**Design decision:** Messages are separate records instead of an ever-growing array inside Ticket. This keeps tickets manageable as conversations grow and allows messages to be loaded in pages. Not duplicating `sellerId` avoids storing the same ownership fact twice, which could become inconsistent.

## 7. Policy

| Field | Type and rules | Purpose |
|---|---|---|
| `sellerId` | ObjectId reference to Seller, required | Seller whose policy this is |
| `title` | String, required | Short policy name |
| `category` | Enum: `refund`, `return`, `shipping`, `other`; required | Policy topic |
| `content` | String, required | Policy text |
| `status` | Enum: `active`, `inactive`; required, defaults to `active` | Whether the policy is currently in force |
| `createdAt` | Date, required, defaults to creation time | When the policy was added |
| `updatedAt` | Date, required | When the policy was last changed |

**Relationships:** A policy belongs to one Seller; a seller can have many Policies.

**Needs `sellerId`?** Yes. Different sellers can have different rules, and a seller's AI workflow must only retrieve that seller's policies.

**Design decision:** Keeping the original policy text provides a source for future policy search and retrieval-augmented generation (RAG). This phase does not add embeddings, vector search, policy chunks, or version history.

## Important Ownership Checks

References help connect records, but they do not automatically enforce tenant isolation. Before returning or changing an Order, Ticket, Message, Product, Customer, or Policy, the server must check that it belongs to the authenticated Seller. For example, a Ticket's `customerId` and optional `orderId` must refer to records with the same `sellerId` as that Ticket.