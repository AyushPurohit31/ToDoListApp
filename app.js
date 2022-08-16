const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

mongoose.connect("mongodb+srv://admin-purohit:test123purohit@cluster0.spbtx1n.mongodb.net/toDoListDb");
const itemSchema = {
    name : String
}
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name : "welcome to your todo list."
})
const item2 = new Item({
    name : "Hit + to add new item."
})

const defaultItem = [item1, item2];
const listSchema = {
    name : String,
    items : [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.set('view engine' , 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
let day = date.getDate();

app.get("/", function(req,res){
    Item.find({}, function(err, foundItems){
        if(foundItems.length == 0){
            Item.insertMany(defaultItem, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("success");
                }
            });
            res.redirect("/")
        }else{
        res.render("list",{listTitle : day, newListItems : foundItems})
        }
    })
})

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name : customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name : customListName,
                    items : defaultItem
                });
                list.save();
                res.redirect("/"+customListName)
            }else{
                res.render("list", {listTitle : foundList.name, newListItems : foundList.items})
            }
        }
    })
})

app.get("/about", function(req,res){
    res.render("about");
})

app.post("/", function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name : itemName
    });

    if(listName === day){
        item.save();
        res.redirect("/")
    }else{
        List.findOne({name : listName} , function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
})

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const checkedItemList = req.body.listName;
    if(checkedItemList === day){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("removed");
                res.redirect("/")
            }
        })
    }else{
        List.findOneAndUpdate({name :checkedItemList},{ $pull : {items:{_id:checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+checkedItemList)
            }
        })
    }
    
})
app.listen(6500, function(){
    console.log("app started at local host 6500");
});