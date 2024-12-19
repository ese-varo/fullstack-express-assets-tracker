# Asset Tracking System

This project is a learning exercise focused on building a robust and maintainable asset tracking application.  It emphasizes best practices, design patterns, and clear code structure to ensure readability and extensibility for future development.

## Project Overview

This system allows organizations to track their assets.  Key features include:

* **User Roles:** Two distinct roles:
    * **Asset Managers:** Can perform CRUD (Create, Read, Update, Delete) operations on assets.
    * **Admins:** Have full privileges, including managing asset manager users and their roles.
* **Secure Registration:** Users require an account to access the system.  Registration is by invitation only, sent by an admin user.
* **Initial admin creation:** initial admin creation mechanism or seed the database with an admin user (PENDING)
* **Asset Management:**  Intuitive views and forms enable users to manage assets effectively.
* **CSV Import/Export:**  Assets can be uploaded and downloaded in CSV format.

## Technical Implementation

The project utilizes a modern full-stack architecture with the following key components:

* **Backend (API):**
    * **Express.js:**  Provides the core API framework.
    * **Authentication & Authorization:**  Secure user authentication and role-based authorization using policies.
    * **Modular Route Structure:**  Organized with API route classes for each resource, incorporating controllers, services, and middleware.
    * **Route Loader:** Streamlined route loading mechanism.
    * **Sequelize ORM:**  Manages database interactions.
    * **Environment-Specific DB Config:**  Configuration files for different environments (development, testing, production).
    * **Database Migrations:**  Version control for database schema changes.
* **Frontend:**
    * Located in the `public` directory. Implemented with vanilla/plain HTML/JS/CSS.


## Getting Started

### Prerequisites

* Node.js and npm installed.
* PostgreSQL installed and configured.

### Installation

1. Clone the repository:
 ```
  bash
  git clone https://github.com/ese-varo/fullstack-express-assets-tracker.git
 ```

2. Install dependencies:
  ```
cd assets-tracker-expressjs
npm install
```
3. Configure the database
    * Create a `.env` file in the root directory and add your database credentials. See `.env.example` for a template.
    * Run database migrations:
    ```
    npm run db:migrate
    ```
4. Start the development server:
  ```
  npm run dev
  ```
### Usage
1. Access the application in your browser at http://localhost:3000 or the port you've configured.
2. Register a new admin account (PENDING implementing an initial admin creation mechanism or seed the database with an admin user).
3. Log in as the admin and invite asset manager users.
4. Manage assets using the provided functionalities.
