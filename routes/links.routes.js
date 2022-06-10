const appRoutes = require('express').Router();
const controller=require('../controllers/controller')

appRoutes.post("/importMachine", controller.importMachine)
appRoutes.get("/test", controller.test)
appRoutes.post("/importTasks", controller.importTasks)
appRoutes.get("/getMachine", controller.getMachine)
appRoutes.get("/getTasks", controller.getTasks)
appRoutes.post("/deleteMachine", controller.deleteMachine)
appRoutes.post("/deleteTask", controller.deleteTask)
appRoutes.post("/updateTask", controller.updateTask)
appRoutes.post("/changeTime", controller.changeTime)

module.exports = appRoutes;