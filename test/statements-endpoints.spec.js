const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Statements Endpoints", function () {
	let db;

	const { testUsers, testStatements } = helpers.makeFixtures();

	before("make knex instance", () => {
		db = knex({
			client: "pg",
			connection: process.env.TEST_DB_URL,
		});
		app.set("db", db);
	});

	after("disconnect from db", () => db.destroy());

	before("cleanup", () => helpers.cleanTables(db));

	afterEach("cleanup", () => helpers.cleanTables(db));

	describe(`GET /api/statements`, () => {
		context(`Given no statements`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers));

			it(`responds with 200 and an empty list`, () => {
				return supertest(app)
					.get("/api/statements")
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(200, []);
			});
		});

		context("Given there are statements in the database", () => {
			beforeEach("insert statements", () =>
				helpers.seedStatementsTables(db, testUsers, testStatements)
			);

			it("responds with 200 and all of the statements", () => {
				const expectedStatements = testStatements.map((statement) =>
					helpers.makeExpectedStatements(testUsers, statement)
				);
				return supertest(app)
					.get("/api/statements")
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedStatements);
			});
		});

		context(`Given an XSS attack statement`, () => {
			const testUser = helpers.makeUsersArray()[1];
			const {
				maliciousStatement,
				expectedStatement,
			} = helpers.makeMaliciousStatement(testUser);

			beforeEach("insert malicious statement", () => {
				return helpers.seedMaliciousStatement(db, testUser, maliciousStatement);
			});

			it("removes XSS attack content", () => {
				return supertest(app)
					.get(`/api/statements`)
					.set("Authorization", helpers.makeAuthHeader(testUser))
					.expect(200)
					.expect((res) => {
						expect(res.body[0].content).to.eql(expectedStatement.content);
					});
			});
		});
	});

	describe(`GET /api/statements/:statement_id`, () => {
		context(`Given no statements`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers));

			it(`responds with 404`, () => {
				const statementId = 123456;
				return supertest(app)
					.get(`/api/statements/${statementId}`)
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Statement doesn't exist` });
			});
		});

		context("Given there are statements in the database", () => {
			beforeEach("insert statements", () =>
				helpers.seedStatementsTables(db, testUsers, testStatements)
			);

			it("responds with 200 and the specified statement", () => {
				const statementId = 2;
				const expectedStatement = helpers.makeExpectedStatements(
					testUsers,
					testStatements[statementId - 1]
				);

				return supertest(app)
					.get(`/api/statements/${statementId}`)
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(200, expectedStatement);
			});
		});

		context(`Given an XSS attack statement`, () => {
			const testUser = helpers.makeUsersArray()[1];
			const {
				maliciousStatement,
				expectedStatement,
			} = helpers.makeMaliciousStatement(testUser);

			beforeEach("insert malicious statement", () => {
				return helpers.seedMaliciousStatement(db, testUser, maliciousStatement);
			});

			it("removes XSS attack content", () => {
				return supertest(app)
					.get(`/api/statements/${maliciousStatement.statement_id}`)
					.set("Authorization", helpers.makeAuthHeader(testUser))
					.expect(200)
					.expect((res) => {
						expect(res.body.content).to.eql(expectedStatement.content);
					});
			});
		});
	});
});