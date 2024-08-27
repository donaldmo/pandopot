Here’s the complete README file for your project, including updated instructions on generating and updating the `.env` file:

---

# Pandopot API

Pandopot is a web application marketplace for plants and nature enthusiasts. It allows users to register, sell plants or seeds, manage orders, and upload products. Buyers can browse and purchase plants or seeds according to their preferences.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Pandopot provides a marketplace for users to engage in buying and selling plants and related products. Users can create accounts, list their products, and manage their orders through this API.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/donaldmo/pandopot-api.git
   cd pandopot-api
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

## Environment Configuration

### Generating the `.env` File

To create the `.env` file with required configuration values, follow these steps:

1. **Run the Script to Generate Secrets**

   Use the `generate_keys.js` script to create a `.env` file with dynamically generated secrets. Execute the following command:

   ```bash
   node helpers/generate_keys.js
   ```

   This script will generate the necessary secret keys and create a `.env` file with placeholders for other configuration values.

2. **Update the `.env` File**

   Open the generated `.env` file and review its contents. You will find placeholders for various configuration parameters. Update these placeholders with your actual values. Specifically, ensure to provide values for:

   - `DB_USERNAME_PRO` - Database username for production
   - `DB_NAME_PROD` - Database name for production
   - `DB_PASS_PROD` - Database password for production
   - `SESSION_NAME` - Session cookie name
   - `EMAIL_USERNAME` - Email address used for sending emails
   - `EMAIL_PASSWORD` - Email account password
   - `EMAIL_HOST` - Email provider’s host (e.g., Gmail)

   Refer to your specific environment needs and replace the placeholders accordingly. The `.env` file will also contain the generated secret keys and placeholders for token expiration times and other configurations.

3. **Save and Secure the `.env` File**

   Make sure to save the `.env` file after updating it with your actual values. Keep this file secure and do not share it publicly, as it contains sensitive information.

## Usage

1. **Start the Server**

   ```bash
   npm start
   ```

   The server will run on port `4000` by default, or the port specified in your environment configuration.

2. **Testing the API**

   You can test the API endpoints using tools like Postman or directly through the Swagger UI available at `/api-docs`.

## API Documentation

All API endpoints and their usage are documented using Swagger. You can access the Swagger UI at:

- [Swagger Documentation](http://localhost:4000/api-docs)

## Contributing

Contributions are welcome! If you have suggestions or improvements, please submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to adjust any details according to your project's specifics.