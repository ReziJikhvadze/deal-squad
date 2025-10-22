-- Complete Seed Script for GroupBuy Database (PostgreSQL)
-- Run this script to populate all tables with sample data

-- =============================================
-- 1. USERS
-- =============================================
INSERT INTO public.users ("Id", "Email", "PasswordHash", "FullName", "Role", "PhoneNumber", "ProfileImage", "EmailVerified", "OAuthProvider", "OAuthId", "CreatedAt", "UpdatedAt")
VALUES
-- Admin User
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'admin@groupbuy.com', 
 '$2a$11$hashed_password_here', -- Note: Replace with actual bcrypt hash
 'Admin User',
 'Admin',
 '+995555000000',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
 true,
 NULL,
 NULL,
 NOW() - INTERVAL '180 days',
 NOW()),

-- Regular Users
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'john.doe@example.com',
 '$2a$11$hashed_password_here',
 'John Doe',
 'User',
 '+995555111111',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
 true,
 NULL,
 NULL,
 NOW() - INTERVAL '120 days',
 NOW()),

('cccccccc-cccc-cccc-cccc-cccccccccccc',
 'jane.smith@example.com',
 '$2a$11$hashed_password_here',
 'Jane Smith',
 'User',
 '+995555222222',
 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
 true,
 'Google',
 'google_12345',
 NOW() - INTERVAL '90 days',
 NOW()),

('dddddddd-dddd-dddd-dddd-dddddddddddd',
 'mike.johnson@example.com',
 '$2a$11$hashed_password_here',
 'Mike Johnson',
 'User',
 '+995555333333',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
 true,
 NULL,
 NULL,
 NOW() - INTERVAL '60 days',
 NOW()),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 'sarah.williams@example.com',
 '$2a$11$hashed_password_here',
 'Sarah Williams',
 'User',
 '+995555444444',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
 true,
 NULL,
 NULL,
 NOW() - INTERVAL '45 days',
 NOW()),

('ffffffff-ffff-ffff-ffff-ffffffffffff',
 'david.brown@example.com',
 '$2a$11$hashed_password_here',
 'David Brown',
 'User',
 '+995555555555',
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
 false,
 NULL,
 NULL,
 NOW() - INTERVAL '30 days',
 NOW());

-- =============================================
-- 2. CAMPAIGNS
-- =============================================
INSERT INTO public.campaigns ("Id", "Title", "Description", "Category", "StoreName", "StorePrice", "DiscountPercentage", "FinalPrice", "DepositAmount", "TargetQuantity", "CurrentParticipants", "Status", "StartDate", "EndDate", "ImageUrl", "CreatedBy", "CreatedAt", "UpdatedAt")
VALUES
-- Active Campaigns
('11111111-1111-1111-1111-111111111111',
 'Premium Wireless Headphones',
 'High-quality noise-canceling wireless headphones with 30-hour battery life. Perfect for music lovers and professionals. Features Bluetooth 5.0, premium cushions, and superior sound quality.',
 'Electronics',
 'TechStore Premium',
 299.99,
 33,
 199.99,
 50.00,
 50,
 35,
 'Active',
 NOW() - INTERVAL '5 days',
 NOW() + INTERVAL '25 days',
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 NOW() - INTERVAL '5 days',
 NOW()),

('22222222-2222-2222-2222-222222222222',
 'Smart Home Security Camera Set',
 '4K security camera system with night vision, motion detection, and cloud storage. Secure your home with the latest technology. Includes 4 cameras and central hub.',
 'Electronics',
 'SecureHome',
 449.99,
 33,
 299.99,
 75.00,
 30,
 22,
 'Active',
 NOW() - INTERVAL '3 days',
 NOW() + INTERVAL '27 days',
 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 NOW() - INTERVAL '3 days',
 NOW()),

('33333333-3333-3333-3333-333333333333',
 'Ergonomic Office Chair',
 'Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh. Perfect for home offices and long work sessions.',
 'Furniture',
 'OfficeComfort Pro',
 599.99,
 33,
 399.99,
 100.00,
 40,
 28,
 'Active',
 NOW() - INTERVAL '7 days',
 NOW() + INTERVAL '23 days',
 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 NOW() - INTERVAL '7 days',
 NOW()),

