# Eco-Tracker Backend

A Node.js backend application for tracking carbon footprints from daily activities. Users can log in, record activities (electricity usage, vehicle travel, gas consumption), and view their carbon impact.

## Features

- User authentication (login)
- Activity tracking (electricity, vehicle, gas)
- Carbon footprint calculation
- MySQL database integration
- RESTful API endpoints
- Static file serving for frontend

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Dependencies**: mysql2, cors, dotenv, express
- **Frontend**: HTML, CSS, JavaScript (served statically)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhiprep24-lab/eco-tracker-backend.git
   cd eco-tracker-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   - Create a MySQL database named `eco_tracker_db`
   - Update the database credentials in `.env` file (create if not exists):
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=eco_tracker_db
     ```

4. **Create database tables:**
   Run the following SQL commands in your MySQL client:
   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE tracker (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     activity_type VARCHAR(255) NOT NULL,
     carbon_value DECIMAL(10,2) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

### Running the Application

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Access the application:**
   - Open your browser and go to `http://localhost:3000/login.html`
   - Login with existing credentials or register a new user

## API Endpoints

### Authentication
- `POST /api/users/login` - User login

### Tracker
- `POST /api/tracker` - Add new activity
- `GET /api/tracker/:userId` - Get user's activities

## Project Structure

```
eco-tracker-backend/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── src/
│   ├── config/
│   │   └── database.js      # Database connection
│   ├── controllers/
│   │   ├── userController.js    # User authentication logic
│   │   └── trackerController.js # Activity tracking logic
│   ├── models/
│   │   ├── User.js          # User model
│   │   └── Tracker.js       # Tracker model
│   ├── routes/
│   │   ├── users.js         # User routes
│   │   └── tracker.js       # Tracker routes
│   └── services/
│       └── carbonService.js # Carbon calculation service
├── public/
│   ├── login.html           # Login page
│   └── dashboard.html       # Dashboard page
└── .env                     # Environment variables (not committed)
```

## Carbon Calculation

The application uses fixed emission factors:
- Electricity: 0.82 kg CO₂ per kWh
- Vehicle: 0.21 kg CO₂ per km
- Gas: 2.3 kg CO₂ per cubic meter

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Future Enhancements

- User registration functionality
- Password hashing and JWT authentication
- Data visualization charts
- Mobile app integration
- Real-time carbon tracking
- Community features and leaderboards