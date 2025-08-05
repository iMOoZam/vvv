# Railway Database Setup Guide

## Step 1: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free tier)
4. Wait for cluster to be created

## Step 2: Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 3: Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 4: Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `techshop`

## Step 5: Set Railway Environment Variables

1. Go to your Railway dashboard
2. Select your project
3. Go to "Variables" tab
4. Add these variables:

```
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/techshop
JWT_SECRET=your-very-secure-random-string-here
```

## Step 6: Redeploy

1. Railway will automatically redeploy when you add environment variables
2. Check the logs to see if the database connection is successful

## Troubleshooting

- If you see "MongoDB connection error" in logs, check your connection string
- Make sure your MongoDB Atlas cluster is running
- Verify your username/password are correct
- Check that network access allows connections from anywhere
