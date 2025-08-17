# Al Muraqib Attendance Lookup

A Next.js application for looking up employee attendance records. This application supports multiple languages and provides both table and card views for attendance data.

## Features

- **Multi-language Support**: English, Bangla, Hindi, and Arabic
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dual View Modes**: Table view for desktop, card view for mobile
- **Real-time Data**: Fetches attendance data from Google Apps Script
- **Device Tracking**: Collects device information and IP address
- **Offline Capable**: Can be deployed on IoT devices with no internet access

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd almuraqib-attendance-lookup-nextjs
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   └── proxy/         # Proxy to Google Apps Script
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page component
├── components/             # React components
│   ├── AttendanceForm.tsx # Form for mobile and month selection
│   └── AttendanceResults.tsx # Results display component
├── lib/                    # Utility libraries
│   └── translations.ts    # Multi-language translations
├── types/                  # TypeScript type definitions
│   └── attendance.ts      # Attendance data types
├── tailwind.config.js     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies and scripts
```

## API Endpoints

### `/api/proxy`
Proxies requests to the Google Apps Script backend. Required query parameters:
- `mobile`: Employee mobile number (10 digits, starts with 0)
- `startISO`: Start date in ISO format (YYYY-MM-DD)
- `endISO`: End date in ISO format (YYYY-MM-DD)
- `deviceDetails`: Device information string
- `ipAddress`: User's IP address

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### IoT Device Deployment
For offline deployment on IoT devices:
1. Build the application: `npm run build`
2. Copy the `.next` folder and `public` folder to your device
3. Serve using a static file server

## Technologies Used

- **Next.js 14**: React framework with app router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library
- **Google Apps Script**: Backend data source

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software for Al Muraqib.
