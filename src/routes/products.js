const express = require("express");
const router = express.Router();
const pool = require("../database");
const { isLoggedIn } = require("../lib/auth");


//listar
router.get("/", isLoggedIn, (req, res) => {
  const user = req.user;

  res.render("index", {
    user,
    showAddProduct: user && user.role === "vendedor",
    showProductsClient: user && user.role === "cliente",
  });
});

//añadir un producto
router.get("/add", isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "vendedor") {
      return res.redirect("/products/listClient");
    }

    const categories = await pool.query("SELECT id, name FROM categories");
    res.render("products/add", { categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Error fetching categories");
  }
});

router.post("/add", isLoggedIn, async (req, res) => {
  const { name, description, price, stock, id_category, url_imagen } = req.body;
  const id_seller = req.user.id;

  const newProduct = {
    name,
    description,
    price,
    stock,
    id_category,
    id_seller,
    url_imagen,
  };

  try {
    await pool.query("INSERT INTO products SET ?", [newProduct]);
    res.redirect("/products/list");
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).send("Error saving product");
  }
});

// Listar productos - vendedor
router.get("/list", isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "vendedor") {
      return res.redirect("/products/listClient");
    }

    const products = await pool.query("SELECT * FROM products");
    res.render("products/list", { products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

// Listar productos - cliente
router.get("/listClient", isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "cliente") {
      return res.redirect("/products/list");
    }

    const products = await pool.query("SELECT * FROM products");
    res.render("products/listClient", { products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

// Eliminar producto
router.get("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  try {
    const user = req.user;

    if (user.role !== "vendedor") {
      return res.redirect("/products/listClient");
    }

    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.redirect("/products/list");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Error deleting product");
  }
});

// Editar producto
router.get("/edit/:id", isLoggedIn, async (req, res) => {
  const user = req.user;

  if (user.role !== "vendedor") {
    return res.redirect("/products/list");
  }

  try {
    const { id } = req.params;
    const products = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    const categories = await pool.query("SELECT id, name FROM categories");

    const product = products[0];
    const updatedCategories = categories.map((category) => ({
      ...category,
      isSelected: category.id === product.id_category,
    }));

    res.render("products/edit", { product, categories: updatedCategories });
  } catch (error) {
    console.error("Error fetching product or categories:", error);
    res.status(500).send("Error fetching product or categories");
  }
});

router.post("/edit/:id", isLoggedIn, async (req, res) => {
  const user = req.user;
  if (user.role !== "vendedor") {
    return res.redirect("/products/list");
  }

  const { id } = req.params;
  const { name, description, price, stock, id_category, url_imagen } = req.body;

  try {
    const currentProduct = await pool.query(
      "SELECT id_seller FROM products WHERE id = ?",
      [id]
    );

    const newProduct = {
      name,
      description,
      price,
      stock,
      id_category,
      url_imagen,
      id_seller: currentProduct[0].id_seller,
    };

    await pool.query("UPDATE products SET ? WHERE id = ?", [newProduct, id]);
    res.redirect("/products/list");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product");
  }
});

module.exports = router;
