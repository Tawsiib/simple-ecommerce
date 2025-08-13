# Shohanis Reflection - Beauty & Skincare E-commerce

A modern, full-featured beauty and skincare e-commerce web application built with Next.js, Tailwind CSS, Laravel, and MySQL.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Query** - Data fetching and caching

### Backend
- **Laravel 11** - PHP framework
- **MySQL 8.0** - Database
- **Apache** - Web server
- **PHP 8.2+** - Server-side language

## 📁 Project Structure

```
sohanis-reflection/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utilities and helpers
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   └── public/              # Static assets
├── backend/                  # Laravel backend API
│   ├── app/                 # Application logic
│   ├── database/            # Migrations and seeders
│   ├── routes/              # API routes
│   └── config/              # Configuration files
└── docs/                     # Documentation
```

## 🛠️ Features

- **User Authentication** - Login, registration, profile management
- **Product Management** - Categories, products, inventory
- **Shopping Cart** - Add/remove items, quantity management
- **Wishlist** - Save favorite products
- **Order Management** - Checkout, payment, order tracking
- **Admin Panel** - Product management, orders, users
- **Responsive Design** - Mobile-first approach
- **Search & Filtering** - Advanced product search
- **Reviews & Ratings** - Customer feedback system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PHP 8.2+
- Composer
- MySQL 8.0+
- Apache server

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## 📱 Screenshots

*Coming soon*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@shohanis-reflection.com
