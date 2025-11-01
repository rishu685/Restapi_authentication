#!/bin/bash

# Demo Account Creation Script
# Replace YOUR_BACKEND_URL with your actual Render URL

BACKEND_URL="https://your-backend-url.onrender.com"

echo "Creating demo accounts..."

# Create Admin Account
echo "Creating admin account..."
curl -X POST $BACKEND_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com", 
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'

echo -e "\n\nCreating user account..."
# Create User Account  
curl -X POST $BACKEND_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user",
    "email": "user@example.com",
    "password": "User123!", 
    "firstName": "Demo",
    "lastName": "User"
  }'

echo -e "\n\nDemo accounts created successfully!"
echo "Admin: admin@example.com / Admin123!"
echo "User: user@example.com / User123!"