const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");
const { expect } = require("chai");

describe("Users Endpoints", function () {
	let db;

	const { testUsers } = helpers.makeFixtures();
	const testUser = testUsers[0];

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

	describe(`POST /api/users`, () => {
		context(`User Validation`, () => {
			beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

			const requiredFields = ["username", "password", "full_name"];

			requiredFields.forEach((field) => {
				const registerAttemptBody = {
					username: "test username",
					password: "test Password1!",
					full_name: "test full_name",
					email: "test test@testemail.com",
					nickname: "test nickname",
				};

				it(`responds with 400 required error when '${field}' is missing`, () => {
					delete registerAttemptBody[field];

					return supertest(app)
						.post("/api/users")
						.send(registerAttemptBody)
						.expect(400, {
							error: `Missing '${field}' in request body`,
						});
				});
			});

			it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
				const userShortPassword = {
					username: "test username",
					password: "1234567",
					full_name: "test full_name",
					email: "test@testemail.com",
				};
				return supertest(app)
					.post("/api/users")
					.send(userShortPassword)
					.expect(400, { error: `Password be longer than 8 characters` });
			});

			it(`responds 400 'Password be less than 72 characters' when long password`, () => {
				const userLongPassword = {
					username: "test username",
					password: "*".repeat(73),
					full_name: "test full_name",
					email: "test@testemail.com",
				};
				return supertest(app)
					.post("/api/users")
					.send(userLongPassword)
					.expect(400, { error: `Password be less than 72 characters` });
			});

			it(`responds 400 error when password starts with spaces`, () => {
				const userPasswordStartsSpaces = {
					username: "test username",
					password: " 1Aa!2Bb@",
					full_name: "test full_name",
					email: "test@testemail.com",
				};
				return supertest(app)
					.post("/api/users")
					.send(userPasswordStartsSpaces)
					.expect(400, {
						error: `Password must not start or end with empty spaces`,
					});
			});

			it(`responds 400 error when password ends with spaces`, () => {
				const userPasswordEndsSpaces = {
					username: "test username",
					password: "1Aa!2Bb@ ",
					full_name: "test full_name",
					email: "test@testemail.com",
				};
				return supertest(app)
					.post("/api/users")
					.send(userPasswordEndsSpaces)
					.expect(400, {
						error: `Password must not start or end with empty spaces`,
					});
			});

			it(`responds 400 error when password isn't complex enough`, () => {
				const userPasswordNotComplex = {
					username: "test username",
					password: "11AAaabb",
					full_name: "test full_name",
					email: "test@testemail.com",
				};
				return supertest(app)
					.post("/api/users")
					.send(userPasswordNotComplex)
					.expect(400, {
						error: `Password must contain one upper case, lower case, number and special character`,
					});
			});

			it(`responds 400 'User name already taken' when username isn't unique`, () => {
				const duplicateUser = {
					username: testUser.username,
					password: "11AAaa!!",
					full_name: "test full_name",
					email: "test@testemail.com",
				};
				return supertest(app)
					.post("/api/users")
					.send(duplicateUser)
					.expect(400, { error: `Username already taken` });
			});
		});

		context(`Happy path`, () => {
			it(`responds 201, serialized user, storing bcryped password`, () => {
				const newUser = {
					username: "test username",
					password: "11AAaa!!",
					full_name: "test full_name",
					email: "test@testemail.com",
				};
				return supertest(app)
					.post("/api/users")
					.send(newUser)
					.expect(201)
					.expect((res) => {
						expect(res.body).to.have.property("id");
						expect(res.body.username).to.eql(newUser.username);
						expect(res.body.full_name).to.eql(newUser.full_name);
						expect(res.body.email).to.eql(newUser.email);
						expect(res.body.nickname).to.eql("");
						expect(res.body).to.not.have.property("password");
						expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
						const expectedDate = new Date().toLocaleString("en", {
							timeZone: "UTC",
						});
						const actualDate = new Date(res.body.date_created).toLocaleString();
						expect(actualDate).to.eql(expectedDate);
					})
					.expect((res) =>
						db
							.from("users")
							.select("*")
							.where({ id: res.body.id })
							.first()
							.then((row) => {
								expect(row.username).to.eql(newUser.username);
								expect(row.full_name).to.eql(newUser.full_name);
								expect(row.nickname).to.eql(null);
								expect(row.email).to.eql(newUser.email);
								const expectedDate = new Date().toLocaleString("en", {
									timeZone: "UTC",
								});
								const actualDate = new Date(row.date_created).toLocaleString();
								expect(actualDate).to.eql(expectedDate);

								return bcrypt.compare(newUser.password, row.password);
							})
							.then((compareMatch) => {
								expect(compareMatch).to.be.true;
							})
					);
			});
		});
	});
});