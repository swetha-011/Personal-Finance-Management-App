# Personal Finance Management App

A comprehensive digital finance assistant designed to help individuals and households track income, categorize and monitor expenses, set savings targets, and generate visual financial reports. It promotes financial literacy and enables better money management for users.

## 🚀 Features

### Core Functionality
- **Budget Planning**: Create and manage budgets for different categories with customizable periods
- **Expense Tracking**: Track income and expenses with detailed categorization and tagging
- **Savings Goals**: Set, track, and manage savings targets with progress visualization
- **Financial Reports**: Generate comprehensive financial analytics and visual reports

### Key Features
- **User Authentication**: Secure JWT-based authentication system
- **Real-time Dashboard**: Overview of financial health with key metrics
- **Category Management**: Predefined categories for income and expenses
- **Progress Tracking**: Visual progress bars for savings goals
- **Date Range Filtering**: Filter reports by week, month, quarter, or year
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React.js** - Frontend framework
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Router** - Navigation

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/swetha-011/Personal-Finance-Management-App.git
cd Personal-Finance-Management-App
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following variables:
```env
MONGO_URI=mongodb+srv://swethadonthi:5mU4mYRVGNuKSp2c@cluster0.lp7otm9.mongodb.net/personal-finance-management-app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=73RVFkY/xM0J/o7keLdIYmajCjjXY8pXZnopebJwpew=
PORT=5001
```

Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5001`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Start the frontend application:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📱 Usage

### Getting Started
1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or login with existing credentials
3. Start by adding your first transaction or creating a budget

### Dashboard
- View financial overview with income, expenses, and net amount
- See recent transactions and category breakdown
- Quick access to all main features

### Transactions
- Add income and expense transactions
- Categorize transactions with predefined categories
- Add tags for better organization
- Edit or delete existing transactions

### Budgets
- Create budgets for different categories
- Set budget periods (weekly, monthly, yearly)
- Track budget status (active/inactive)
- Monitor budget vs actual spending

### Savings Goals
- Set savings targets with target dates
- Track progress with visual progress bars
- Add amounts to goals as you save
- Set priority levels for goals

### Reports
- View comprehensive financial analytics
- Filter by date range and categories
- See monthly trends and top transactions
- Monitor budget and savings summaries

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/stats` - Get transaction statistics

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/stats` - Get budget statistics

### Savings Goals
- `GET /api/savings-goals` - Get all savings goals
- `POST /api/savings-goals` - Create new savings goal
- `PUT /api/savings-goals/:id` - Update savings goal
- `DELETE /api/savings-goals/:id` - Delete savings goal
- `PUT /api/savings-goals/:id/add-amount` - Add amount to goal
- `GET /api/savings-goals/stats` - Get savings goals statistics

## 📊 Database Schema

### User
- name, email, password, university, address

### Transaction
- user, type (income/expense), category, amount, description, date, tags

### Budget
- user, name, category, amount, period, startDate, endDate, isActive, description

### SavingsGoal
- user, name, targetAmount, currentAmount, targetDate, description, priority, category, isActive

## 🎨 UI Components

The application uses a modern, responsive design with:
- Clean and intuitive navigation
- Color-coded financial data (green for income, red for expenses)
- Progress bars for savings goals
- Card-based layouts for better organization
- Mobile-responsive design

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- User-specific data isolation
- Input validation and sanitization

## 🚀 Deployment

The application is deployed using GitHub Actions CI/CD pipeline:

- **Backend:** AWS EC2 Instance (Self-hosted runner) ✅ **ACTIVE**
- **Frontend:** AWS S3 + CloudFront (Static hosting)
- **Database:** MongoDB Atlas (Cloud database)

### CI/CD Status
- ✅ GitHub Self-hosted Runner: **ACTIVE** on EC2
- ✅ Automated Testing: Backend & Frontend
- ✅ Automated Deployment: On push to main branch
- 🔄 Next: Configure Nginx for frontend serving

### Backend Deployment (AWS EC2)
1. Set up an EC2 instance
2. Install Node.js and MongoDB
3. Clone the repository
4. Configure environment variables
5. Use PM2 for process management

### Frontend Deployment
1. Build the React application: `npm run build`
2. Deploy to AWS S3, Netlify, or Vercel
3. Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Swetha Donthi** - Initial work

## 🙏 Acknowledgments

- React.js community
- Tailwind CSS team
- MongoDB documentation
- Express.js framework

## 📞 Support

For support and questions, please contact:
- Email: [Your Email]
- GitHub Issues: [Repository Issues Page]

---

**Note**: This application is designed for educational purposes and personal use. For production deployment, ensure proper security measures and data backup strategies are implemented.
