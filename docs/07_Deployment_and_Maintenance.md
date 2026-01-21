## Deployment Environment
- **Backend**: Node.js runtime; environment variables for `MONGODB_URI`, JWT secret, Chapa keys; exposed port default 5001.
- **Frontend**: Vite build output (`npm run build`) producing static assets for hosting on any static server or CDN.
- **Database**: MongoDB instance reachable by backend; ensure network access and authentication as configured.
- **File Storage**: Product images served from `backend/uploads/products`.

## Installation Steps
1. Clone repository and open workspace.
2. Run `npm run install:all` (installs root, then frontend, then backend dependencies).
3. Set environment variables (e.g., `.env` in backend) with `MONGODB_URI`, `JWT_SECRET`, Chapa credentials.
4. Start development: `npm run dev` (runs frontend and backend concurrently) or start backend only `cd backend && npm run start`; build frontend with `npm run build`.
5. Serve frontend build (`frontend/dist`) via static host or reverse proxy alongside API.

## Deployment Steps (Production)
1. Build frontend: `cd frontend && npm run build`; deploy `dist` to static hosting.
2. Configure process manager (e.g., PM2/systemd) to run `node server.js` in `backend`.
3. Set environment variables securely; configure HTTPS termination at load balancer or reverse proxy.
4. Map routes: `/api/*` to backend server; `/uploads` to backend static directory; `/` to frontend build.
5. Verify MongoDB connectivity and Chapa webhook accessibility (`/api/payments/verify` requires raw JSON).

## Maintenance Plan
- **Monitoring**: Track server logs; monitor MongoDB performance and disk usage; audit activity logs in admin UI.
- **Updates**: Use modular routes/models for iterative updates; lint frontend before deploy.
- **Data Hygiene**: Cancelled pending orders are removed; periodic cleanup of uploads and logs recommended.
- **Documentation**: Keep `.env` and deployment notes updated with key versions and endpoints.

## Backup & Recovery
- Perform scheduled MongoDB backups (e.g., `mongodump`); store off-site.
- Backup `uploads/products` directory to preserve images.
- Test restoration procedures on staging before production use.

## Scalability Considerations
- **Backend**: Stateless API allows horizontal scaling behind load balancer; ensure JWT secret consistency and shared uploads storage (or move to object storage).
- **Database**: Consider MongoDB replication for availability; optimize indexes (already present for notifications, comments, orders).
- **Frontend**: Static assets can be CDN-distributed; cache-busting handled by Vite build hashes.
