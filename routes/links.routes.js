const appRoutes = require('express').Router();
const controller=require('../controllers/controller')

appRoutes.post("/checkUser", controller.checkUser)
appRoutes.post("/importMachine", controller.importMachine)
appRoutes.post("/addUser", controller.addUser)
appRoutes.get("/getMachine", controller.getMachine)
appRoutes.get("/getTasks", controller.getTasks)
appRoutes.post("/deleteMachine", controller.deleteMachine)
appRoutes.post("/deleteTask", controller.deleteTask)
appRoutes.post("/updateTask", controller.updateTask)
appRoutes.post("/changeTime", controller.changeTime)
appRoutes.post("/logIn",controller.logIn)
appRoutes.post("/start", controller.start)
appRoutes.post("/stop", controller.stop)

module.exports = appRoutes;