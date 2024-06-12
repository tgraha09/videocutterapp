import Cors from 'nextjs-cors';

const cors = Cors({
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  origin: '*',
  optionsSuccessStatus: 200,
  credentials: true,
});

export default cors;