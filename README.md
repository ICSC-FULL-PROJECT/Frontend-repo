# ICSC 2026 Conference Registration System

## Overview
This is the registration and dashboard system for the International Civil Service Conference 2026.

## System Architecture

### Registration Flow
1. **Main Registration Page** (`register.html`) - Select registrant type
2. **Specific Registration Pages** - Based on selected type
3. **Dashboard Pages** - After successful registration

### Registrant Types
- **Attendee** → `register-attendee.html` → `attendee-dash.html`
- **Speaker** → `register-speaker.html` → `speaker-dash.html`
- **Partner** → `register-partner.html` → Depends on package:
  - Bronze Partner → `exhibitors-dash.html`
  - Silver/Gold/Platinum → `partner-dash.html`

### Package Management
- Partners can select from 4 packages (Bronze, Silver, Gold, Platinum)
- Packages are dynamically loaded from admin configuration
- Package benefits and pricing sync with admin dashboard updates

## Key Features
- Multi-step registration forms with progress indicators
- Dynamic package selection with real-time availability
- Auto-refresh of package data (every 10 seconds)
- File upload support (logos, payment receipts)
- Multiple payment methods (Bank Transfer, Flutterwave)
- Responsive design for all devices

## File Structure
├── index.html # Landing page
├── register.html # Registration type selection
├── register-partner.html # Partner registration
├── register-attendee.html # Attendee registration
├── register-speaker.html # Speaker registration
├── partners-dash.html # Partner dashboard
├── exhibitors-dash.html # Exhibitor dashboard
├── attendee-dash.html # Attendee dashboard
├── speaker-dash.html # Speaker dashboard
├── super-admin-dash.html # Admin dashboard
├── README.md # This file
├── CHANGELOG.md # Change history
└── js/
├── apiClient.js # API communication
└── auth.js # Authentication utilities


## Setup Instructions

GET /packages/event-partner-packages
GET /packages/check-availability/{id}
POST /auth/event-partner-register
POST /misc/upload-image
POST /payments/initialize-event-partner-payment
POST /payments/update-payment-status

### Prerequisites
- Modern web browser
- Web server (for local development)

### Development Setup
1. Clone the repository
2. Open `index.html` in a browser
3. For API integration, configure endpoints in `js/apiClient.js`

### Backend API Endpoints Required


## Development Notes

### Current Status
- Frontend is complete and fully functional
- Using mock API client for development
- Backend integration pending
- All forms validated and tested

### Mock Mode
When backend endpoints are not available, the system uses a mock API client that:
- Returns sample package data
- Simulates network delays
- Provides demo registration flow
- Logs all API calls to console

## Testing
- Test all registration flows (Attendee, Speaker, Partner)
- Test package selection and availability
- Test file uploads
- Test payment method selection
- Test dashboard redirects based on package type

## Contact
For questions or support, contact: [Your Contact Information]

// API Endpoints needed:
GET /api/package-configurations      // Load current config
POST /api/package-configurations/save // Save config
GET /api/package-stats               // Get current utilization
POST /api/notify-partners           // Push updates to partners