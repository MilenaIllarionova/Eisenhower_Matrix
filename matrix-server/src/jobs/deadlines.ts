import cron from 'node-cron';
import { Task } from '../models';
import { createNotification } from '../services/notification.service';

/**
 * Порог уведомлений: за 24 часа, за 2 часа, в момент дедлайна (0 часов).
 * Чтобы не слать дубли — храним окно ±15 минут от каждого порога.
 */
const THRESHOLDS_MS = [
  { label: '24 часа', ms: 24 * 60 * 60 * 1000 },
  { label: '2 часа',  ms:  2 * 60 * 60 * 1000 },
  { label: '0 часов', ms:  0 },
];

const WINDOW_MS = 15 * 60 * 1000; // ±15 минут

async function checkDeadlines() {
  const now = Date.now();

  for (const threshold of THRESHOLDS_MS) {
    const targetTime = now + threshold.ms;
    const from = new Date(targetTime - WINDOW_MS);
    const to   = new Date(targetTime + WINDOW_MS);

    const tasks = await Task.find({
      deadline:  { $gte: from, $lte: to },
      deletedAt: null,
      status:    { $nin: ['done'] },
    });

    for (const task of tasks) {
      const recipients = new Set<string>();

      if (task.assigneeId) recipients.add(task.assigneeId.toString());
      if (task.createdBy)  recipients.add(task.createdBy.toString());

      const message =
        threshold.ms === 0
          ? `Дедлайн задачи «${task.title}» наступил прямо сейчас!`
          : `До дедлайна задачи «${task.title}» осталось ${threshold.label}`;

      for (const userId of recipients) {
        try {
          await createNotification({
            userId,
            type:   'task_deadline_soon',
            message,
            taskId: task.id,
            teamId: task.teamId?.toString(),
          });
        } catch (err) {
          console.error(`[deadlines] ошибка уведомления userId=${userId}:`, err);
        }
      }
    }
  }
}

/**
 * Запускает cron-задачу: каждые 30 минут.
 */
export function startDeadlineJob() {
  console.log('[deadlines] cron запущен (каждые 30 минут)');

  cron.schedule('*/30 * * * *', async () => {
    console.log('[deadlines] проверка дедлайнов:', new Date().toISOString());
    try {
      await checkDeadlines();
    } catch (err) {
      console.error('[deadlines] ошибка при проверке:', err);
    }
  });
}