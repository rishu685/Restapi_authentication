// MongoDB initialization script for Docker
db = db.getSiblingDB('scalable-rest-api');

// Create admin user for the application
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'scalable-rest-api'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "createdBy": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "priority": 1 });
db.tasks.createIndex({ "category": 1 });
db.tasks.createIndex({ "dueDate": 1 });
db.tasks.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "isArchived": 1 });

// Compound indexes
db.tasks.createIndex({ "assignedTo": 1, "status": 1 });
db.tasks.createIndex({ "createdBy": 1, "createdAt": -1 });
db.tasks.createIndex({ "status": 1, "priority": 1 });

// Create sample admin user (for demo purposes)
// Password: Admin123! (hashed)
db.users.insertOne({
  "username": "admin",
  "email": "admin@example.com",
  "password": "$2a$12$8VvQB7d9qJr8oW9xQ9.CKO8vXG0nY7jqE5nKa1L2vXm9Z3pW4qR1m",
  "role": "admin",
  "isActive": true,
  "profile": {
    "firstName": "Admin",
    "lastName": "User"
  },
  "createdAt": new Date(),
  "updatedAt": new Date(),
  "passwordChangedAt": new Date()
});

// Create sample regular user (for demo purposes)
// Password: User123! (hashed)
db.users.insertOne({
  "username": "user",
  "email": "user@example.com",
  "password": "$2a$12$8VvQB7d9qJr8oW9xQ9.CKO8vXG0nY7jqE5nKa1L2vXm9Z3pW4qR1m",
  "role": "user",
  "isActive": true,
  "profile": {
    "firstName": "Demo",
    "lastName": "User"
  },
  "createdAt": new Date(),
  "updatedAt": new Date(),
  "passwordChangedAt": new Date()
});

print('Database initialized successfully!');
print('Demo users created:');
print('Admin: admin@example.com / Admin123!');
print('User: user@example.com / User123!');