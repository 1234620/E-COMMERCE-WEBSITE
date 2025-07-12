// app.js
try {
    const express = require('express');
    const mysql = require('mysql2');
    const path = require('path');
    console.log('Required modules loaded successfully');

    const app = express();

    // Middleware to parse form data
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));
    console.log('Middleware set up');

    // Set EJS as the templating engine and specify the views directory
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    console.log('EJS set as view engine');

    // Database connection
    const db = mysql.createConnection({
        host: '',
        user: '',
        password: '',
        database: 'e'
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Successfully connected to MySQL database: e_commerce');
    });

    // Home page
    app.get('/', (req, res) => {
        console.log('Rendering home page');
        res.render('home');
    });

    // Add Customer
    app.get('/add_customer', (req, res) => {
        console.log('Rendering add_customer page');
        res.render('add_customer');
    });

    app.post('/add_customer', (req, res) => {
        console.log('Received POST request for add_customer');
        const { customer_id, first_name, middle_name, last_name, email, dob, phone, age } = req.body;
        if (!phone.match(/^\d{10}$/)) {
            return res.send('Error: Phone must be exactly 10 digits.');
        }
        const query = 'INSERT INTO Customer (CustomerId, FirstName, MiddleName, LastName, Email, DateOfBirth, Phone, AGE) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [customer_id, first_name, middle_name, last_name, email, dob, phone, age], (err) => {
            if (err) {
                console.error('Error inserting customer:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Add Address
    app.get('/add_address', (req, res) => {
        console.log('Rendering add_address page');
        db.query('SELECT CustomerId, FirstName, LastName FROM Customer', (err, customers) => {
            if (err) {
                console.error('Error fetching customers:', err);
                return res.send('Database error.');
            }
            res.render('add_address', { customers });
        });
    });

    app.post('/add_address', (req, res) => {
        console.log('Received POST request for add_address');
        const { address_id, street_name, apartment_no, city, state, pincode, customer_id } = req.body;
        const query = 'INSERT INTO Address (AddressID, StreetName, Apartment_No, City, State, Pincode, Customer_CustomerId) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [address_id, street_name, apartment_no, city, state, pincode, customer_id], (err) => {
            if (err) {
                console.error('Error inserting address:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Add Seller
    app.get('/add_seller', (req, res) => {
        console.log('Rendering add_seller page');
        res.render('add_seller');
    });

    app.post('/add_seller', (req, res) => {
        console.log('Received POST request for add_seller');
        const { seller_id, name, phone, total_sales } = req.body;
        if (!phone.match(/^\d{10}$/)) {
            return res.send('Error: Phone must be exactly 10 digits.');
        }
        const query = 'INSERT INTO Seller (SellerId, Name, Phone, Total_Sales) VALUES (?, ?, ?, ?)';
        db.query(query, [seller_id, name, phone, total_sales], (err) => {
            if (err) {
                console.error('Error inserting seller:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Add Category
    app.get('/add_category', (req, res) => {
        console.log('Rendering add_category page');
        res.render('add_category');
    });

    app.post('/add_category', (req, res) => {
        console.log('Received POST request for add_category');
        const { category_id, category_name, description } = req.body;
        const query = 'INSERT INTO Category (CategoryID, CategoryName, Description) VALUES (?, ?, ?)';
        db.query(query, [category_id, category_name, description], (err) => {
            if (err) {
                console.error('Error inserting category:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Add Product
    app.get('/add_product', (req, res) => {
        console.log('Rendering add_product page');
        db.query('SELECT SellerId, Name FROM Seller', (err, sellers) => {
            if (err) return res.send('Database error.');
            db.query('SELECT CategoryID, CategoryName FROM Category', (err, categories) => {
                if (err) return res.send('Database error.');
                res.render('add_product', { sellers, categories });
            });
        });
    });

    app.post('/add_product', (req, res) => {
        console.log('Received POST request for add_product');
        const { product_id, product_name, seller_id, mrp, category_id, stock, brand } = req.body;
        const query = 'INSERT INTO Product (ProductId, ProductName, SellerId, MRP, CategoryID, Stock, Brand) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [product_id, product_name, seller_id, mrp, category_id, stock === 'on' ? 1 : 0, brand], (err) => {
            if (err) {
                console.error('Error inserting product:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Add Cart
    app.get('/add_cart', (req, res) => {
        console.log('Rendering add_cart page');
        db.query('SELECT CustomerId, FirstName, LastName FROM Customer', (err, customers) => {
            if (err) return res.send('Database error.');
            db.query('SELECT ProductId, ProductName FROM Product', (err, products) => {
                if (err) return res.send('Database error.');
                res.render('add_cart', { customers, products });
            });
        });
    });

    app.post('/add_cart', (req, res) => {
        console.log('Received POST request for add_cart');
        const { cart_id, customer_id, product_id, grand_total, items_total } = req.body;
        const query = 'INSERT INTO Cart (CartId, Customer_CustomerId, Product_ProductId, GrandTotal, ItemsTotal) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [cart_id, customer_id, product_id, grand_total, items_total], (err) => {
            if (err) {
                console.error('Error inserting cart:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Place Order
    app.get('/place_order', (req, res) => {
        console.log('Fetching data for place_order page');
        db.query('SELECT CartId, Customer_CustomerId FROM Cart', (err, carts) => {
            if (err) return res.send('Database error.');
            db.query('SELECT CustomerId, FirstName, LastName FROM Customer', (err, customers) => {
                if (err) return res.send('Database error.');
                res.render('place_order', { carts, customers });
            });
        });
    });

    app.post('/place_order', (req, res) => {
        console.log('Received POST request for place_order');
        const { order_id, order_number, shipping_date, order_date, order_amount, cart_id, customer_id, order_status } = req.body;
        const query = 'INSERT INTO OrderTable (OrderId, OrderNumber, ShippingDate, OrderDate, OrderAmount, Cart_CartId, Customer_CustomerId, OrderStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [order_id, order_number, shipping_date, order_date, order_amount, cart_id, customer_id, order_status], (err) => {
            if (err) {
                console.error('Error placing order:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Add Payment
    app.get('/add_payment', (req, res) => {
        console.log('Rendering add_payment page');
        db.query('SELECT OrderId, OrderNumber FROM OrderTable', (err, orders) => {
            if (err) return res.send('Database error.');
            db.query('SELECT CustomerId, FirstName, LastName FROM Customer', (err, customers) => {
                if (err) return res.send('Database error.');
                res.render('add_payment', { orders, customers });
            });
        });
    });

    app.post('/add_payment', (req, res) => {
        console.log('Received POST request for add_payment');
        const { payment_id, order_id, payment_mode, customer_id, date_of_payment } = req.body;
        const query = 'INSERT INTO Payment (Payment_Id, Order_OrderId, PaymentMode, Customer_CustomerId, Date_of_payment) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [payment_id, order_id, payment_mode, customer_id, date_of_payment], (err) => {
            if (err) {
                console.error('Error inserting payment:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Add Review
    app.get('/add_review', (req, res) => {
        console.log('Rendering add_review page');
        db.query('SELECT ProductId, ProductName FROM Product', (err, products) => {
            if (err) return res.send('Database error.');
            db.query('SELECT CustomerId, FirstName, LastName FROM Customer', (err, customers) => {
                if (err) return res.send('Database error.');
                res.render('add_review', { products, customers });
            });
        });
    });

    app.post('/add_review', (req, res) => {
        console.log('Received POST request for add_review');
        const { review_id, description, ratings, product_id, customer_id } = req.body;
        const query = 'INSERT INTO Review (ReviewId, Description, Ratings, Product_ProductId, Customer_CustomerId) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [review_id, description, ratings, product_id, customer_id], (err) => {
            if (err) {
                console.error('Error inserting review:', err);
                return res.send('Database error.');
            }
            res.redirect('/success');
        });
    });

    // Success page
    app.get('/success', (req, res) => {
        console.log('Rendering success page');
        res.render('success');
    });

    // Start the server
    const PORT = 3003; // Using a different port to avoid conflict
    app.listen(PORT, (err) => {
        if (err) {
            console.error('Error starting server:', err);
            return;
        }
        console.log(`Server running on http://localhost:${PORT}`);
    });

} catch (error) {
    console.error('An error occurred in the application:', error);
}