('44444444-4444-4444-4444-444444444444',
 'Electric Standing Desk',
 'Height-adjustable electric standing desk with memory presets. Spacious 60x30 inch desktop surface with cable management system. Promote healthy work habits.',
 'Furniture',
 'WorkSmart Furniture',
 799.99,
 31,
 549.99,
 150.00,
 25,
 18,
 'Active',
 NOW() - INTERVAL '2 days',
 NOW() + INTERVAL '28 days',
 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 NOW() - INTERVAL '2 days',
 NOW()),

('55555555-5555-5555-5555-555555555555',
 '4K Ultra HD Smart TV 55"',
 'Crystal clear 4K display with HDR, smart features, and built-in streaming apps. Transform your entertainment experience with vibrant colors and deep blacks.',
 'Electronics',
 'ElectroMart',
 899.99,
 33,
 599.99,
 150.00,
 35,
 31,
 'Active',
 NOW() - INTERVAL '10 days',
 NOW() + INTERVAL '20 days',
 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
 'cccccccc-cccc-cccc-cccc-cccccccccccc',
 NOW() - INTERVAL '10 days',
 NOW()),

-- Pending Campaign
('66666666-6666-6666-6666-666666666666',
 'Professional Espresso Machine',
 'Barista-quality espresso machine with built-in grinder and milk frother. Cafe-quality coffee at home. Features automatic cleaning and temperature control.',
 'Appliances',
 'CoffeePro',
 1299.99,
 31,
 899.99,
 200.00,
 20,
 0,
 'Pending',
 NOW() + INTERVAL '2 days',
 NOW() + INTERVAL '32 days',
 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800',
 'cccccccc-cccc-cccc-cccc-cccccccccccc',
 NOW() - INTERVAL '1 day',
 NOW()),

-- Successful Campaigns
('77777777-7777-7777-7777-777777777777',
 'Mechanical Gaming Keyboard',
 'RGB backlit mechanical keyboard with custom switches and programmable keys. Perfect for gamers and typists. Cherry MX switches with aluminum frame.',
 'Electronics',
 'GamerGear',
 199.99,
 35,
 129.99,
 30.00,
 100,
 100,
 'Successful',
 NOW() - INTERVAL '30 days',
 NOW() - INTERVAL '1 day',
 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
 'dddddddd-dddd-dddd-dddd-dddddddddddd',
 NOW() - INTERVAL '30 days',
 NOW()),

('88888888-8888-8888-8888-888888888888',
 'Robot Vacuum Cleaner',
 'Smart robot vacuum with mapping technology, app control, and auto-empty station. Keep your floors spotless effortlessly. Works with Alexa and Google Home.',
 'Appliances',
 'SmartHome Solutions',
 699.99,
 36,
 449.99,
 100.00,
 45,
 45,
 'Successful',
 NOW() - INTERVAL '25 days',
 NOW() - INTERVAL '2 days',
 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
 'dddddddd-dddd-dddd-dddd-dddddddddddd',
 NOW() - INTERVAL '25 days',
 NOW());

