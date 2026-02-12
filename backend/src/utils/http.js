export function notFound(res, message = 'Not found') {
  return res.status(404).json({ error: message });
}

export function badRequest(res, message = 'Bad request') {
  return res.status(400).json({ error: message });
}

export function serverError(res, error) {
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
}
