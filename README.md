## How to Set Up and Run the Consulting Test with THREE.JS

Follow these instructions to set up and run the code:

### Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (comes with Node.js installation)

---

### Steps to Run the Code

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

### Additional Notes

- Make sure all dependencies are correctly installed before starting the server.
- If you encounter any issues, check the `vite.config.js` file for misconfigurations or consult the Vite documentation.

By following these steps, you can successfully set up and run the THREE.JS consulting test.