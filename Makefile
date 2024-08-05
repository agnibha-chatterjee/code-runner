clientdev:
	cd client && pnpm dev

serverdev:
	fastapi dev server/app.py --port 3000

dev: serverdev clientdev 
	