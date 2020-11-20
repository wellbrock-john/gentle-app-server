# Gentle

## Gentle is an application geared towards providing a welcoming, comfortable, safe and secure platform for users to practice self-love, vent their frustrations or keep their mind clear of clutter through the use of a note storing feature. The goal of building this application was to create a space that would be 'trauma informed', as there are not many applications out there of this ilk.

```
Demo Account Credentials:
username: Demo
password: P@ssword1234
```

[Live Site](https://gentle-client.vercel.app/)

[Frontend Repo](https://github.com/wellbrock-john/gentle-app-client)

## [Backend Repo](https://github.com/wellbrock-john/gentle-app-server)

## API Documentation

- /api/auth
- - POST - login a user

- /api/users
- - POST - create/register a new user

- /api/positivestatements
- - GET - get statements by user
- - POST - save statements for a user

- /api/notes
- - GET - get notes by user
- - POST - save notes for a user

- /api/notes/:note_id
- - DELETE - delete a note by id

---

## Screenshots

### Landing Page

![Landing Page](https://user-images.githubusercontent.com/68931297/99815443-8d47f200-2b07-11eb-8931-fa25a75bd1ae.png)

```
When you get to the landing page, there are instructions for signing up, logging into your account or using the Demo account.
```

### Home Page

![Home Page](https://user-images.githubusercontent.com/68931297/99815962-49092180-2b08-11eb-91d9-60c24398df02.png)

```
The user's home page provides a simplistic layout where they can navigate to different features of the application. Those features include the "Vent" feature, the "Notes" feature and the "Treasures" feature.
```

### Vent It Page

![Vent It Page](https://user-images.githubusercontent.com/68931297/99816108-7655cf80-2b08-11eb-9a8e-8cc02cfbd86b.png)

```
The vent page allows a user to input text into the textarea provided. By pressing the 'Release' button, the user will be deleting the text. The button triggers a CSS animation and transition that displays the input in red and fades it to a new color while also fading the text into transparency.
```

### Note It Page

#### Without Notes

![Note It Page](https://user-images.githubusercontent.com/68931297/99816236-a1d8ba00-2b08-11eb-87e0-9611a5add34c.png)

```
To use the notes page a user must input a subject into the subject field and content into the text area. On save, they will see their new note rendered in a list under the text area.
```

#### With Notes

![Note It Page](https://user-images.githubusercontent.com/68931297/99816570-157ac700-2b09-11eb-81dc-e459e5e2815a.png)

### Treasures Page

#### Icon Not Clicked

![Treasures Page](https://user-images.githubusercontent.com/68931297/99817702-81a9fa80-2b0a-11eb-94ce-8f55981f917e.png)

```
On initial load of the treasures page, a user will see the above screen. When the user clicks the green icon, a list of their positive statement submissions (submitted on login) will be displayed. Example below.
```

#### Icon Clicked

![Treasures Page](https://user-images.githubusercontent.com/68931297/99817843-b027d580-2b0a-11eb-8ad0-b1d1a06fa139.png)

---

## Tech Stack

### React | Node.js | Express | PostgreSQL | SQL | JWT | HTML | CSS

---

```
Created by @wellbrock-john
```
