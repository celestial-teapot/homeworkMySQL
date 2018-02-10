var mysql      = require('mysql');
var Table = require('cli-table');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'puppet',
  database : 'bamazon'
});



var bamazaon = {
	state: '',
	order: {
		id: '',
		quantity: ''
	},

	order: function() {
		this.orderFlow('showInventory');
	},

	orderFlow: function(state) {
		this.state = state;
		switch (state) {
			case 'showInventory':
				this.printInventory();
				break;
			case 'takeOrder':
				this.promptOrder();
				break;
			case 'resolveOrder':
				this.executeOrder();
				break;
		}//switch case
	},// order function

	printInventory: function() {
		var table = new Table ({
			head: ['id','product','department','price','quantity'],
			colWidths: [5,30,30,10,10]
		});

		connection.query('SELECT * from products', function (error, results, fields) {
		 
		if (error) throw error;

		  results.forEach(result => table.push(Object.values(result) ));
		  console.log(table.toString());

		  bamazaon.orderFlow('takeOrder');
		});
	},

	promptOrder: function() {
		var questions = [
		  {
		    type: 'input',
		    name: 'id',
		    message: "What's the ID of the item you'd like to buy?"
		  },
		  {
		    type: 'input',
		    name: 'units',
		    message: "How many units would you like to buy?"
		  }
		];

		inquirer.prompt(questions).then(answers => {
		  bamazaon.order.id = answers.id;
		  bamazaon.order.quantity = answers.quantity;

		  bamazaon.enoughInventory(answers.id,answers.quantity)
		  this.orderFlow('checkInventory');
		});
	},

	enoughInventory: function(id,quantity) {
		connection.query(
			`SELECT IF (stock_quantity <= ${quantity},'true','false') 
			FROM bamazon.products
			WHERE item_id=${id};`
		, function (error, results, fields) {
		 
		if (error) throw error;

		  if (result) {
		  	console.log('insufficient quantity!')
		  } else {
		  	bamazaon.orderFlow('resolveOrder')
		  }
		});
	},
	executeOrder: function() {
		connection.query(
			`UPDATE products
			 SET stock_quantity = ${parseInt(bamazaon.order.quantity)-1}
			 WHERE id = ${bamazaon.order.id}`
		, function (error, results, fields) {
		 
		if (error) throw error;
		  console.log('order complete!')
		});
	}
} //bamazon object


bamazaon.order();


