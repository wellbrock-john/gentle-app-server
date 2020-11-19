const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Notes Endpoints", function () {
	let db;

	const { testUsers, testNotes } = helpers.makeFixtures();

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

	describe(`GET /api/notes`, () => {
		context(`Given no notes`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers));

			it(`responds with 200 and an empty list`, () => {
				return supertest(app)
					.get("/api/notes")
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(200, []);
			});
		});

		context(`Given an XSS attack note`, () => {
			const testUser = helpers.makeUsersArray()[1];
			const { maliciousNote, expectedNote } = helpers.makeMaliciousNote(
				testUser
			);

			beforeEach("insert malicious note", () => {
				return helpers.seedMaliciousNote(db, testUser, maliciousNote);
			});

			it("removes XSS attack content", () => {
				return supertest(app)
					.get(`/api/notes`)
					.set("Authorization", helpers.makeAuthHeader(testUser))
					.expect(200)
					.expect((res) => {
						expect(res.body[0].subject).to.eql(expectedNote.subject);
						expect(res.body[0].content).to.eql(expectedNote.content);
					});
			});
		});
	});

	describe(`GET /api/notes/:note_id`, () => {
		context(`Given no notes`, () => {
			beforeEach(() => helpers.seedUsers(db, testUsers));

			it(`responds with 404`, () => {
				const note_id = 123456;
				return supertest(app)
					.get(`/api/notes/${note_id}`)
					.set("Authorization", helpers.makeAuthHeader(testUsers[0]))
					.expect(404, { error: `Note doesn't exist` });
			});
		});

		context(`Given an XSS attack note`, () => {
			const testUser = helpers.makeUsersArray()[1];
			const { maliciousNote, expectedNote } = helpers.makeMaliciousNote(
				testUser
			);

			beforeEach("insert malicious note", () => {
				return helpers.seedMaliciousNote(db, testUser, maliciousNote);
			});

			it("removes XSS attack content", () => {
				return supertest(app)
					.get(`/api/notes/${maliciousNote.note_id}`)
					.set("Authorization", helpers.makeAuthHeader(testUser))
					.expect(200)
					.expect((res) => {
						expect(res.body.subject).to.eql(expectedNote.subject);
						expect(res.body.content).to.eql(expectedNote.content);
					});
			});
		});
	});
});
