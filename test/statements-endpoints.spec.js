const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Statements Endpoints", function () {
	let db;

	const { testUsers, testStatements } = helpers.makeFixtures();

	before("make knex instance", () => {
		db = knex({
			client: "pg",
			connection: process.env.TEST_DATABASE_URL,
		});
		app.set("db", db);
	});

	after("disconnect from db", () => db.destroy());

	before("cleanup", () => helpers.cleanTables(db));

	afterEach("cleanup", () => helpers.cleanTables(db));

	describe(`GET /api/positivestatements`, () => {
		context(`Given no statements`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers));

			it(`responds with 200 and an empty list`, () => {
				return supertest(app)
					.get("/api/positivestatements")
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(200, []);
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
					.get(`/api/positivestatements`)
					.set("Authorization", helpers.makeAuthHeader(testUser))
					.expect(200)
					.expect((res) => {
						expect(res.body[0].content).to.eql(expectedStatement.content);
					});
			});
		});
	});

	describe(`GET /api/positivestatements/:statement_id`, () => {
		context(`Given no statements`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers));

			it(`responds with 404`, () => {
				const statementId = 123456;
				return supertest(app)
					.get(`/api/positivestatements/${statementId}`)
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Statement doesn't exist` });
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
					.get(`/api/positivestatements/${maliciousStatement.statement_id}`)
					.set("Authorization", helpers.makeAuthHeader(testUser))
					.expect(200)
					.expect((res) => {
						expect(res.body.content).to.eql(expectedStatement.content);
					});
			});
		});
	});
});
