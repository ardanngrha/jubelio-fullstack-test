# E-Commerce Web Application

## Requirements

- Node.js v22+
- npm v10+
- PostgreSQL v17+

## Tech Stack

- **Backend**: `Node.js`, `Fastify`, `TypeScript`, `node-pg-migrate` for database migrations, `pg-promise` for database interactions, `Jest & Supertest` for testing, `ESLint` for code linting.
- **Frontend**: `Next.js` with `Zustand` for state management, `Tailwind CSS` for styling, `Zod` for form handling, `shadcn/ui` for UI components, `ESLint` for code linting.
- **Database**: `PostgreSQL`.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/ardanngrha/jubelio-fullstack-test.git
   cd jubelio-fullstack-test
   ```

### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Set up the database:
  Create two PostgreSQL databases named `jubelio` and `jubelio_test`.

4. Copy the example environment file and configure it:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your database credentials and other necessary configurations.

   The `.env` file look like this:

   ```env
    HOST=localhost
    PORT=<your_preferred_port>

    PGHOST=localhost
    PGUSER=<your_db_user>
    PGDATABASE=jubelio
    PGPASSWORD=<your_db_password>
    PGPORT=5432
   ```

5. Configure the test database settings in the `src/database/test.json` file:

   ```json
      {
      "db": {
        "user": "<your_db_user>",
        "password": "<your_db_password>",
        "host": "localhost",
        "port": 5432,
        "database": "jubelio_test"
        }
      }
   ```

   This configuration is used when running tests using `Jest` and `Supertest` to ensure they do not interfere with the production database.

6. Run database migrations for testing and production:

   ```bash
   # For testing
   npm run migrate:test up 2
   ```

    The number `2` indicates the number of migration steps to apply. We apply `2` steps here to only create the tables without seeding data.

    ```bash
    # For production
    npm run migrate up
    ```

   This will create the necessary database tables and seed initial data for the production database. If you need to rollback migrations, you can use:

   ```bash
   npm run migrate:down 3
   ```

   Or for the test database:

   ```bash
   npm run migrate:test:down 2
   ```  

   This will rollback the last `3` for production or `2` for the test database migration steps.

7. Start the backend server:

   ```bash
   npm run dev
   ```

    The backend server will be running at `http://localhost:8080` if you haven't changed the default port.

8. (Optional) Run tests to ensure everything is set up correctly:

   ```bash
   npm run test
   ```

   This will run unit tests using `Jest` and `Supertest` and using the test database configuration.

### Frontend

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Copy the example environment file and configure it:

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file if necessary (e.g., to change the backend API URL).

   The `.env` file should look like this:

   ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. Start the frontend development server:

   ```bash
   npm run dev
   ```

  The frontend application will be running at `http://localhost:3000` if you haven't changed the default port.

### API Endpoints

You can use `Postman` and import the provided [api.postman_collection.json](api.postman_collection.json) file to test the API endpoints.

- `GET /api/products/import`: Import initial products from `dummyjson.com` into the database.
- `GET /api/products`:  
  Retrieve a paginated list of all products.

  Query Parameters:
  - `page` (optional): Page number (default: `1`)
  - `limit` (optional): Number of products per page (default: `10`)

  Example:

  ```plain
  GET /api/products?page=2&limit=8
  ```

- `GET /api/products?search=keyword&page=1&limit=8`:  
  Search products by title keyword with pagination.

  Query Parameters:
  - `search`: Keyword to filter products by title.
  - `page` (optional): Page number (default: `1`)
  - `limit` (optional): Number of products per page (default: `10`)

  Example:

  ```plain
  GET /api/products?search=phone&page=1&limit=8
  ```

- `GET /api/products/:sku`: Retrieve details of a specific product by SKU.
- `POST /api/products`: Create a new product.

  Request Body:

  ```json
  {
    "title": "Brand New Gadget",
    "sku": "BNG-002",
    "image": "https://images.unsplash.com/photo-1679421253067-b5adad691552?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "price": 199.99,
    "description": "An amazing new gadget for all your needs."
  }
  ```

- `PUT /api/products/:sku`: Update an existing product by SKU.

  Request Body:

  ```json
  {
    "title": "Updated Gadget Name 2",
    "sku": "BNG-001",
    "image": "https://images.unsplash.com/photo-1679421253067-b5adad691552?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "price": 249.99,
    "description": "An updated description for this amazing gadget."
  }
  ```

- `DELETE /api/products/:sku`: Delete a product by SKU.
- `GET /api/adjustments`:
  Retrieve a list of all adjustments transactions with pagination.

  Query Parameters:
  - `page` (optional): Page number (default: `1`)
  - `limit` (optional): Number of adjustments per page (default: `10`)

  Example:

  ```plain
  GET /api/adjustments?page=1&limit=10
  ```

- ``GET /api/adjustments?sku=keyword&page=1&limit=10``:  
  Retrieve adjustments transactions filtered by product SKU with pagination.

  Query Parameters:
  - `sku`: SKU of the product to filter adjustments.
  - `page` (optional): Page number (default: `1`)
  - `limit` (optional): Number of adjustments per page (default: `10`)

  Example:

  ```plain
  GET /api/adjustments?productSku=SKU123&page=1&limit=10
  ```

- `POST /api/adjustments`: Create a new adjustment.

  Request Body:

  ```json
  {
    "sku": "BNG-002",
    "qty": 100
  }
  ```

- `GET /api/adjustments/:id`: Retrieve details of a specific adjustment by ID.
- `PUT /api/adjustments/:id`: Update an existing adjustment by ID.

  Request Body:

  ```json
  {
    "sku": "BNG-002",
    "qty": -50
  }
  ```

- `DELETE /api/adjustments/:id`: Delete an adjustment by ID.
