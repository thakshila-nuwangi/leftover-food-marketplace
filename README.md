# Leftover Food Marketplace

A portfolio project for a New Zealand-focused marketplace where restaurants can list surplus food near closing time and customers can discover discounted meals.

## Project status

This repository is being built progressively with two meaningful commits per development day.

## Planned stack

- React + TypeScript frontend
- NestJS + TypeScript backend
- PostgreSQL
- JWT authentication
- Docker
- GitHub Actions

## Repository structure

```text
apps/
  web/   # React frontend
  api/   # NestJS backend
```

## Roadmap

1. Project foundation
2. Shared configuration
3. Authentication
4. Restaurant profiles
5. Food listings
6. Ordering
7. Customer marketplace UI
8. Restaurant dashboard
9. Tests and CI/CD

## Day 8 progress

- Added an in-memory listing repository and restaurant availability service.
- Added a restaurant dashboard with editable surplus serving counts.

## Day 10 progress

- Added pickup-window validation and availability helper for listings.
- Added dashboard listing search and publish feedback for restaurant staff.

## Day 11 progress

- Added reservation types, repository, creation rules, totals, and customer lookup.
- Added a customer reservation form and marketplace pickup flow with confirmation feedback.

## Day 12 progress

- Added reservation cancellation and collection lifecycle actions.
- Added customer reservation history with status-aware controls.

## Day 13 progress

- Connected reservations to listing availability so bookings decrement inventory and cancellations restore it.
- Added protection against overbooking and sold-out listings while keeping collected reservations permanently allocated.

- Added a restaurant reservation queue with pickup status filters and collection/cancellation controls.

## Day 14 progress

- Added pickup-window enforcement to reservation creation so customers can only reserve currently collectable listings.

- Added pickup-window visibility and closing-soon cues to the restaurant reservation queue.

## Day 15 progress

- Added marketplace listing discovery with search, restaurant, price, availability, and price-sorting filters.
- Added test coverage for marketplace filtering and sold-out exclusion.

## Day 16 progress

- Added pickup-window-aware marketplace filtering with an explicit current-time input for deterministic API behavior.
- Added tests covering active-window inclusion and closed-window exclusion.

- Added a selected-meal reservation summary with restaurant and pickup-window context.
- Reset quantity and confirmation state when customers switch to another marketplace listing.

## Day 17 progress
- Added reservation reference codes and pickup-context snapshots so customers can identify a booking even if listing details change later.

- Added a customer-friendly reservation receipt with reference code, restaurant, meal, and pickup details.


## Day 19 progress
- Added reservation reference lookup and pickup verification rules.
- Added restaurant pickup verification UI for confirming customer reservation references.

## Day 20 progress
- Added a verify-and-collect reservation service operation so pickup verification can complete the reservation lifecycle safely.
- Added tests for successful pickup collection and repeated collection attempts.

- Added a pickup-desk action to mark a verified reservation as collected with clear completion feedback.

## Day 21 progress
- Added restaurant-scoped reservation queries and status summary metrics in the API domain.
- Added reservation search and confirmed/collected/cancelled metric cards to the restaurant queue.


## Day 22 progress
- Added listing publish/unpublish status transitions with validation so restaurants can hide a listing without losing its remaining inventory.
- Strengthened availability validation to require non-negative whole-number serving counts.

- Added restaurant listing summary metrics for total listings, publish state, and remaining inventory.

- Added restaurant controls to hide and republish listings while preserving their inventory.
