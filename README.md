# Objective:

1. Create Web API endpoints to import product, fetch product, fetch adjustment, manage Product and Adjustment from local database (must use defined tech stack).
2. Create a Single Page Application (SPA) to display, manage Product and Adjustment (must use defined tech stack).

## Backend Requirements

**Tech Stack Backend**
▪ JS Platform: Node.js (https://nodejs.org/)
▪ API framework: Fastify (https://fastify.dev/)
▪ API Doc: https://dummyjson.com/docs
▪ Developed with TypeScript is a big plus.
▪ PostgreSQL interfaces for NodeJS: Pg-Promise
**• Database: PostgreSQL**

**Non-Functional Requirement:**
• Use a raw SQL Query, instead of ORM
• Provide migration script for create tables in database.
• Good, sensible file structuring that promotes modularity and good separation of logical/UI layers.
• Adhere a good coding practice.
• Add a unit testing script for Web API is a big plus.
• Set customized Linter that encourage good coding practices is a big plus.

Please develop a secure API with the following details:

1. Products
a. Endpoint to Get List Product (Title, SKU, Image, Price, Stock) with pagination capability
b. Endpoint to Get Detail Product (Title, SKU, Image, Price, Stock, Description)
c. Endpoint to Create and Update Product (Title, SKU, Image, Price, Description)
d. Endpoint to Delete Product
e. Endpoint to Get Products from https://dummyjson.com then saved to Database. Make sure that the Product not a duplicate

2. Adjustment Transaction
a. Endpoint to Get List Transactions (SKU, Qty, Amount) with pagination capability
b. Endpoint to Get Detail Transaction (SKU, Qty, Amount)

Version 2.0
c. Endpoint to Create and Update Transaction (SKU, Qty)
d. Endpoint to Delete Transaction
It would be nice and point plus for us if you can add your own requirements which can increase the API capabilities.

## Database

1. Product
The data of the product are Title, SKU, Image, Price, and Description. SKU cannot be duplicated, and Description can be null. Product data will be downloaded from https://dummyjson.com. There will be Stock that calculated from Qty Adjustment Transaction.

2. Adjustment Transaction
The data of the transaction are SKU, Qty. The Qty can be minus or plus. You can't create a transaction for a Product that the Stock already 0. There will be an Amount calculated from the Price of the Product and the Qty of Adjustment Transaction. If a Product deleted the Adjustment Transaction of the Product also deleted.
Pink → Column
Green → Table
Blue → Calculated from another source.

## UI / Website Requirements

Please develop User Interface (UI) with the following details:
Products
• Display list of all products (with product image) in card layout theme, and editable detail product inside modal popup.
• Must use infinite scroll for pagination (8 products per page).
• User can add new product and save to local database.
• User can edit or delete existing products and save to local database.
Adjustment Transaction
• Display list of Adjustment in layout table with pagination (10 transaction per page)
• User can add new Adjustment with input data SKU dan Qty
• User can edit or delete existing Adjustment transactions and save it to local database.
Non-Functional Requirement:
• Use a raw SQL Query, instead of ORM
• Provide migration script for create tables in database.
• Good, sensible file structuring that promotes modularity and good separation of logical/UI layers.
• Adhere a good coding practice.
• Add a unit testing script for Web API is a big plus.
• Responsive UI display is a big plus.
• Set customized Linter that encourage good coding practices is a big plus.
• Must use a distributed version control system (ex: GitHub, Gitlab or Bitbucket)
• Clear instructions on how to run your app locally (using README.md is preferable).

Technology stack:
• Frontend:
▪ SPA UI library: Next.js with state management Zustand (https://docs.pmnd.rs/zustand)
▪ Developed with TypeScript is a big plus.