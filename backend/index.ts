import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from XistraCloud backend!');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // TODO: Implement real authentication logic here
  console.log('Login attempt:', { email, password });

  if (email) {
    const name = email.split('@')[0];
    res.json({ name, email });
  } else {
    res.status(400).send('Email is required');
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
