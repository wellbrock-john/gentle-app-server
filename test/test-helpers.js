const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
	return [
		{
			id: 1,
			username: "test-user-1",
			full_name: "Test user 1",
			password: "password",
			email: "email1@fakeemail.com",
			date_created: new Date("2020-01-01T00:00:00.000Z"),
		},
		{
			id: 2,
			username: "test-user-2",
			full_name: "Test user 2",
			password: "password",
			email: "email2@fakeemail.com",
			date_created: new Date("2020-01-01T00:00:00.000Z"),
		},
		{
			id: 3,
			username: "test-user-3",
			full_name: "Test user 3",
			password: "password",
			email: "email3@fakeemail.com",
			date_created: new Date("2020-01-01T00:00:00.000Z"),
		},
		{
			id: 4,
			username: "test-user-4",
			full_name: "Test user 4",
			password: "password",
			email: "email4@fakeemail.com",
			date_created: new Date("2020-01-01T00:00:00.000Z"),
		},
	];
}

function makeStatementsArray(users) {
	return [
		{
			statement_id: 1,
			user_id: users[0].id,
			date_created: new Date("2020-01-01T00:00:00.000Z"),
			content:
				"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
		},
		{
			statement_id: 2,
			user_id: users[1].id,
			date_created: new Date("2020-01-01T00:00:00.000Z"),
			content:
				"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
		},
		{
			statement_id: 3,
			user_id: users[2].id,
			date_created: new Date("2020-01-01T00:00:00.000Z"),
			content:
				"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
		},
		{
			statement_id: 4,
			user_id: users[3].id,
			date_created: new Date("2020-01-01T00:00:00.000Z"),
			content:
				"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
		},
	];
}

function makeNotesArray(users) {
	return [
		{
			note_id: 1,
			subject: "First test note!",
			content: "Here is some content",
			user_id: users[0].id,
			date_created: new Date("2020-01-01T00:00:00.000Z"),
		},
		{
			note_id: 2,
			subject: "Second test note!",
			content: "Here is some content",
			user_id: users[1].id,
			date_created: new Date("2020-01-01T00:00:00.000Z"),
		},
		{
			note_id: 3,
			subject: "Third test note!",
			content: "Here is some content",
			user_id: users[2].id,
			date_created: new Date("2020-01-01T00:00:00.000Z"),
		},
		{
			note_id: 4,
			subject: "Fourth test note!",
			content: "Here is some content",
			user_id: users[3].id,
			date_created: new Date("2020-01-01T00:00:00.000Z"),
		},
	];
}

function makeExpectedStatements(users, statements) {
	const user = users.find((user) => user.id === statements.user_id);

	return {
		statement_id: statements.statement_id,
		content: statements.content,
		date_created: new Date(statements.date_created.toISOString()),
		user_id: statements.user_id,
	};
}

function makeExpectedNotes(users, notes) {
	const user = users.find((user) => user.id === notes.user_id);
	return {
		note_id: notes.note_id,
		subject: notes.subject,
		content: notes.content,
		date_created: new Date(notes.date_created.toISOString()),
		user_id: notes.user_id,
	};
}

function makeMaliciousStatement(user) {
	const maliciousStatement = {
		statement_id: 911,
		date_created: new Date(),
		user_id: user.id,
		content: `Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt; Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
	};
	const expectedStatement = {
		...makeExpectedStatements([user], maliciousStatement),
		content: `Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt; Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
	};
	return {
		maliciousStatement,
		expectedStatement,
	};
}

function makeMaliciousNote(user) {
	const maliciousNote = {
		note_id: 911,
		date_created: new Date(),
		user_id: user.id,
		subject:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
		content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
	};
	const expectedNote = {
		...makeExpectedNotes([user], maliciousNote),
		subject:
			'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
		content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
	};
	return {
		maliciousNote,
		expectedNote,
	};
}

function makeFixtures() {
	const testUsers = makeUsersArray();
	const testStatements = makeStatementsArray(testUsers);
	const testNotes = makeNotesArray(testUsers);
	return { testUsers, testStatements, testNotes };
}

function cleanTables(db) {
	return db.transaction((trx) =>
		trx
			.raw(
				`TRUNCATE
        statements,
        notes,
        users
      `
			)
			.then(() =>
				Promise.all([
					trx.raw(
						`ALTER SEQUENCE statements_statement_id_seq minvalue 0 START WITH 1`
					),
					trx.raw(`ALTER SEQUENCE notes_note_id_seq minvalue 0 START WITH 1`),
					trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
					trx.raw(`SELECT setval('statements_statement_id_seq', 0)`),
					trx.raw(`SELECT setval('notes_note_id_seq', 0)`),
					trx.raw(`SELECT setval('users_id_seq', 0)`),
				])
			)
	);
}

function seedUsers(db, users) {
	const preppedUsers = users.map((user) => ({
		...user,
		password: bcrypt.hashSync(user.password, 1),
	}));
	return db
		.into("users")
		.insert(preppedUsers)
		.then(() =>
			// update the auto sequence to stay in sync
			db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
		);
}

function seedStatementsTables(db, users, statements) {
	// use a transaction to group the queries and auto rollback on any failure
	return db.transaction(async (trx) => {
		await seedUsers(trx, users);
		await trx.into("statements").insert(statements);
		// update the auto sequence to match the forced id values
		await trx.raw(`SELECT setval('statements_statement_id_seq', ?)`, [
			statements[statements.length - 1].statement_id,
		]);
	});
}

function seedNotesTables(db, users, notes) {
	// use a transaction to group the queries and auto rollback on any failure
	return db.transaction(async (trx) => {
		await seedUsers(trx, users);
		await trx.into("notes").insert(notes);
		// update the auto sequence to match the forced id values
		await trx.raw(`SELECT setval('notes_note_id_seq', ?)`, [
			notes[notes.length - 1].note_id,
		]);
	});
}

function seedMaliciousStatement(db, user, statement) {
	return seedUsers(db, [user]).then(() =>
		db.into("statements").insert([statement])
	);
}

function seedMaliciousNote(db, user, note) {
	return seedUsers(db, [user]).then(() => db.into("notes").insert([note]));
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
	const token = jwt.sign({ user_id: user.id }, secret, {
		subject: user.username,
		algorithm: "HS256",
	});
	return `Bearer ${token}`;
}

module.exports = {
	makeUsersArray,
	makeStatementsArray,
	makeNotesArray,
	makeExpectedStatements,
	makeExpectedNotes,
	makeMaliciousStatement,
	makeMaliciousNote,

	makeFixtures,
	cleanTables,
	seedStatementsTables,
	seedNotesTables,
	seedMaliciousStatement,
	seedMaliciousNote,
	makeAuthHeader,
	seedUsers,
};
