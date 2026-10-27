// 与 Go 路由一一对应的桩实现，保证前端可一键切换；后续可逐步替换为真实逻辑
const response = require('../response');
const taskService = require('../services/taskService');





module.exports = function stubRoutes(db, cfg, log) {
  return {
    episodeCharactersExtract: (req, res) => {
      const task = taskService.createTask(db, log, 'character_extraction', req.params.episode_id);
      setTimeout(() => taskService.updateTaskResult(db, task.id, { characters: [], count: 0 }), 100);
      response.success(res, { task_id: task.id });
    }
  };
};