-- =============================================
-- 3. CAMPAIGN PARTICIPANTS
-- =============================================
INSERT INTO public.campaign_participants ("Id", "CampaignId", "UserId", "DepositPaid", "DepositAmount", "DepositPaymentId", "DepositPaidAt", "FinalPaymentPaid", "FinalPaymentAmount", "FinalPaymentId", "FinalPaidAt", "RefundProcessed", "RefundAmount", "RefundId", "RefundedAt", "JoinedAt", "Status")
VALUES
-- Participants for Campaign 1 (Premium Wireless Headphones - Active)
('10000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, 50.00, 'PAY_DEP_001', NOW() - INTERVAL '4 days', false, 149.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '4 days', 'Active'),
('10000001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true, 50.00, 'PAY_DEP_002', NOW() - INTERVAL '4 days', false, 149.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '4 days', 'Active'),
('10000001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true, 50.00, 'PAY_DEP_003', NOW() - INTERVAL '3 days', false, 149.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '3 days', 'Active'),
('10000001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, 50.00, 'PAY_DEP_004', NOW() - INTERVAL '2 days', false, 149.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '2 days', 'Active'),

-- Participants for Campaign 2 (Security Cameras - Active)
('10000002-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, 75.00, 'PAY_DEP_005', NOW() - INTERVAL '3 days', false, 224.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '3 days', 'Active'),
('10000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, 75.00, 'PAY_DEP_006', NOW() - INTERVAL '2 days', false, 224.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '2 days', 'Active'),
('10000002-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', true, 75.00, 'PAY_DEP_007', NOW() - INTERVAL '2 days', false, 224.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '2 days', 'Active'),

-- Participants for Campaign 3 (Office Chair - Active)
('10000003-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true, 100.00, 'PAY_DEP_008', NOW() - INTERVAL '6 days', false, 299.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '6 days', 'Active'),
('10000003-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true, 100.00, 'PAY_DEP_009', NOW() - INTERVAL '5 days', false, 299.99, NULL, NULL, false, 0, NULL, NULL, NOW() - INTERVAL '5 days', 'Active'),

-- Participants for Campaign 7 (Gaming Keyboard - Successful)
('10000007-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, 30.00, 'PAY_DEP_010', NOW() - INTERVAL '28 days', true, 99.99, 'PAY_FINAL_001', NOW() - INTERVAL '1 day', false, 0, NULL, NULL, NOW() - INTERVAL '28 days', 'Completed'),
('10000007-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true, 30.00, 'PAY_DEP_011', NOW() - INTERVAL '27 days', true, 99.99, 'PAY_FINAL_002', NOW() - INTERVAL '1 day', false, 0, NULL, NULL, NOW() - INTERVAL '27 days', 'Completed'),
('10000007-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777777', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true, 30.00, 'PAY_DEP_012', NOW() - INTERVAL '26 days', true, 99.99, 'PAY_FINAL_003', NOW() - INTERVAL '1 day', false, 0, NULL, NULL, NOW() - INTERVAL '26 days', 'Completed'),

-- Participants for Campaign 8 (Robot Vacuum - Successful)
('10000008-0000-0000-0000-000000000001', '88888888-8888-8888-8888-888888888888', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, 100.00, 'PAY_DEP_013', NOW() - INTERVAL '24 days', true, 349.99, 'PAY_FINAL_004', NOW() - INTERVAL '2 days', false, 0, NULL, NULL, NOW() - INTERVAL '24 days', 'Completed'),
('10000008-0000-0000-0000-000000000002', '88888888-8888-8888-8888-888888888888', 'ffffffff-ffff-ffff-ffff-ffffffffffff', true, 100.00, 'PAY_DEP_014', NOW() - INTERVAL '23 days', true, 349.99, 'PAY_FINAL_005', NOW() - INTERVAL '2 days', false, 0, NULL, NULL, NOW() - INTERVAL '23 days', 'Completed');

-- =============================================
-- 4. PAYMENTS
-- =============================================
INSERT INTO public.payments ("Id", "UserId", "CampaignId", "ParticipantId", "Amount", "Type", "Status", "PaymentProvider", "PaymentMethod", "TransactionId", "GatewayResponse", "CreatedAt", "UpdatedAt")
VALUES
-- Deposit Payments
('20000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000001', 50.00, 'Deposit', 'Completed', 'PayPal', 'PayPal', 'PAY_DEP_001', '{"transaction_id": "TXN001", "status": "completed"}', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('20000001-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000002', 50.00, 'Deposit', 'Completed', 'PayPal', 'CreditCard', 'PAY_DEP_002', '{"transaction_id": "TXN002", "status": "completed"}', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('20000001-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000003', 50.00, 'Deposit', 'Completed', 'Stripe', 'CreditCard', 'PAY_DEP_003', '{"transaction_id": "TXN003", "status": "completed"}', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('20000001-0000-0000-0000-000000000004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '10000001-0000-0000-0000-000000000004', 50.00, 'Deposit', 'Completed', 'Stripe', 'DebitCard', 'PAY_DEP_004', '{"transaction_id": "TXN004", "status": "completed"}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('20000002-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '10000002-0000-0000-0000-000000000001', 75.00, 'Deposit', 'Completed', 'PayPal', 'PayPal', 'PAY_DEP_005', '{"transaction_id": "TXN005", "status": "completed"}', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('20000002-0000-0000-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', '10000002-0000-0000-0000-000000000002', 75.00, 'Deposit', 'Completed', 'Stripe', 'CreditCard', 'PAY_DEP_006', '{"transaction_id": "TXN006", "status": "completed"}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Final Payments (for successful campaigns)
('20000007-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', '10000007-0000-0000-0000-000000000001', 99.99, 'Final', 'Completed', 'PayPal', 'PayPal', 'PAY_FINAL_001', '{"transaction_id": "TXN_FINAL_001", "status": "completed"}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('20000007-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', '10000007-0000-0000-0000-000000000002', 99.99, 'Final', 'Completed', 'Stripe', 'CreditCard', 'PAY_FINAL_002', '{"transaction_id": "TXN_FINAL_002", "status": "completed"}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('20000007-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777', '10000007-0000-0000-0000-000000000003', 99.99, 'Final', 'Completed', 'Stripe', 'DebitCard', 'PAY_FINAL_003', '{"transaction_id": "TXN_FINAL_003", "status": "completed"}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('20000008-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '88888888-8888-8888-8888-888888888888', '10000008-0000-0000-0000-000000000001', 349.99, 'Final', 'Completed', 'PayPal', 'PayPal', 'PAY_FINAL_004', '{"transaction_id": "TXN_FINAL_004", "status": "completed"}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('20000008-0000-0000-0000-000000000002', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '88888888-8888-8888-8888-888888888888', '10000008-0000-0000-0000-000000000002', 349.99, 'Final', 'Completed', 'Stripe', 'CreditCard', 'PAY_FINAL_005', '{"transaction_id": "TXN_FINAL_005", "status": "completed"}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- =============================================
-- 5. NOTIFICATIONS
-- =============================================
INSERT INTO public.notifications ("Id", "UserId", "CampaignId", "Type", "Title", "Message", "Read", "CreatedAt")
VALUES
-- Welcome notifications
('30000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'Welcome', 'Welcome to GroupBuy!', 'Thank you for joining GroupBuy. Start exploring amazing deals and join group campaigns to save money!', true, NOW() - INTERVAL '120 days'),
('30000001-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, 'Welcome', 'Welcome to GroupBuy!', 'Thank you for joining GroupBuy. Start exploring amazing deals and join group campaigns to save money!', true, NOW() - INTERVAL '90 days'),

-- Campaign join notifications
('30000002-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'CampaignJoined', 'You joined a campaign!', 'You successfully joined "Premium Wireless Headphones". Your deposit has been received.', true, NOW() - INTERVAL '4 days'),
('30000002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'CampaignJoined', 'You joined a campaign!', 'You successfully joined "Premium Wireless Headphones". Your deposit has been received.', true, NOW() - INTERVAL '4 days'),

-- Campaign success notifications
('30000003-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 'CampaignSuccess', 'Campaign Successful!', 'Great news! "Mechanical Gaming Keyboard" reached its target. Please complete your final payment.', true, NOW() - INTERVAL '1 day'),
('30000003-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'CampaignSuccess', 'Campaign Successful!', 'Great news! "Mechanical Gaming Keyboard" reached its target. Please complete your final payment.', true, NOW() - INTERVAL '1 day'),

-- Payment received notifications
('30000004-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 'PaymentReceived', 'Payment Confirmed', 'Your final payment for "Mechanical Gaming Keyboard" has been received. Your order will be shipped soon!', false, NOW() - INTERVAL '1 day'),
('30000004-0000-0000-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '88888888-8888-8888-8888-888888888888', 'PaymentReceived', 'Payment Confirmed', 'Your final payment for "Robot Vacuum Cleaner" has been received. Your order will be shipped soon!', false, NOW() - INTERVAL '2 days'),

-- Campaign reminder
('30000005-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'CampaignReminder', 'Campaign Ending Soon!', '"Premium Wireless Headphones" campaign ends in 25 days. Join now to get the discount!', false, NOW() - INTERVAL '1 day');

-- =============================================
-- 6. PASSWORD RESET TOKENS (Optional - for testing)
-- =============================================
INSERT INTO public.password_reset_tokens ("Id", "UserId", "Token", "ExpiresAt", "Used", "CreatedAt")
VALUES
('40000001-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'RESET_TOKEN_12345678', NOW() + INTERVAL '24 hours', false, NOW());

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to verify the data was inserted correctly:
-- SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
-- UNION ALL
-- SELECT 'Campaigns', COUNT(*) FROM public.campaigns
-- UNION ALL
-- SELECT 'Participants', COUNT(*) FROM public.campaign_participants
-- UNION ALL
-- SELECT 'Payments', COUNT(*) FROM public.payments
-- UNION ALL
-- SELECT 'Notifications', COUNT(*) FROM public.notifications
-- UNION ALL
-- SELECT 'Password Reset Tokens', COUNT(*) FROM public.password_reset_tokens;
