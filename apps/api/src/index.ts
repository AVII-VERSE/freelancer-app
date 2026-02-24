import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import templateRoutes from './routes/template.routes';
import proposalRoutes from './routes/proposal.routes';
import aiRoutes from './routes/ai.routes';
import recordRoutes from './routes/record.routes';
import timezoneRoutes from './routes/timezone.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/proposals', proposalRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/timezone', timezoneRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Freelancer API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});