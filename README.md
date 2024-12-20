## How to Set Up and Run the Consulting Test with THREE.JS

Follow these instructions to set up and run the code:

### Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (comes with Node.js installation)

---

### Steps to Run the Code

#### Method 1: Run Locally with Development Server

1. **Install Dependencies**
   Open a terminal and run:
   ```bash
   npm install
   ```

2. **Install Required Packages**
   Install `vite` and `three` by running:
   ```bash
   npm install vite
   npm install three
   ```

3. **Configure Vite**
   Open the `vite.config.js` file and make any necessary configuration changes. This file contains settings related to the development server, build options, and other Vite configurations.

4. **Build the Project**
   Build the project for production:
   ```bash
   npm run build
   ```

5. **Start the Development Server**
   Start the development server to run the application locally:
   ```bash
   npm run dev
   ```

6. **Access the Application**
   Once the server starts, open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

#### Method 2: Deploy Pre-Built `dist.zip` on a Web Server

1. **Locate the Pre-Built `dist.zip`**
   - The `dist.zip` file is already included in the repository.
   - Extract the contents of `dist.zip` to your desired directory.

2. **Deploy the Extracted `dist` Folder**
   - Upload the extracted `dist` folder to your web server's root directory.

3. **Run the Application**
   - Ensure your web server is running.
   - Open your browser and navigate to your server's URL (e.g., `http://your-server-address`).

   The application will run automatically from the deployed `dist` folder.

---

### Additional Notes

- Make sure all dependencies are correctly installed before starting the server for Method 1.
- If you encounter any issues, check the `vite.config.js` file for misconfigurations or consult the Vite documentation.
- For Method 2, ensure your web server supports static file hosting.

By following these steps, you can successfully set up and run the THREE.JS consulting test.