const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser');

const connection_string = "mongodb+srv://hieule0301:yeunavcl@cluster02703.syx3xrh.mongodb.net/fbl?retryWrites=true&w=majority"

mongoose.connect(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())



//PRODUCT SCHEMA

const productSchema = new mongoose.Schema({
    "c_id": String,
    "category_name": String,
    "parent": String,
    "models": Array,
    "subcategories": Array,
    "attributes": Array
})

const products = new mongoose.model('products', productSchema)

app.get('/hi', async (req,res) => {
    try {
        console.log(1)
    } catch (error) {
        console.log(error)
    } 
})

app.get('/fetchCategoriesNames', async (req,res) => {
    try {
        const found_categories = await products.find({parent:'n/a'})
        const categories_names = found_categories.map(e => e.category_name)
        res.send({"categories_names":categories_names})
    } catch (error) {
        console.log(error)
    }
})

app.post('/fetchParentAndChildren', async (req, res) => {
    try {
        console.log(1)
        const found_category = await products.findOne({category_name:req.body.categoryName})
        res.send({
            'parent': found_category.parent,
            'children': found_category.subcategories
        })
    } catch (error) {
        console.log(error)
    }
})








// SELLER SCHEMA

app.listen(8000, () => console.log("Express Server started on port 8000"));