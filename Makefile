clientdev:
	cd client && pnpm dev

serverdev:
	fastapi dev server/app.py

dev: serverdev clientdev 
	