const xss = require("xss");

const StatementsService = {
	getStatementsForUser(db, user_id) {
		return db.select("*").where({ user_id }).from("statements");
	},

	getById(db, statement_id, user_id) {
		return db.first("*").from("statements").where({ statement_id, user_id });
	},
	insertStatement(db, newStatement, user_id) {
		newStatement.user_id = user_id;
		return db
			.insert(newStatement)
			.into("statements")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	deleteStatement(db, statement_id, user_id) {
		return db("statements").where({ statement_id, user_id }).delete();
	},
	deleteDemoStatements(db, user_id) {
		return db("statements").where({ user_id }).delete();
	},
	serializeStatement(statement) {
		return {
			statement_id: statement.statement_id,
			content: xss(statement.content),
			date_created: new Date(statement.date_created),
			user_id: statement.user_id,
		};
	},
};

module.exports = StatementsService;
