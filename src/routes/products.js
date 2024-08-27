const express = require('express');
const router = express.Router();
const pool = require('../database');


//add/create product

router.get('/add', async (req, res) => {
    try {
        const categories = await pool.query('SELECT id, name FROM categories');
        res.render('products/add', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
});

router.post('/add', async (req, res) => {
    const { name, description, price, stock, id_category, url_imagen } = req.body;
    const id_seller = 1;

    const newProduct = {
        name,
        description,
        price,
        stock,
        id_category,
        id_seller,
        url_imagen
    };

    try {
        await pool.query('INSERT INTO products SET ?', [newProduct]);
        res.redirect('/products/list');
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).send('Error saving product');
    }
});

// list products
router.get('/list', async (req, res) => {
    try {
        const products = await pool.query('SELECT * FROM products');
        res.render('products/list', { products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Error fetching products');
    }
});

module.exports = router;
