# Hypernova Test - Call Pattern Analyzer

A full-stack application for analyzing customer interaction patterns using Neo4j graph database and React frontend.

## Architecture

- **Backend**: Node.js/TypeScript with Express and Neo4j
- **Frontend**: React with Vite, TailwindCSS, and Chart.js
- **Database**: Neo4j Community Edition
- **Runtime**: Bun (fast JavaScript runtime)

## Prerequisites

- [Bun](https://bun.sh) v1.2.15 or higher
- [Docker](https://docker.com) and Docker Compose
- Node.js 18+ (for client development)

## Quick Start

### 1. Clone and Setup Environment

```bash
git clone <repository-url>
cd hypernovatest
cp .env.example .env  # Configure your environment variables
```

### 2. Start Database Services

```bash
# Start Neo4j and Graphiti services
docker-compose up -d

# Wait for services to be ready (about 30 seconds)
# Neo4j Browser will be available at http://localhost:7474
# Default credentials: neo4j/password123
```

### 3. Backend Setup

```bash
# Install backend dependencies
bun install

# Load initial data into Neo4j
bun run load:data

# Start backend development server
bun run dev
```

The backend API will be available at `http://localhost:3000`

### 4. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
bun install

# Start frontend development server
bun run dev
```

The frontend will be available at `http://localhost:5173`

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Neo4j Configuration
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password123
NEO4J_DATABASE=neo4j

# Graphiti Configuration
GRAPHITI_BASE_URL=http://localhost:8000
GRAPHITI_API_KEY=your-api-key-here
GRAPHITI_TIMEOUT=30000
```

## Services

### Neo4j Database
- **URL**: http://localhost:7474
- **Bolt**: bolt://localhost:7687
- **Credentials**: neo4j/password123

### Graphiti Knowledge Graph
- **URL**: http://localhost:8000
- **Purpose**: Enhanced graph processing capabilities

## API Endpoints

- `GET /api/clientes` - Get all clients
- `GET /api/clientes/:clienteId/timeline` - Get client timeline
- `GET /api/agentes` - Get all agents
- `GET /api/agentes/:agenteId/efectividad` - Get agent details  
- `GET /api/analytics/promesas-incumplidas` - Get promesas incumplidas 
- `GET /api/analytics/mejores-horarios` - Get mejores horarios

## Project Structure

```
├── src/                    # Backend source code
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── loaders/           # Data loading utilities
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── services/      # API client
├── data/                  # Sample data files
└── docker-compose.yml     # Database services
```

## Built With

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Backend**: Express.js, TypeScript, Neo4j Driver
- **Frontend**: React, Vite, TailwindCSS, Chart.js
- **Database**: Neo4j Community Edition
- **Visualization**: React Force Graph, Chart.js
