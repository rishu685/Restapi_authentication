<!-- Open this file in VS Code and replace YOUR_BACKEND_URL with your actual Render URL -->

# Demo Account Creation

After your backend is deployed, use these curl commands to create demo accounts:

## Replace YOUR_BACKEND_URL with your actual Render URL
```bash
# Example: https://task-manager-backend-abc123.onrender.com
BACKEND_URL="YOUR_BACKEND_URL"
```

## Create Admin Account
```bash
curl -X POST $BACKEND_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com", 
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

## Create User Account
```bash
curl -X POST $BACKEND_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user",
    "email": "user@example.com",
    "password": "User123!", 
    "firstName": "Demo",
    "lastName": "User"
  }'
```

## Or use the API Documentation
1. Go to: `YOUR_BACKEND_URL/api/v1/docs`
2. Use the interactive Swagger UI
3. Register accounts using the `/auth/register` endpoint

## Test Accounts
- **Admin**: admin@example.com / Admin123!
- **User**: user@example.com / User123!