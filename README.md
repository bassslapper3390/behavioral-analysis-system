# Behavioral Analysis System

A comprehensive system for monitoring and analyzing user behavior patterns.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a MySQL database named `behavioral_analysis`
   - Copy `.env.example` to `.env` and update the database configuration:
     ```
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=behavioral_analysis
     DB_PORT=3306
     ```
   - Run the database initialization script:
     ```bash
     npm run init-db
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- User behavior monitoring
- Anomaly detection
- Hospital management system
- Audit logging
- Real-time statistics

## API Routes

- `/api/auth/login` - User authentication
- `/api/monitor` - Behavior monitoring
- `/api/hospital/*` - Hospital management endpoints
  - `/api/hospital/doctors` - Doctor management
  - `/api/hospital/patients` - Patient management
  - `/api/hospital/appointments` - Appointment scheduling
  - `/api/hospital/medical-records` - Medical records
  - `/api/hospital/wards` - Ward management
  - `/api/hospital/admissions` - Patient admissions
  - `/api/hospital/audit-logs` - System audit logs
  - `/api/hospital/stats` - Hospital statistics

## Database Schema

The system uses the following main tables:
- `users` - User accounts
- `behavioral_profiles` - User behavior patterns
- `anomalies` - Detected anomalies
- `audit_logs` - System audit trail
- `doctors` - Doctor information
- `patients` - Patient records
- `appointments` - Appointment scheduling
- `medical_records` - Medical history
- `wards` - Hospital wards
- `admissions` - Patient admissions

## Development

- The system uses Next.js for the frontend and API routes
- MySQL is used for data storage
- TypeScript is used for type safety
- Environment variables are used for configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
