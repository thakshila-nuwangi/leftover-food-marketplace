# Architecture

## Goal

Keep the frontend and backend independently deployable while sharing one repository during early development.

## Applications

### Web

The customer and restaurant-facing interface will live in `apps/web` and use React with TypeScript.

### API

The backend will live in `apps/api` and use NestJS with TypeScript. It will expose REST endpoints for authentication, restaurants, food listings, and orders.

## Data

PostgreSQL will store users, restaurant profiles, listings, and orders. Database integration will be introduced in a later incremental commit.

## Development principles

- Feature-focused commits
- Environment variables for configuration
- API validation at request boundaries
- Automated tests for business logic
- CI checks before merge
