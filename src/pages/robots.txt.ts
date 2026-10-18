import type { APIRoute } from 'astro';
import { isiRobots } from '../lib/robots';

// Selama prototipe semua ditolak. Hanya build --mode final yang boleh diindeks.
export const GET: APIRoute = ({ site }) =>
  new Response(isiRobots(import.meta.env.MODE, site!), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
