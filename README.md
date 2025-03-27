# Algoz Trading Platform

A professional trading platform built with Next.js, JavaScript, Tailwind CSS, and Supabase.

## Features

- **Multiple Broker Integrations**: Connect with various trading platforms (Fyers, Dhan, etc.)
- **Real-time Data**: Live market data and charts
- **Trading Tools**: Scalping tools, option trading utilities, and more
- **User Authentication**: Secure login and account management
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14, React 18, JavaScript
- **Styling**: Tailwind CSS, Geist UI components
- **State Management**: React Context & Hooks
- **Database & Auth**: Supabase
- **Deployment**: Docker/Kubernetes ready

## Project Structure

```
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── layout.js     # Root layout
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components
│   │   ├── layout/       # Layout components (header, footer)
│   │   ├── features/     # Feature components
│   │   │   ├── home/     # Home page components
│   │   │   └── trading/  # Trading feature components
│   │   └── auth/         # Auth components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library code
│   │   ├── api/          # API client code
│   │   ├── auth/         # Authentication utilities
│   │   ├── config/       # Configuration
│   │   ├── scripts/      # Build scripts
│   │   ├── services/     # Services (Supabase, etc.)
│   │   └── utils/        # Utility functions
│   ├── middleware.js     # Next.js middleware
│   └── styles/           # Global styles
├── .env.example          # Example environment variables
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies and scripts
└── tailwind.config.js    # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/algoz-app.git
   cd algoz-app
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env.local
   ```
   Edit `.env.local` with your own values.

4. Start the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)
- `NEXT_PUBLIC_APP_URL`: Your app's URL (defaults to http://localhost:3000)

## Deployment

### Production Build

```
npm run build
npm start
```

### Docker Deployment

```
docker build -t algoz-app .
docker run -p 3000:3000 algoz-app
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
