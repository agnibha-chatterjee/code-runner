clientdev:
	cd client && pnpm dev

serverdev:
	fastapi dev server/app.py --port 3000

clientprod:
	cd client && pnpm build && sleep 4 && pnpm preview

serverprod:
	fastapi run server/app.py --port 3000

dev: serverdev clientdev 

prod: serverprod clientprod
	