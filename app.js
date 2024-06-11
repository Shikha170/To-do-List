const express=require("express");
const bodyParser=require('body-parser');
// const date=require(__dirname+ "/date.js");
const mongoose=require("mongoose");

const _=require("lodash");
const app=express();

// let items=["Buy food","Cook food","Eat food"];
// let workItems=[];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://shikha_singh:.shikha17@cluster50484.cefr9oz.mongodb.net/todolistDB");

const itemsSchema={
    name:String

};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your todolist!"

});
const item2=new Item({
    name:"Hit + button!"

});
const item3=new Item({
    name:"hit this to delete an item"

});
const defaultItems=[item1,item2,item3];


const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);
// Item.insertMany(defaultItems,function(err){
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("Successfully saved default items to DB");
//     }
// })String

// async function saveDefaultItems() {
//     try {
//         await Item.insertMany(defaultItems);
//         console.log("Successfully saved default items to DB");
//     } catch (err) {
//         console.error(err);
//     }
// }
// // Call the async function
// saveDefaultItems();


// app.get("/",function(req,res){
//     Item.find({},function(err,foundItems){
//         res.render("list",{listTitle:"Today",newListItems:foundItems});
//     });
// //    let day=date.getDate();
    
// });

app.get("/", async (req, res) => {
    try {
        const foundItems = await Item.find({});
        if(foundItems.length===0){
            async function saveDefaultItems() {
                try {
                    await Item.insertMany(defaultItems);
                    console.log("Successfully saved default items to DB");
                } catch (err) {
                    console.error(err);
                }
            }
            // Call the async function
            saveDefaultItems();
            res.redirect("/");
        }
        else{
            res.render("list", { ListTitle: "Today", newListItem: foundItems });
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});



app.post("/", async (req, res) => {
    const itemName=req.body.newItem;
    const listName=req.body.list;

    const item =new Item({
        name:itemName
    });
    if (listName === "Today") {
        try {
         await item.save();
            res.redirect("/");
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    } else {
        try {
            const foundList = await List.findOne({ name: listName });
            if (foundList) {
                foundList.items.push(item);
                 await foundList.save();
                res.redirect("/" + listName);
            } else {
                res.status(404).send("List not found");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    }
    

//    let item=req.body.newItem;
//    if(req.body.list=="Work List"){
//     workItems.push(item);
//     res.redirect("/work");
//    }
//    else{
//     items.push(item);
//     res.redirect("/");
//    }
   
});
// 

app.post("/delete", async (req, res) => {
    try {
        // Get the checkbox value from req.body and trim any leading/trailing spaces
        const checkedItemId = req.body.checkbox.trim();
        const listName=req.body.listName;

         // Validate checkedItemId format (should be a valid ObjectId)
         if (!mongoose.Types.ObjectId.isValid(checkedItemId)) {
            throw new Error("Invalid ObjectId format");
        }

        if (listName === "Today") {
            // Delete item asynchronously
            await Item.findByIdAndDelete(checkedItemId);
            console.log("Successfully removed checked item from DB");

            // Redirect to the home page after successful deletion
            res.redirect("/");
        } else {
            // Use async/await for findOneAndUpdate
            const foundList = await List.findOneAndUpdate(
                { name: listName },
                { $pull: { items: { _id: checkedItemId } } },
                { new: true }
            );

            if (foundList) {
                res.redirect("/" + listName);
            } else {
                res.status(404).send("List not found");
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});




// app.get("/work",function(req,res){
//     res.render("list",{ListTitle:"Work List",newListItem:workItems});
// });
app.get("/:customListName",async(req, res) => {
    const customListName=_.capitalize(req.params.customListName);
  
    async function findItem(customListName) {
        try {
            const foundList = await List.findOne({ name: customListName });
            if (!foundList) {
                //create a new list
                // console.log("Doesn't exist");
                const list=new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            } else {
                res.render("list",{ListTitle: foundList.name, newListItem: foundList.items })
                //show an existing list
                // console.log("Exists");
            }
        } catch (err) {

            //show an existing list
            console.error("Error occurred:", err);
        }
    }
    
    findItem(customListName);

 

});


app.post("/work",function(req,res){
    let item=req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about",function(req,res){
    res.render("about");
});


app.listen(3000,function(){
  console.log("server started on port 3000");
});