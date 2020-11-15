const express = require("express");
const NotesService = require("./notes-service");
const { requireAuth } = require("../middleware/jwt-auth");

const notesRouter = express.Router();
const jsonBodyParser = express.json();

notesRouter
	.route("/")
	.all(requireAuth)
	.get((req, res, next) => {
		NotesService.getNotesForUser(req.app.get("db"), req.user.id)
			.then((notes) => {
				res.json(notes.map(NotesService.serializeNote));
			})
			.catch(next);
	})
	.post(jsonBodyParser, (req, res, next) => {
		for (const field of ["subject", "content"]) {
			if (!req.body[field]) {
				return res.status(400).send(`'${field}' is required`);
			}
		}

		const { subject, content } = req.body;
		const newNote = { subject, content };

		NotesService.insertNote(req.app.get("db"), newNote, req.user.id)
			.then((note) => {
				res
					.status(201)
					.location(`/api/notes/${note.note_id}`)
					.json(NotesService.serializeNote(note));
			})
			.catch(next);
	});

notesRouter
	.route("/:note_id")
	.all(requireAuth)
	.all(checkNoteExists)
	.get((req, res) => {
		res.json(NotesService.serializeNote(res.note));
	})
	.patch(jsonBodyParser, (req, res, next) => {
		const { subject, content } = req.body;
		if (subject == null || content == null) {
			const err = createError(404, "Must contain subject and content");
			return next(err);
		}

		const newNoteFields = {};
		if (subject) newNoteFields.subject = subject;
		if (content) newNoteFields.content = content;

		NotesService.updateNote(
			req.app.get("db"),
			req.params.note_id,
			newNoteFields,
			req.user.id
		)
			.then((note) => {
				if (note) {
					res.status(204).end();
				} else {
					const err = createError(404, "Not Found");
					return next(err);
				}
			})
			.catch(next);
	})
	.delete((req, res, next) => {
		const { note_id } = req.params;
		NotesService.deleteNote(req.app.get("db"), note_id, req.user.id)
			.then(() => {
				res.status(204).end();
			})
			.catch(next);
	});

/* async/await syntax for promises */
async function checkNoteExists(req, res, next) {
	try {
		const note = await NotesService.getById(
			req.app.get("db"),
			req.params.note_id,
			req.user.id
		);

		if (!note)
			return res.status(404).json({
				error: `Note doesn't exist`,
			});

		res.note = note;
		next();
	} catch (error) {
		next(error);
	}
}

module.exports = notesRouter;
