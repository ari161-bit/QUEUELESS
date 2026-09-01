# QUEUELESS

Stop Waiting. Start Living.

QUEUELESS is a prototype for a Pakistani B2B queue management platform. Businesses such as clinics, salons and service centers use it to manage physical queues digitally. Customers get a digital token, leave the waiting area, and are notified when their turn is approaching.

This is a functional prototype built for a pitch presentation. It uses mock, in-memory data rather than a real backend, so all queue state resets on page refresh.

## Demo flow

Customer side:
1. Open the homepage and click Join a Queue.
2. Choose a business (CityCare Diagnostic Center, Glow Salon, or QuickFix Service Center).
3. Choose a service to get a digital token.
4. See your token, the currently serving token, and your estimated wait.
5. Click Notify Me When I'm Close, or click Simulate Next Notification to preview the almost next alert.

Business side:
1. Click For Businesses.
2. View today's queue, currently serving customer, and stats.
3. Click Call Next Customer to advance the queue.
4. Click Add Customer to add a new customer directly from the counter.

The customer and business views share the same underlying queue state, so calling the next customer on the business dashboard updates a customer's estimated wait in real time.

## Running locally

```
npm install
npm run dev
```

Then open the local address that Vite prints in your terminal.

## Tech

React, built with Vite. Icons from lucide-react. No backend, no database, no real payment or notification integration. All business names are fictional.
