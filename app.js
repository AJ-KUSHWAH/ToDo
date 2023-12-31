//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ajay:ajay@todo.fkl5z1t.mongodb.net/?retryWrites=true&w=majority")

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: " Hit this button to save a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defualtItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

Item.find({}, function(err, foundItems){

if(foundItems.length === 0) {
  Item.insertMany(defualtItems, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("Successfully saved the defualt items to DB.")
    }
  });
  res.redirect("/");
}else {
   res.render("list", {listTitle: "Today", newListItems: foundItems});
 }


});

});

// express Route parameter
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName); //to handle the lower and uppper case different routes.

  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defualtItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      } else {
          //Show an existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

})

app.post("/", function(req, res){
  

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  //to redirect on the same route page
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    });
  }

});

//to delete the checked item
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){ 
        console.log("Successfully deleted checked item");
  
        res.redirect("/");
      }
    });
  
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }


});

 

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
