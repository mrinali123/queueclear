import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Message from "../models/Message.js";
import Order from "../models/Order.js";
import Policy from "../models/Policy.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Ticket from "../models/Ticket.js";

const DEV_PASSWORD = "password123";
const SEED_DATE = new Date("2026-10-01T09:00:00.000Z");

const stores = [
  {
    seller: {
      name: "Aarav Mehta",
      storeName: "Nova Electronics",
      email: "seller.electronics@example.test",
      currency: "INR",
      autoRefundLimit: 500000,
    },
    customers: [
      { name: "Rohan Shah", email: "rohan.shah@example.test" },
      { name: "Priya Nair", email: "priya.nair@example.test" },
      { name: "Kabir Mehta", email: "kabir.mehta@example.test" },
      { name: "Anika Bose", email: "anika.bose@example.test" },
    ],
    products: [
      {
        name: "Pulse Wireless Earbuds",
        description: "Wireless earbuds with a charging case and noise reduction.",
        sku: "NE-AUD-001",
        priceMinor: 299900,
        status: "active",
      },
      {
        name: "Orbit Smartwatch",
        description: "Water-resistant smartwatch with activity tracking.",
        sku: "NE-WAT-002",
        priceMinor: 699900,
        status: "active",
      },
      {
        name: "Volt Power Bank",
        description: "Compact 20000 mAh power bank with USB-C charging.",
        sku: "NE-PWR-003",
        priceMinor: 189900,
        status: "active",
      },
      {
        name: "Nova Bluetooth Speaker",
        description: "Portable Bluetooth speaker for indoor and outdoor use.",
        sku: "NE-SPK-004",
        priceMinor: 249900,
        status: "active",
      },
      {
        name: "USB-C Fast Charger",
        description: "30 W wall charger with a USB-C cable.",
        sku: "NE-CHG-005",
        priceMinor: 129900,
        status: "archived",
      },
    ],
    orderSpecs: [
      { customerIndex: 0, productIndexes: [0], status: "fulfilled", placedAt: "2026-09-28T10:00:00.000Z" },
      { customerIndex: 1, productIndexes: [1], status: "paid", placedAt: "2026-09-10T09:00:00.000Z" },
      { customerIndex: 2, productIndexes: [2, 4], status: "pending", placedAt: "2026-09-08T08:30:00.000Z" },
      { customerIndex: 3, productIndexes: [3], status: "cancelled", placedAt: "2026-09-21T11:00:00.000Z" },
      { customerIndex: 0, productIndexes: [0, 2], status: "partially_refunded", placedAt: "2026-09-18T12:00:00.000Z", refundFraction: 0.5 },
      { customerIndex: 1, productIndexes: [4], status: "refunded", placedAt: "2026-09-17T13:00:00.000Z" },
      { customerIndex: 2, productIndexes: [1, 3], status: "fulfilled", placedAt: "2026-09-29T14:00:00.000Z" },
      { customerIndex: 3, productIndexes: [0], status: "paid", placedAt: "2026-09-06T07:00:00.000Z" },
    ],
    policies: [
      {
        title: "Electronics Refund Policy",
        category: "refund",
        content: "Customers may request a refund within 7 calendar days of delivery for an unopened product in its original packaging. For a product that arrives damaged or does not work, contact support within 48 hours with photos or a short video so the team can verify the issue. Approved refunds are returned to the original payment method after the item is received and inspected.",
      },
      {
        title: "Electronics Return Policy",
        category: "return",
        content: "A return request must be opened within 10 calendar days of delivery. The product must include its accessories, manuals, and original packaging. Products with physical damage caused after delivery, missing serial labels, or signs of misuse may not qualify. Support will provide return instructions after reviewing the request.",
      },
      {
        title: "Electronics Shipping Policy",
        category: "shipping",
        content: "Orders are normally dispatched within 2 business days, and delivery estimates vary by PIN code. If tracking has not updated for 5 business days, the customer should contact support with the order number. The store will check with the courier before promising a replacement or refund, and weather or regional service disruptions can extend delivery times.",
      },
    ],
    tickets: [
      {
        customerIndex: 1,
        orderIndex: 2,
        subject: "Power bank order has not moved in tracking",
        status: "waiting_on_seller",
        createdAt: "2026-09-27T09:00:00.000Z",
        messages: [
          { senderType: "customer", body: "My order has had no tracking update for over a week. Can you check whether it has shipped?", createdAt: "2026-09-27T09:00:00.000Z" },
          { senderType: "seller", body: "I am checking the courier scan and will update you as soon as they respond.", createdAt: "2026-09-27T10:15:00.000Z" },
          { senderType: "customer", body: "Thank you. The tracking page still shows only the label created.", createdAt: "2026-09-28T07:30:00.000Z" },
        ],
      },
      {
        customerIndex: 2,
        orderIndex: 4,
        subject: "Requesting a refund for damaged earbuds",
        status: "waiting_on_customer",
        createdAt: "2026-09-25T11:00:00.000Z",
        messages: [
          { senderType: "customer", body: "One earbud does not charge. I would like to return the set for a refund.", createdAt: "2026-09-25T11:00:00.000Z" },
          { senderType: "seller", body: "Please send a photo of the charging case and a short video showing the issue so we can review it.", createdAt: "2026-09-25T12:20:00.000Z" },
        ],
      },
    ],
  },
  {
    seller: {
      name: "Ananya Rao",
      storeName: "Thread & Loom",
      email: "seller.fashion@example.test",
      currency: "INR",
      autoRefundLimit: 150000,
    },
    customers: [
      { name: "Meera Iyer", email: "meera.iyer@example.test" },
      { name: "Arjun Kapoor", email: "arjun.kapoor@example.test" },
      { name: "Sana Khan", email: "sana.khan@example.test" },
      { name: "Dev Malhotra", email: "dev.malhotra@example.test" },
    ],
    products: [
      {
        name: "Indigo Cotton Kurta",
        description: "Hand-block inspired cotton kurta for everyday wear.",
        sku: "TL-KUR-101",
        priceMinor: 159900,
        status: "active",
      },
      {
        name: "Linen Blend Shirt",
        description: "Breathable button-down shirt in a relaxed fit.",
        sku: "TL-SHR-102",
        priceMinor: 129900,
        status: "active",
      },
      {
        name: "Everyday Cotton Saree",
        description: "Lightweight woven cotton saree with a contrast border.",
        sku: "TL-SAR-103",
        priceMinor: 249900,
        status: "active",
      },
      {
        name: "Printed Summer Dress",
        description: "Knee-length printed dress with a cotton lining.",
        sku: "TL-DRS-104",
        priceMinor: 199900,
        status: "active",
      },
      {
        name: "Canvas Tote Bag",
        description: "Reusable lined canvas tote with an inside pocket.",
        sku: "TL-BAG-105",
        priceMinor: 89900,
        status: "archived",
      },
    ],
    orderSpecs: [
      { customerIndex: 0, productIndexes: [0], status: "fulfilled", placedAt: "2026-09-28T10:30:00.000Z" },
      { customerIndex: 1, productIndexes: [1, 4], status: "paid", placedAt: "2026-09-09T08:00:00.000Z" },
      { customerIndex: 2, productIndexes: [2], status: "pending", placedAt: "2026-09-07T08:15:00.000Z" },
      { customerIndex: 3, productIndexes: [3], status: "cancelled", placedAt: "2026-09-20T10:00:00.000Z" },
      { customerIndex: 0, productIndexes: [0, 1], status: "partially_refunded", placedAt: "2026-09-19T12:30:00.000Z", refundFraction: 0.5 },
      { customerIndex: 1, productIndexes: [4], status: "refunded", placedAt: "2026-09-16T13:00:00.000Z" },
      { customerIndex: 2, productIndexes: [2, 3], status: "fulfilled", placedAt: "2026-09-29T15:00:00.000Z" },
      { customerIndex: 3, productIndexes: [0], status: "paid", placedAt: "2026-09-05T07:30:00.000Z" },
    ],
    policies: [
      {
        title: "Thread & Loom Refund Policy",
        category: "refund",
        content: "Customers may request a refund within 14 calendar days of delivery for an unused item with its original tags attached. Items marked final sale, altered garments, and items showing wear or washing are not eligible. Once an approved return reaches our studio and passes inspection, the refund is sent to the original payment method.",
      },
      {
        title: "Thread & Loom Return Policy",
        category: "return",
        content: "A return request must be submitted within 14 calendar days after delivery. Please keep the garment unworn, unwashed, and in its original condition with tags attached. If the wrong size was ordered, the customer pays the return shipping cost; if we sent the wrong item or it arrived damaged, contact support with photos so we can arrange the next step.",
      },
      {
        title: "Thread & Loom Shipping Policy",
        category: "shipping",
        content: "Orders are usually packed within 3 business days, with additional time during sale periods. If a parcel has no tracking movement for 7 business days, contact support with the order number. We will raise a courier enquiry and keep the customer updated; a delivery estimate is not a guaranteed arrival date.",
      },
    ],
    tickets: [
      {
        customerIndex: 0,
        orderIndex: 1,
        subject: "Received a different shirt from the one ordered",
        status: "waiting_on_seller",
        createdAt: "2026-09-26T08:30:00.000Z",
        messages: [
          { senderType: "customer", body: "I ordered the blue linen shirt, but the parcel contains a green one.", createdAt: "2026-09-26T08:30:00.000Z" },
          { senderType: "seller", body: "Sorry about that. Please share a photo of the item and the packing slip so I can verify the mix-up.", createdAt: "2026-09-26T09:10:00.000Z" },
          { senderType: "customer", body: "I have attached both photos. I have not worn the shirt.", createdAt: "2026-09-26T10:00:00.000Z" },
        ],
      },
      {
        customerIndex: 3,
        orderIndex: 7,
        subject: "Fashion order is delayed and I need a refund",
        status: "waiting_on_seller",
        createdAt: "2026-09-24T14:00:00.000Z",
        messages: [
          { senderType: "customer", body: "This order has not arrived and tracking has not changed for several days. Can I cancel and get a refund?", createdAt: "2026-09-24T14:00:00.000Z" },
          { senderType: "seller", body: "I will check with the courier first. If the parcel is confirmed lost, we will review the refund under our shipping and refund policies.", createdAt: "2026-09-24T15:00:00.000Z" },
        ],
      },
    ],
  },
];

