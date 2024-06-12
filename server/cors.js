import Cors from 'nextjs-cors';

const cors = Cors({
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  origin: 'http://localhost',
  optionsSuccessStatus: 200,
  credentials: true,
});

export default cors;