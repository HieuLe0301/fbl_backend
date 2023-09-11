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
    "products": Array,
    "subcategories": Array
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
        const found_category = await products.findOne({category_name:req.body.categoryName})
        res.send({
            'parent': found_category.parent,
            'children': found_category.subcategories
        })
    } catch (error) {
        console.log(error)
    }
})

app.post('/makeNTLC', async (req,res) => {
    try {
        const matched_categories = await products.find({category_name:req.body.NTLCName})

        if (matched_categories.length === 0) {
            const number_of_categories = await products.find()
            const new_c_id = 'c' + (number_of_categories.length + 1).toString()
             
            const result = await products.create({
                "c_id": new_c_id,
                "category_name": req.body.NTLCName,
                "parent": "n/a",
                "products": [],
                "subcategories": []
            })
            res.send({'status': 1})
        } else {
            res.send({'status': 0})
        }
    } catch (error) {
        console.log(error)
    }
})

app.post('/makeNewSubcat', async (req,res) => {
    try {
        const matched_categories = await products.find({category_name:req.body.newSubcat})

        if (matched_categories.length === 0) {
            const number_of_categories = await products.find()
            const new_c_id = 'c' + (number_of_categories.length + 1).toString()
             
            const result = await products.create({
                "c_id": new_c_id,
                "category_name": req.body.newSubcat,
                "parent": req.body.parent,
                "products": [],
                "subcategories": []
            })

            await products.findOneAndUpdate({category_name:req.body.parent}, {$push: {subcategories:req.body.newSubcat}})
            console.log("subcat made")
            res.send({'status': 1})
        } else {
            console.log("subcat NOT made")
            res.send({'status': 0})
        }
    } catch (error) {
        console.log(error)
    }
})


app.post('/deleteCategory', async(req,res) => {
    const found_category = await products.findOne({category_name:req.body.categoryName})

    const lookForAssociatedProducts = (cat) => {
        if (cat.products.length !== 0) {
            return 1
        } 
        for (const subcat of cat.subcategories) {
            if (lookForAssociatedProducts(subcat) === 1) {
                return 1;
            }
        }
        return 0
    }

    const result = lookForAssociatedProducts(found_category)

    if (found_category === undefined) {
        res.send({'status':-1})
    } else {
        if (found_category.subcategories.length > 0) {
            res.send({'status':0}) 
        } else if (lookForAssociatedProducts(found_category) === 1) {
            res.send({'status': -2})
        } else {
            if (found_category.parent !== 'n/a') {
                const parent = await products.findOne({category_name:found_category.parent})
                const new_subcategories = parent.subcategories.filter((e) => e !== req.body.categoryName)
                await products.findOneAndUpdate({category_name: parent.category_name},{subcategories: new_subcategories})
            }
            await products.deleteOne({category_name:req.body.categoryName})
            res.send({'status':1})
        }
    }
})




// SELLER SCHEMA

app.listen(8000, () => console.log("Express Server started on port 8000"));