const models = [Seller, Customer, Product, Order, Ticket, Message, Policy];

function buildOrderDocuments(store, seller, customers, products) {
  return store.orderSpecs.map((spec, index) => {
    const items = spec.productIndexes.map((productIndex) => {
      const product = products[productIndex];

      return {
        productId: product._id,
        productNameSnapshot: product.name,
        unitPriceMinor: product.priceMinor,
        quantity: 1,
      };
    });
    const totalMinor = items.reduce(
      (total, item) => total + item.unitPriceMinor * item.quantity,
      0,
    );
    const placedAt = new Date(spec.placedAt);
    const refundedMinor =
      spec.status === "refunded"
        ? totalMinor
        : spec.refundFraction
          ? Math.floor(totalMinor * spec.refundFraction)
          : 0;

    return {
      sellerId: seller._id,
      customerId: customers[spec.customerIndex]._id,
      orderNumber: `${seller.storeName === "Nova Electronics" ? "NE" : "TL"}-${index + 1}`,
      items,
      currency: seller.currency,
      totalMinor,
      refundedMinor,
      status: spec.status,
      placedAt,
      createdAt: placedAt,
      updatedAt: placedAt,
    };
  });
}

async function seedDatabase() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed the database when NODE_ENV is production.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Set it in server/.env before seeding.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    console.log("Deleting existing records from all seven collections...");
    await Promise.all(models.map((Model) => Model.deleteMany({})));

    const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
    const sellers = await Seller.create(
      stores.map((store) => ({
        ...store.seller,
        passwordHash,
        createdAt: SEED_DATE,
      })),
    );

    const customersByStore = [];
    const productsByStore = [];
    const policiesByStore = [];

    for (const [index, store] of stores.entries()) {
      const seller = sellers[index];
      const customers = await Customer.create(
        store.customers.map((customer) => ({
          ...customer,
          sellerId: seller._id,
          passwordHash,
          createdAt: SEED_DATE,
        })),
      );
      const products = await Product.create(
        store.products.map((product) => ({
          ...product,
          sellerId: seller._id,
          createdAt: SEED_DATE,
          updatedAt: SEED_DATE,
        })),
      );
      const policies = await Policy.create(
        store.policies.map((policy) => ({
          ...policy,
          sellerId: seller._id,
          status: "active",
          createdAt: SEED_DATE,
          updatedAt: SEED_DATE,
        })),
      );

      customersByStore.push(customers);
      productsByStore.push(products);
      policiesByStore.push(policies);
    }

    const ordersByStore = [];
    for (const [index, store] of stores.entries()) {
      const orders = await Order.create(
        buildOrderDocuments(
          store,
          sellers[index],
          customersByStore[index],
          productsByStore[index],
        ),
      );
      ordersByStore.push(orders);
    }

    const ticketsByStore = [];
    for (const [storeIndex, store] of stores.entries()) {
      const customers = customersByStore[storeIndex];
      const orders = ordersByStore[storeIndex];
      const tickets = await Ticket.create(
        store.tickets.map((ticket) => {
          const createdAt = new Date(ticket.createdAt);

          return {
            sellerId: sellers[storeIndex]._id,
            customerId: customers[ticket.customerIndex]._id,
            orderId: orders[ticket.orderIndex]._id,
            subject: ticket.subject,
            status: ticket.status,
            createdAt,
            updatedAt: createdAt,
          };
        }),
      );
      ticketsByStore.push(tickets);

      const messages = [];
      for (const [ticketIndex, ticketSpec] of store.tickets.entries()) {
        for (const message of ticketSpec.messages) {
          messages.push({
            ticketId: tickets[ticketIndex]._id,
            senderType: message.senderType,
            senderId:
              message.senderType === "seller"
                ? sellers[storeIndex]._id
                : customers[ ticketSpec.customerIndex ]._id,
            body: message.body,
            createdAt: new Date(message.createdAt),
          });
        }
      }
      await Message.create(messages);
    }

    const counts = {
      sellers: sellers.length,
      customers: customersByStore.reduce((total, list) => total + list.length, 0),
      products: productsByStore.reduce((total, list) => total + list.length, 0),
      orders: ordersByStore.reduce((total, list) => total + list.length, 0),
      tickets: ticketsByStore.reduce((total, list) => total + list.length, 0),
      messages: stores.reduce(
        (total, store) =>
          total + store.tickets.reduce((sum, ticket) => sum + ticket.messages.length, 0),
        0,
      ),
      policies: policiesByStore.reduce((total, list) => total + list.length, 0),
    };

    console.log("\nSeed completed successfully:");
    for (const [collection, count] of Object.entries(counts)) {
      console.log(`- ${collection}: ${count}`);
    }
    console.log("\nSeller login emails:");
    for (const store of stores) {
      console.log(`- ${store.seller.storeName}: ${store.seller.email}`);
    }
    console.log("\nCustomer login emails by store:");
    for (const store of stores) {
      console.log(`- ${store.seller.storeName}:`);
      for (const customer of store.customers) {
        console.log(`  - ${customer.email}`);
      }
    }
    console.log(`\nShared development password: ${DEV_PASSWORD}`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

await seedDatabase();