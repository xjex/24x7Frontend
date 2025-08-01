# 24x7 Demo for Dental Scheduling System

A comprehensive dental office management system built with modern web technologies. This full-stack application provides appointment scheduling, patient management, and administrative tools for dental practices.

## 🏗️ Project Structure

This is a monorepo containing:
- **Backend**: Node.js/Express.js API with TypeScript
- **Frontend**: Next.js 15 application with TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd 24x7
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🗄️ Backend Architecture

### Tech Stack
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Email**: Nodemailer
- **Logging**: Winston


### Database Schema & Design

#### Core Models

**User Model** (`/models/User.ts`)
```typescript
interface IUser {
  name: string
  email: string
  password: string
  role: 'patient' | 'dentist' | 'admin'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Patient Model** (`/models/Patient.ts`)
```typescript
interface IPatient {
  userId: ObjectId  // Reference to User
  profile: {
    phone: string
    birthdate: Date
    gender: string
    address: string
    emergencyContact: object
    medicalHistory: object[]
  }
}
```

**Dentist Model** (`/models/Dentist.ts`)
```typescript
interface IDentist {
  userId: ObjectId  // Reference to User
  profile: {
    licenseNumber: string
    specialization: string[]
    experience: number
    consultationFee: number
    bio: string
    education: object[]
    schedule: object
  }
}
```

**Appointment Model** (`/models/Appointment.ts`)
```typescript
interface IAppointment {
  patientId: ObjectId
  dentistId: ObjectId
  serviceId?: ObjectId
  date: string
  time: string
  duration: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  notes: string
}
```

**Service Model** (`/models/Service.ts`)
```typescript
interface IService {
  name: string
  description: string
  category: string
  defaultDuration: number
  defaultPrice: number
  isActive: boolean
}
```

**Treatment Model** (`/models/Treatment.ts`)
```typescript
interface ITreatment {
  appointmentId: ObjectId
  diagnosis: string
  treatmentPlan: string
  notes: string
  cost: number
  status: string
}
```

### Authentication & Authorization

- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Patient, Dentist, Admin)
- **Password encryption** using bcryptjs
- **Passport.js strategies** for local and JWT authentication
- **Rate limiting** to prevent abuse
- **Session management** with secure cookie handling

### API Structure

**Routes** (`/routes/`)
```
├── auth.ts          # Authentication endpoints
├── users.ts         # User management
├── patients.ts      # Patient-specific operations
├── dentists.ts      # Dentist-specific operations
├── admin.ts         # Admin panel operations
├── appointments.ts  # Appointment management
└── public.ts        # Public endpoints
```

**Controllers** (`/controllers/`)
```
├── auth.ts          # Login, register, logout, token refresh
├── patient.ts       # Patient dashboard, appointments, profile
├── dentist.ts       # Dentist schedule, patients, services
├── admin.ts         # User management, system settings
└── service.ts       # Service CRUD operations
```

### Key Features

**For Patients:**
- User registration and authentication
- Appointment booking with dentist selection
- View appointment history and upcoming visits
- Profile management with medical history


**For Dentists:**
- Dentist dashboard with schedule overview
- Patient management 
- Appointment scheduling and management
- Availability calendar management

**For Administrators:**
- User management (patients, dentists, admins)
- Service catalog management
- System-wide appointment oversight
- Dentist Creation


### Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Request rate limiting
- CORS configuration
- Input validation and sanitization
- Error handling middleware
- Helmet.js security headers

## 🖥️ Frontend Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Theming**: next-themes (dark/light mode)

### Project Structure

```
frontend/src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Patient dashboard
│   │   ├── appointments/
│   │   ├── book/
│   │   └── profile/
│   ├── dentist/           # Dentist portal
│   │   ├── appointments/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── profile/
│   │   ├── schedule/
│   │   └── services/
│   ├── admin/             # Admin panel
│   │   ├── dentists/
│   │   ├── patients/
│   │   ├── services/
│   │   └── users/
│   ├── book/              # Public booking
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── shared/           # Shared business components
│   └── [feature-specific-components]
├── stores/               # Zustand state management
│   ├── authStore.ts      # Authentication state
│   ├── patientStore.ts   # Patient data and operations
│   ├── dentistStore.ts   # Dentist data and operations
│   ├── adminStore.ts     # Admin operations
│   └── serviceStore.ts   # Services management
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configs
└── types/                # TypeScript type definitions
```

### State Management with Zustand

**Authentication Store** (`/stores/authStore.ts`)
- User authentication state
- Login/logout functionality
- Token management
- Role-based access control

**Patient Store** (`/stores/patientStore.ts`)
- Patient profile management
- Appointment booking and history
- Dentist and service fetching
- Calendar availability

**Dentist Store** (`/stores/dentistStore.ts`)
- Dentist schedule management
- Patient management
- Service assignments
- Appointment creation

**Admin Store** (`/stores/adminStore.ts`)
- User management (CRUD operations)
- System-wide appointments
- Dentist approval workflows
- Analytics and reporting

### Key Features & Pages

**Authentication System**
- Multi-step registration with validation
- Secure login with JWT tokens
- Role-based route protection
- Password reset functionality

**Patient Experience**
- Intuitive appointment booking flow
- Real-time dentist availability
- Interactive calendar interface
- Appointment history and management
- Profile and medical history updates

**Dentist Portal**
- Comprehensive schedule management
- Patient management dashboard
- Appointment creation and updates
- Service customization
- Availability setting

**Admin Panel**
- User management interface
- Service catalog administration
- System-wide appointment oversight
- Dentist verification and approval
- Analytics dashboard

### UI/UX Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: System preference with manual override
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages and fallbacks
- **Form Validation**: Real-time validation with helpful error messages

### Component Architecture

**Base Components** (`/components/ui/`)
- Built on Radix UI primitives
- Consistent design system
- Accessible by default
- Theme-aware styling

**Business Components**
- Feature-specific components
- Reusable across different pages
- Encapsulated logic and state
- Prop-driven customization

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run seed         # Seed database with sample data
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
```

### Environment Variables

**Backend** (`.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dentalcare
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.provider
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=test
SMTP_FROM=test@email.com
```

**Frontend** (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🚀 Deployment

### Docker Support
Both frontend and backend include Dockerfiles for containerized deployment.

```bash
# Backend
cd backend
docker build -t dentalcare-backend .
docker run -p 5000:5000 dentalcare-backend

# Frontend
cd frontend
docker build -t dentalcare-frontend .
docker run -p 3000:3000 dentalcare-frontend
```

### Production Considerations
- Environment-specific configuration
- Database clustering and backup
- Load balancing
- SSL certificate setup
- Monitoring and logging
- Error tracking

## 📝 API Documentation

The backend provides RESTful APIs with the following main endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/dentists` - List dentists
- `GET /api/services` - List services
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile


