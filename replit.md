# Overview

This project is a real-time system monitoring dashboard built with React, Express, and WebSockets. It provides a terminal-style interface that displays live system metrics, service status monitoring, process information, and incident tracking. The application mimics a classic Unix system monitor aesthetic with dark themes and monospace fonts, featuring auto-refreshing data and real-time updates via WebSocket connections.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React and TypeScript using Vite as the build tool. The UI follows a terminal/console aesthetic using Tailwind CSS with custom color schemes and the shadcn/ui component library for consistent design patterns. The application uses Wouter for client-side routing and TanStack Query for state management and data fetching. Real-time updates are handled through a custom WebSocket hook that maintains persistent connections with automatic reconnection logic.

## Backend Architecture
The server runs on Express.js with TypeScript and implements a RESTful API structure. The application uses a layered architecture with separate modules for routing, storage, and system monitoring services. WebSocket integration provides real-time bidirectional communication between server and clients. The system monitoring service generates realistic system metrics and process data, simulating CPU usage, memory consumption, network activity, and process information.

## Data Storage Strategy
The application currently uses an in-memory storage implementation that simulates database operations for services, incidents, system metrics, and processes. The storage layer is abstracted through interfaces, making it easy to swap to a persistent database solution. Drizzle ORM is configured for PostgreSQL integration with schema definitions ready for database migration when needed.

## Real-time Communication
WebSocket connections handle live data streaming between server and clients. The server broadcasts system updates every 2 seconds and service status changes every 30 seconds. Clients automatically reconnect on connection loss with exponential backoff. Message types include system updates with metrics/processes and incident notifications.

## Component Architecture
The frontend uses a modular component structure with dedicated components for different dashboard sections: SystemOverview for service status cards, ResourceMonitoring for CPU/memory/network metrics, ServiceDetails for detailed service tables, IncidentHistory for incident tracking, and NotificationFooter for user engagement features. Each component handles its own data rendering and state management while receiving data through props from the main dashboard container.

## Styling and Design System
The application implements a custom dark theme with terminal-inspired aesthetics using CSS custom properties for consistent theming. Tailwind CSS provides utility classes while shadcn/ui components ensure accessibility and consistency. The design includes retro terminal elements like ASCII borders, monospace fonts (JetBrains Mono, Fira Code), terminal-style progress bars using Unicode block characters, and blinking cursor effects.

# External Dependencies

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built accessible React component library based on Radix UI
- **Radix UI**: Low-level UI primitives for building accessible components
- **class-variance-authority**: Utility for creating component variants
- **Lucide React**: Icon library for UI elements

## State Management and Data Fetching
- **TanStack React Query**: Server state management and data fetching
- **Wouter**: Lightweight client-side routing

## Backend Framework and Database
- **Express.js**: Web application framework for Node.js
- **Drizzle ORM**: TypeScript ORM configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database service (@neondatabase/serverless)
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Real-time Communication
- **ws**: WebSocket library for real-time bidirectional communication

## Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced development experience
- **Replit plugins**: Development environment integration and error handling