## Project Title
Tana Market – Role-Based E-Commerce Platform

## Background
Tana Market is a full-stack web application designed to streamline online retail operations for a multi-role organization. The codebase provides an end-to-end shopping workflow, integrating catalog management, cart and checkout, order lifecycle tracking, payments, and administrative oversight. It leverages a React 18 + Vite frontend with Tailwind/Bootstrap styling, and a Node.js/Express API backed by MongoDB via Mongoose.

## Problem Statement
Traditional small-to-mid scale retailers struggle to manage products, payments, shipping, and customer feedback in a single cohesive system. Fragmented tools create operational delays, limited visibility, and security risks. There is a need for an integrated, role-aware platform that supports customers, managers, and administrators with coherent workflows and auditable actions.

## Objectives
- **General Objective**: Deliver a secure, role-based e-commerce system that unifies product management, ordering, payment processing, delivery tracking, and feedback moderation.
- **Specific Objectives**:
  - Implement authenticated RBAC for admin, manager, and customer roles with protected routes and APIs.
  - Provide full product CRUD with stock, discount, category, and image management.
  - Enable cart, checkout, order placement, payment verification (Chapa), and tracking using unique TANA tracking numbers.
  - Support order lifecycle states (pending → paid → approved → shipped → delivered / cancelled) with notifications.
  - Facilitate customer reviews with moderation controls and activity logging for auditability.
  - Offer dashboards (admin, manager, customer) with analytics and reports.

## Scope
- **Included**: User authentication (JWT), RBAC, product catalog, cart, checkout, orders, Chapa payment verification, delivery-time constraints (1–3 minutes window), tracking, comments/reviews, notifications, analytics dashboards, activity logs, uploads, and role-specific UI.
- **Excluded**: Native mobile apps, external warehouse systems, third-party shipping integrations beyond internal status management, advanced A/B testing, and ML-based recommendations.

## Beneficiaries
- **Customers**: Seamless shopping, secure payments, order tracking, and feedback submission.
- **Managers**: Operational control for product updates, shipping progression, and comment handling.
- **Administrators**: Governance over users, products, orders, returns, reports, and audit trails.
- **Business Owners**: Unified visibility on sales, revenue, and performance metrics.

## Limitations
- Relies on MongoDB; no SQL schema is provided.
- Payment integration targets Chapa; alternative gateways are not configured.
- Delivery time is currently a fixed 1–3 minute window and auto-managed, not dynamically optimized by logistics data.
- No offline-first capabilities; requires network connectivity to function.

## Project Significance
The system demonstrates a production-style, role-aware e-commerce platform with full-stack implementation. It addresses operational cohesion, auditability, and customer experience through integrated workflows, enforced security (JWT + RBAC), and analytics. The codebase serves as a comprehensive reference for BSc-level applied software engineering across backend, frontend, database design, and deployment considerations.
