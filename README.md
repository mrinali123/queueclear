# QueueClear

AI agents resolve e-commerce support tickets safely, so sellers only handle what truly needs them.

## Tech stack

- React with Vite for the client
- Node.js and Express for the server
- MongoDB Atlas for the database
- JavaScript throughout the project

## Setup

1. Clone the repository, replacing the placeholders with your GitHub repository URL and folder name:

   ```powershell
   git clone YOUR_REPOSITORY_URL
   cd YOUR_REPOSITORY_FOLDER
   ```

2. Install the server dependencies:

   ```powershell
   cd server
   npm install
   cd ..
   ```

3. Create the server environment file and add your MongoDB Atlas connection string to `server/.env`:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

   Replace the empty `MONGODB_URI` value in `server/.env` with your connection string. Keep this file private; it is ignored by Git.

4. Install the client dependencies:

   ```powershell
   cd client
   npm install
   cd ..
   ```

## Run the app

Run these commands in two separate PowerShell terminals from the project folder.

Terminal 1, start the server after setting a valid MongoDB URI:

```powershell
cd server
npm run dev
```

Terminal 2, start the client:

```powershell
cd client
npm run dev
```

Open the local URL printed by Vite in the client terminal.