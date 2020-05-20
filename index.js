const axios = require("axios").default;
const clipboardy = require("clipboardy");
require("dotenv").config();

const token = process.env.TODOIST_TOKEN;
const projectId = process.env.PROJECT_ID;

const getDailyCompletedTasks = async (projectId) => {
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const {
    data: { items },
  } = await axios.post("https://api.todoist.com/sync/v8/completed/get_all", {
    token,
    since,
    project_id: projectId,
  });

  return items.map((item) => item.task_id);
};

const getTaskInfo = (id) => {
  return axios.post("https://api.todoist.com/sync/v8/items/get", {
    token,
    item_id: id.toString(),
    all_data: false,
  });
};

const extractTaskContent = (responses) => {
  const fulfilledItems = responses.filter(
    (item) => item.status === "fulfilled"
  );
  return fulfilledItems
    .map((item) => item.value.data.item)
    .filter((item) => item.parent_id === null);
};

const copyContentToClipboard = (tasks) => {
  const taskContent = tasks.map((task) => `${task.content}`).join(", ");
  clipboardy.writeSync(taskContent);
};

const getData = async () => {
  try {
    const taskIds = await getDailyCompletedTasks(projectId);
    const responses = await Promise.allSettled(
      taskIds.map((id) => getTaskInfo(id))
    );
    const tasks = extractTaskContent(responses);
    copyContentToClipboard(tasks);
    console.log("Successfully copied tasks to the clipboard.");
  } catch (error) {
    console.error(error.message);
  }
};

getData();
