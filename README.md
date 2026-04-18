| **Internal Release Code** | Date Released | 
| --- | --- |
KH.010.000 | 2025-02-27 |

## Knowledge Hub

Luminary, under the code name Knowledge Hub is a web-based platform for enthusiasts of books to be provided a wide digital library. It provides a hub for them to engage in a convenient reading experience as well as exchange their thoughts in a dedicated discussion room. It is built using Next.JS for the Frontend and ExpressJS with MongoDB and Google Cloud Platform for the backend/database. 

## KH.010.000 Release Notes
- First commit
- Initialized Next.JS Project using npm install create-next-app.
- Initialized with TypeScript, TailwindCSS, App Router and ESLInt.

## KH.010.001 Release Notes
- Initialize ExpressJS App using npx install express
- Implement routes for each schema in the database.
- Implement mongoose models for each schema in the database.
- Implement controllers for each schema in the database.
- The controllers implemented CRUD operations for the following models: 
- - Books 
- - Users
- - Authors
- - Bookmarks
- - Reviews 
- - Notes

Known Issues:

- Proper error middleware is not implemented.
- Authorization is not complete.

## KH.010.002 Release Notes

- Implement authentication using generation of JWT access tokens stored in Cookies and JWT refresh tokens stored in the database.

- Authorization middleware implemented for specific routes.

Known Issues:

- Proper error-handling middleware is not implemented.
- Google OAuth Authentication incomplete.
- JWT authentication implemented is primitive, no proper verification of E-mail on Sign-up.

Plans for Future Updates:

- Implement routes and controllers handling Gemini API for smart annotation.


Important Links:

- Backend Repo: https://github.com/EricStratosphere/luminary-backend.git
- Design Specs: https://github.com/EricStratosphere/Knowledge-Hub-docportal.git
- Team Members:
- - Ynigo Nino C. Ramas
- - John Patrick Y. Aranez
- Tech Stack:
- - Frontend: NextJS
- - Backend: ExpressJS (MongoDB + GCP)