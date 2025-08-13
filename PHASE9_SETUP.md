# Phase 9: Email & Notification System - Setup Instructions

## 🚀 Overview

Phase 9 implements a comprehensive email and notification system for the Shohanis Reflection e-commerce application, including automated emails for order updates, payment confirmations, and in-app notifications.

## 📋 Prerequisites

- Laravel 11 backend running
- Next.js 14 frontend running
- MySQL database configured
- SMTP service configured (Gmail, Mailgun, SendGrid, etc.)
- Queue system configured (Redis, Database, or Sync)

## 🔧 Backend Setup

### 1. Environment Configuration

Add the following to your `.env` file:

```env
# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@shohanis-reflection.com
MAIL_FROM_NAME="Shohanis Reflection"

# Queue Configuration (for email processing)
QUEUE_CONNECTION=database
QUEUE_DRIVER=database

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Admin Emails for Notifications
ADMIN_EMAILS=admin@shohanis-reflection.com,support@shohanis-reflection.com
```

### 2. Database Migration

Run the notifications table migration:

```bash
cd backend
php artisan migrate
```

### 3. Queue Setup

Create the jobs table for email queuing:

```bash
php artisan queue:table
php artisan migrate
```

### 4. Queue Worker

Start the queue worker to process emails:

```bash
# In a separate terminal
php artisan queue:work

# Or for production with supervisor
php artisan queue:work --daemon
```

## 🎯 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 📧 Email Templates

### Available Email Templates

1. **Order Management**
   - `emails.orders.confirmation` - Order confirmation
   - `emails.orders.shipped` - Order shipped notification
   - `emails.orders.delivered` - Order delivered notification
   - `emails.orders.cancelled` - Order cancellation

2. **Payment Management**
   - `emails.payments.success` - Payment success
   - `emails.payments.failed` - Payment failure

3. **Authentication**
   - `emails.auth.welcome` - Welcome email for new users
   - `emails.auth.password_reset` - Password reset request

4. **Marketing**
   - `emails.marketing.newsletter` - Newsletter
   - `emails.marketing.abandoned_cart` - Abandoned cart reminder

5. **Admin**
   - `emails.admin.low_stock_alert` - Low stock notifications

## 🔔 Notification System

### Notification Types

- **Order Updates**: Order status changes, shipping updates
- **Payment**: Payment confirmations, failures, refunds
- **Promotions**: Special offers, discounts, abandoned cart
- **System**: Welcome messages, account updates
- **Products**: Stock alerts, new arrivals

### Notification Priorities

- **Low (1)**: General updates
- **Normal (2)**: Standard notifications
- **High (3)**: Important updates
- **Urgent (4)**: Critical alerts

## 🧪 Testing

### 1. Test Email Sending

```bash
cd backend
php artisan tinker

# Test welcome email
$user = App\Models\User::first();
Mail::to($user->email)->send(new App\Mail\WelcomeEmail($user));
```

### 2. Test Notifications

```bash
# Create test notification
$user = App\Models\User::first();
$notification = App\Models\Notification::create([
    'user_id' => $user->id,
    'type' => 'system',
    'title' => 'Test Notification',
    'message' => 'This is a test notification',
    'priority' => 2
]);
```

### 3. Test Queue Processing

```bash
# Start queue worker
php artisan queue:work

# In another terminal, trigger email
php artisan tinker
$user = App\Models\User::first();
Mail::to($user->email)->queue(new App\Mail\WelcomeEmail($user));
```

## 🔄 Integration Points

### 1. Order Status Changes

The system automatically sends emails and creates notifications when:

- Order is confirmed
- Order is shipped
- Order is delivered
- Order is cancelled

### 2. Payment Processing

Automated emails for:

- Payment success
- Payment failure
- Refund processing

### 3. User Registration

- Welcome email
- Welcome notification

### 4. Abandoned Cart

- Automated reminders after 24 hours
- Promotional notifications

## 📱 Frontend Integration

### 1. Notification Bell Component

The `NotificationBell` component displays:
- Unread notification count
- Recent notifications
- Mark as read functionality

### 2. Notification Store

Zustand store manages:
- Notification state
- Mark as read actions
- Real-time updates

### 3. Email Preferences

Users can manage:
- Email frequency
- Notification types
- Unsubscribe options

## 🚨 Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Check SMTP configuration
   - Verify queue worker is running
   - Check Laravel logs

2. **Notifications Not Appearing**
   - Verify database connection
   - Check notification model relationships
   - Verify user authentication

3. **Queue Not Processing**
   - Check queue configuration
   - Verify jobs table exists
   - Check queue worker status

### Debug Commands

```bash
# Check queue status
php artisan queue:failed

# Clear failed jobs
php artisan queue:flush

# Check mail configuration
php artisan config:show mail

# Test mail connection
php artisan tinker
Mail::raw('Test email', function($message) { $message->to('test@example.com')->subject('Test'); });
```

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use app passwords for Gmail SMTP
- Implement rate limiting for email sending
- Validate all email addresses
- Use HTTPS in production

## 📚 Next Steps

After completing Phase 9, you can proceed to:

1. **Phase 10**: Performance & Optimization
2. **Phase 11**: SEO & Analytics
3. **Phase 12**: Inventory Management
4. **Phase 13**: Customer Support

## 🎉 Success Indicators

Phase 9 is complete when:

- ✅ All email templates are created and styled
- ✅ Mailable classes are implemented
- ✅ Email service is functional
- ✅ Notification system is working
- ✅ Queue system processes emails
- ✅ Frontend notification components work
- ✅ Email preferences are configurable
- ✅ Automated emails trigger correctly
- ✅ Admin notifications are sent
- ✅ Email testing is successful

## 🆘 Support

If you encounter issues:

1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify SMTP configuration
3. Check queue worker status
4. Test email sending manually
5. Verify database migrations

---

**Happy coding! 🎉**
