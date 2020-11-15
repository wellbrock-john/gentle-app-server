const express = require("express");
const StatementsService = require("./statements-service");
const { requireAuth } = require("../middleware/jwt-auth");

const statementsRouter = express.Router();
const jsonBodyParser = express.json();

statementsRouter
	.route("/")
	.all(requireAuth)
	.get((req, res, next) => {
		StatementsService.getStatementsForUser(req.app.get("db"), req.user.id)
			.then((statements) => {
				res.json(statements.map(StatementsService.serializeStatement));
			})
			.catch(next);
	})
	.post(jsonBodyParser, (req, res, next) => {
		for (const field of ["content"]) {
			if (!req.body[field]) {
				return res.status(400).send(`'${field}' is required`);
			}
		}

		const { content } = req.body;
		const newStatement = { content };

		StatementsService.insertStatement(
			req.app.get("db"),
			newStatement,
			req.user.id
		)
			.then((statement) => {
				res
					.status(201)
					.location(`/api/statements/${statement.statement_id}`)
					.json(StatementsService.serializeStatement(statement));
			})
			.catch(next);
	});

statementsRouter
	.route("/:statement_id")
	.all(requireAuth)
	.all(checkStatementExists)
	.get((req, res) => {
		res.json(StatementsService.serializeStatement(res.statement));
	})
	.delete((req, res, next) => {
		const { statement_id } = req.params;
		StatementsService.deleteStatement(
			req.app.get("db"),
			statement_id,
			req.user.id
		)
			.then(() => {
				res.status(204).end();
			})
			.catch(next);
	});

/* async/await syntax for promises */
async function checkStatementExists(req, res, next) {
	try {
		const statement = await StatementsService.getById(
			req.app.get("db"),
			req.params.statement_id,
			req.user.id
		);

		if (!statement)
			return res.status(404).json({
				error: `Statement doesn't exist`,
			});

		res.statement = statement;
		next();
	} catch (error) {
		next(error);
	}
}

module.exports = statementsRouter;
