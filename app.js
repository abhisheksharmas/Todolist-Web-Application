//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://abhishek:%40reyoudeadyet%2F@cluster0.ukt32.mongodb.net/todolistDB");
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"Welcome"
});
const item2 = new Item({
  name:"Hit the plus button to add new things you hav to do"
});
const item3 = new Item({
  name:"hit the checkbox to delete the things you've done"
});
const item4 = new Item({
  name:"Try Yourself"
});


const defaultItems=[item1,item2,item3,item4];
const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);
app.get("/:custom",function(req,res){
  const customListName=_.capitalize(req.params.custom);
  
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        //show an existing list
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
      }
    }
  });
  

});

app.get("/", function(req, res) {


    Item.find({},function(err,foundItems){
     if(foundItems.length===0){
        Item.insertMany(defaultItems,function(err){
            if(err){
              console.log(err);
            }else{console.log("success");}
          });
          res.redirect("/");
     }else{

     
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }});
  

});

app.post("/", function(req, res){

  const itemName= req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
  item.save();
  res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("deleted");
      res.redirect("/");
    }});}else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
      
      
    }
  
});



app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port==null||port==""){
  port=9000;
}
app.listen(port, function() {
  console.log("Server started ");
});
