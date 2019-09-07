var mysql = require("mysql");
var inquirer = require("inquirer");
// creating the connection info for SQL db
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // My password
    password: "MySql",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "product_name",
                    type: "list",
                    choices: function () {
                        
                        var choiceJoin = []  //array of id and product name//
                        for (var i = 0; i < results.length; i++) {

                            choiceJoin.push(results[i].item_id + ',' + results[i].product_name)
                        }
                        return (choiceJoin)
                    },
                    message: "Add Product to your Cart!"
                },
                {
                    name: "userQuantity",
                    type: "input",
                    message: "Quantity Ordered?"
                }
            ])
            .then(function (answer) {
                //console.log(answer)
                var getId = answer.product_name.indexOf(',');
                var getProductId = answer.product_name.substring(0, getId);
                dataRetrieve(getProductId, answer.userQuantity);

            }

            )
    }

    )
}

function dataRetrieve(getProductId, userQuantity) {
    connection.query("SELECT * FROM products Where item_id =?", [getProductId], function (err, results) {
        if (err) throw err;
        var resQuantity = results[0].stock_quantity; 
        var productPrice = results[0].price
        if (resQuantity >= userQuantity) {
            console.log("Great! Product is In Stock!");
            productPurchase(getProductId, resQuantity, userQuantity,productPrice)
        }
        else {
            console.log('Insufficient quantity!')
            connection.end();
            return

        }
    })

}
function productPurchase(getProductId, resQuantity, userQuantity,productPrice) {
    var updateStock = parseInt(resQuantity) - parseInt(userQuantity)
    var TotalPrice = (parseFloat(productPrice,2))*(parseInt(userQuantity)); //checks for total amount selected plus it grand total//
    connection.query("UPDATE products SET ? WHERE ?",
        [{ stock_quantity: updateStock },
        { item_id: getProductId }
        ],
        function (err, res) {    //updating stock//
            if (err) throw err;
            console.log("Current in Stock Product: " + updateStock)
            console.log("Price per Product: "+productPrice)
            console.log("Total Price: " + TotalPrice)
            connection.end();  //must had end to requery//
        }
    )
}