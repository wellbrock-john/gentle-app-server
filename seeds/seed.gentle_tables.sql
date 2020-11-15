BEGIN;
TRUNCATE
    statements,
    notes,
    users
    RESTART IDENTITY CASCADE;
INSERT INTO users (username, full_name, nickname, password, email)
VALUES
  ('dunder', 'Dunder Mifflin', null, 'password', 'fake@not-email.com'),
  ('b.deboop', 'Bodeep Deboop', 'Bo', 'bo-password', 'fake1@not-email.com'),
  ('c.bloggs', 'Charlie Bloggs', 'Charlie', 'charlie-password', 'fake2@not-email.com'),
  ('s.smith', 'Sam Smith', 'Sam', 'sam-password', 'fake3@not-email.com'),
  ('lexlor', 'Alex Taylor', 'Lex', 'lex-password', 'fake4@not-email.com'),
  ('wippy', 'Ping Won In', 'Ping', 'ping-password', 'fake5@not-email.com');

INSERT INTO statements (user_id, content)
VALUES
    (1, 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'),
    (1, 'Test content here'),
    (2, 'More test content'),
    (2, 'The last of it');

INSERT INTO notes (user_id, subject, content)
VALUES
    (1, 'Note Subject 1', 'Note Content 1'),
    (2, 'Note Subject 2', 'Note Content 2'),
    (1, 'Note Subject 3', 'Note Content 3'),
    (1, 'Note Subject 4', 'Note Content 4');

COMMIT;