const xss = require("xss");

const NotesService = {
	getNotesForUser(db, user_id) {
		return db.select("*").where({ user_id }).from("notes");
	},

	getById(db, note_id, user_id) {
		return db.first("*").from("notes").where({ note_id, user_id });
	},
	insertNote(db, newNote, user_id) {
		newNote.user_id = user_id;
		return db
			.insert(newNote)
			.into("notes")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	deleteNote(db, note_id, user_id) {
		return db("notes").where({ note_id, user_id }).delete();
	},
	deleteDemoNotes(db, user_id) {
		return db("notes").where({ user_id }).delete();
	},
	updateNote(db, note_id, newNoteFields, user_id) {
		newNoteFields.user_id = user_id;
		return db("notes").where({ note_id, user_id }).update(newNoteFields);
	},

	serializeNote(note) {
		return {
			note_id: note.note_id,
			subject: xss(note.subject),
			content: xss(note.content),
			date_created: new Date(note.date_created),
			user_id: note.user_id,
		};
	},
};

module.exports = NotesService;
