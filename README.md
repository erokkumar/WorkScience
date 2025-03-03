# Employee Attendance System
![Employee Attendance](https://drive.google.com/uc?export=view&id=1zklWVe7FR35XInP0AKP-FjVyReOJZsgz)

![Login Page](https://drive.google.com/uc?export=view&id=101awH6T9DdcBjy6awJg_0G3m3imSywd7)


## Overview
The **Employee Attendance System** is designed for **Work Science** company to efficiently track employee attendance, work hours, and login/logout times. It provides a secure and user-friendly platform for managing workforce attendance records.

## Features
- ✅ Employee Login/Logout System
- ✅ User Authentication & Role-Based Access
- ✅ Real-time Attendance Tracking
- ✅ Admin Dashboard for HR Management
- ✅ Database Integration with MySQL & MongoDB
- ✅ Secure API with Authentication

## Tech Stack
- **Backend**: Spring Boot (Java) & Node.js
- **Database**: MySQL & MongoDB
- **Frontend**: (Specify the framework if applicable)
- **Authentication**: JWT (JSON Web Token)

## Installation & Setup
### Clone the Repository
```sh
git clone https://github.com/your-repo-url.git
cd employee-attendance-system
```

### Backend Setup
- Install dependencies:
```sh
cd backend
mvn clean install  # For Spring Boot  
npm install        # For Node.js  
```
- Configure `.env` or `application.properties` with database credentials.

### Start the Server
```sh
mvn spring-boot:run  # For Spring Boot  
node server.js       # For Node.js  
```

### Frontend Setup (If Applicable)
```sh
cd frontend
npm install
npm start
```

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/login` | Employee Login |
| GET | `/attendance` | Fetch Attendance Records |
| POST | `/logout` | Employee Logout |

## Contributors
👨‍💻 **Rohit Kumar** – Developer  
📧 **rokkumar77@gmail.com**

## License
This project is licensed under the [MIT License](LICENSE).

